/**
 * Shared material-selection contract.
 *
 * `MaterialOption` is the single shape every searchable material takes across
 * parent modules, the search utility, and the SearchableSelect component.
 * The mapper below is the ONLY place responsible for building `label` and
 * `searchText` from an inventory record — modules must not construct options
 * inline.
 */

export interface MaterialOption {
  /** Inventory record id. Persisted by parents as `inventory_id`. */
  id: string | number;
  /** Human-readable text shown in the dropdown. Never normalized. */
  label: string;
  /** Text used for matching/ranking. Normalized by the search utility. */
  searchText: string;
  /**
   * Optional reference text rendered beside the label (e.g. last vendor invoice rate).
   * Deliberately kept out of `searchText` so typing a price can never match an item.
   * Omitted entirely when a module supplies no secondary value, leaving those options
   * byte-identical to what they were before this field existed.
   */
  secondaryLabel?: string;
}

/** Minimal shape of an inventory record consumed by the mapper. */
export interface InventoryRecord {
  id: string | number;
  item_name: string;
  unit?: string;
}

/**
 * Convert a single inventory record into a MaterialOption.
 *
 * `label` preserves the existing display format (`item_name (unit)`), and
 * `searchText` currently mirrors it so the matchable surface is unchanged.
 * Future search inputs (codes, aliases, brands) are added to `searchText`
 * here — never in the component.
 *
 * `secondaryLabel` is optional reference text only; it never reaches `searchText`.
 */
export function toMaterialOption(item: InventoryRecord, secondaryLabel?: string): MaterialOption {
  const label = `${item.item_name} (${item.unit})`;
  const option: MaterialOption = {
    id: item.id,
    label,
    searchText: label,
  };
  if (secondaryLabel) option.secondaryLabel = secondaryLabel;
  return option;
}

/**
 * Convert a list of inventory records into MaterialOptions.
 *
 * `getSecondaryLabel` is optional. Callers that omit it get exactly the options they
 * got before secondary text existed, so modules sharing this mapper are unaffected.
 */
export function toMaterialOptions(
  items: InventoryRecord[],
  getSecondaryLabel?: (item: InventoryRecord) => string | undefined
): MaterialOption[] {
  return items.map((item) => toMaterialOption(item, getSecondaryLabel?.(item)));
}
