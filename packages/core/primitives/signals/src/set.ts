export interface LiteSet<T extends Object> extends Array<T> {
  __isLiteSet: true;
}

const offset = 0;

/** Create an instance of a LiteSet. */
export function createLiteSet<T extends Object>(): LiteSet<T> {
  const set = [0, 0, 0, 0, 0, 0, 0, 0] as any;
  return set;
}

/** Add an item to the LiteSet. No-op if the item is already in the set. */
export function addToLiteSet<T extends Object>(set: LiteSet<T>, item: T): void {
  if (!bloomHas(set, item) || set.indexOf(item, 8) === -1) {
    set.push(item);
    bloomAdd(set, item);
  }
}

/** Remove an item to the LiteSet. No-op if the item isn't in the set. */
export function removeFromLiteSet<T extends Object>(set: LiteSet<T>, item: T): void {
  if (!bloomHas(set,item)) return;

  const index = set.indexOf(item, 8);
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
export function clearLiteSet<T extends Object>(set: any): void {
  set.length = 8;
  set[0] = set[1] = set[2] = set[3] = set[4] = set[5] = set[6] = set[7] = 0;
}

/**
 * The number of slots in each bloom filter (used by DI). The larger this number, the fewer
 * directives that will share slots, and thus, the fewer false positives when checking for
 * the existence of a directive.
 */
const BLOOM_SIZE = 256;
const BLOOM_MASK = BLOOM_SIZE - 1;

/**
 * The number of bits that is represented by a single bloom bucket. JS bit operations are 32 bits,
 * so each bucket represents 32 distinct tokens which accounts for log2(32) = 5 bits of a bloom hash
 * number.
 */
const BLOOM_BUCKET_BITS = 5;

let nextId = 0;
let ITEM_ID = '__item_id__'


function bloomAdd<T extends Object>(set: LiteSet<T>, type: T): void {
  let id: number|undefined;
  if (type.hasOwnProperty(ITEM_ID)) {
    id = (type as any)[ITEM_ID];
  }

  // Set a unique ID on the directive type, so if something tries to inject the directive,
  // we can easily retrieve the ID and hash it into the bloom bit that should be checked.
  if (id == null) {
    id = (type as any)[ITEM_ID] = nextId++;
  }

  // We only have BLOOM_SIZE (256) slots in our bloom filter (8 buckets * 32 bits each),
  // so all unique IDs must be modulo-ed into a number from 0 - 255 to fit into the filter.
  const bloomHash = id & BLOOM_MASK;

  // Create a mask that targets the specific bit associated with the directive.
  // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
  // to bit positions 0 - 31 in a 32 bit integer.
  const mask = 1 << bloomHash;

  // Each bloom bucket in `tData` represents `BLOOM_BUCKET_BITS` number of bits of `bloomHash`.
  // Any bits in `bloomHash` beyond `BLOOM_BUCKET_BITS` indicate the bucket offset that the mask
  // should be written to.
  (set as unknown as number[])[bloomHash >> BLOOM_BUCKET_BITS] |= mask;
}

function bloomHas<T extends Object>(set: LiteSet<T>, type: T): boolean {
  // TODO: check if it has id
  const bloomHash = (type as any)[ITEM_ID];
  const mask = 1 << bloomHash;
  const value = (set as unknown as number[])[bloomHash >> BLOOM_BUCKET_BITS];
  return !!(value & mask);
}
