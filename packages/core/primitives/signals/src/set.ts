export interface LiteSet<T extends Object> extends Array<T> {
  __isLiteSet: true;
}

/** Create an instance of a LiteSet. */
export function createLiteSet<T extends Object>(): LiteSet<T> {
  const set = [] as unknown as LiteSet<T>;
  return set;
}

/** Add an item to the LiteSet. No-op if the item is already in the set. */
export function addToLiteSet<T extends Object>(set: LiteSet<T>, item: T): void {
  // TODO: check for NaN?
  if (set.indexOf(item) === -1) {
    set.push(item);
  }
}

/** Remove an item to the LiteSet. No-op if the item isn't in the set. */
export function removeFromLiteSet<T extends Object>(set: LiteSet<T>, item: T): void {
  const index = set.indexOf(item);
  if (index === -1) return;


  const lastIndex = set.length - 1;
  if (index !== lastIndex) {
    // Swap the last item into the deleted position
    set[index] = set[lastIndex];
  }

  // Truncate the array
  set.length--;
}

/**
 * Empty the set. This will leave some stale index tracking props on the objects
 */
export function clearLiteSet<T extends Object>(set: LiteSet<T>): void {
  set.length = 0;
}

