const SET_ID = Symbol('SET_ID');

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
   * A hidden identifier for this instance of the set. Used to key the
   * information stored on the set's items.
   */
  [SET_ID]: number;
}

interface LiteSetItem {
  /**
   * Key where we store the index the item is at on a given set.
   * Example: {'__idx_for_set_3': 1} Stored in set with ID 3 in 1th position.
   */
  [index: `__idx_for_set_${number}`]: number | undefined;
}

let nextSetId = 0;

/** Create an instance of a LiteSet. */
export function createLiteSet<T extends Object>(): LiteSet<T> {
  const set = [] as unknown as LiteSet<T>;
  set[SET_ID] = nextSetId++;
  return set;
}

function indexOf<T extends Object>(set: LiteSet<T>, item: T): number | undefined {
  return (item as unknown as LiteSetItem)[`__idx_for_set_${set[SET_ID]}`];
}

/** Add an item to the LiteSet. No-op if the item is already in the set. */
export function addToLiteSet<T extends Object>(set: LiteSet<T>, item: T): void {
  if (indexOf(set, item) === undefined) {
    const index = set.push(item) - 1;
    (item as unknown as LiteSetItem)[`__idx_for_set_${set[SET_ID]}`] = index;
  }
}

/** Remove an item to the LiteSet. No-op if the item isn't in the set. */
export function removeFromLiteSet<T extends Object>(set: LiteSet<T>, item: T): void {
  const index = indexOf(set, item);
  if (index === undefined) return;

  const liteSetItem = item as unknown as LiteSetItem;

  // Cleanup the stored index on the item.
  delete (set[index] as unknown as LiteSetItem)[`__idx_for_set_${set[SET_ID]}`];

  const lastIndex = set.length - 1;
  if (index !== lastIndex) {
    // Swap the last item into the deleted position
    set[index] = set[lastIndex];
    (set[index] as unknown as LiteSetItem)[`__idx_for_set_${set[SET_ID]}`] = index;
  }

  // Truncate the array
  set.length--;
}

/**
 * Empty the set. This will leave some stale index tracking props on the objects
 */
export function clearLiteSet<T extends Object>(set: LiteSet<T>): void {
  set.length = 0;
  // TODO: potential memory leak on the items themselves...
}

