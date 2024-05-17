const ITEM_ID = Symbol('ITEM_ID');

/**
 * A simplified alternate implementation of a Set implemented with a single
 * Array. It's expensive to allocate objects on the hot path, and Sets are much
 * slower to create and use than Arrays. To work with a single array, LiteSet
 * stashes information on hidden props on the array items themselves.
 *
 * NOTE: This also assumes that the item objects isn't used as a dict (since
 * the index would appear in things like Object.keys).
 *
 * Use the functions below to manipulate the set. Read from the set with
 * standard indexing syntax.
 */
export interface LiteSet<T extends Object> extends Array<T> {
  /**
   * Key where we store the index the item is at. Sort of makes a reverse map from item to index.
   */
  idxMap: {[id: number]: number; length: number};
  [index: `__idx_for_item_${number}`]: number | undefined;
}

interface LiteSetItem {
  /**
   * A hidden globally unique identifier for any item used with LiteSets. Used
   * to key the index reverse map on the set.
   * NOTE: LiteSet doesn't make any effort to clean this up on items!
   */
  [ITEM_ID]: number;
}

let nextItemId = 0;

/** Create an instance of a LiteSet. */
export function createLiteSet<T extends Object>(): LiteSet<T> {
  const set = [] as unknown as LiteSet<T>;
  set.idxMap = [];
  return set;
}

function indexOf<T extends Object>(set: LiteSet<T>, item: T): number | undefined {
  const liteSetItem = item as unknown as LiteSetItem;
  return set.idxMap[liteSetItem[ITEM_ID]];
}

/** Add an item to the LiteSet. No-op if the item is already in the set. */
export function addToLiteSet<T extends Object>(set: LiteSet<T>, item: T): void {
  if (indexOf(set, item) === undefined) {
    const index = set.push(item) - 1;
    const liteSetItem = item as unknown as LiteSetItem;
    liteSetItem[ITEM_ID] ??= nextItemId++;
    set.idxMap[liteSetItem[ITEM_ID]] = index;
  }
}

/** Remove an item to the LiteSet. No-op if the item isn't in the set. */
export function removeFromLiteSet<T extends Object>(set: LiteSet<T>, item: T): void {
  const index = indexOf(set, item);
  if (index === undefined) return;

  const liteSetItem = item as unknown as LiteSetItem;

  // Cleanup the stored index on the item.
  delete set.idxMap[liteSetItem[ITEM_ID]];

  const lastIndex = set.length - 1;
  if (index !== lastIndex) {
    // Swap the last item into the deleted position
    set[index] = set[lastIndex];
    set.idxMap[(set[index] as unknown as LiteSetItem)[ITEM_ID]] = index;
  }

  // Truncate the array
  set.length--;
}

/**
 * Empty the set. This will leave some stale index tracking props on the objects
 */
export function clearLiteSet<T extends Object>(set: LiteSet<T>): void {
  // o_o will this really work with sparse arrays?
  set.length = 0;
  set.idxMap.length = 0;
}
