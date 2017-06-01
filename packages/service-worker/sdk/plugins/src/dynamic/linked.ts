/**
 * A node in in the linked list, with references to the next and previous nodes.
 *
 * @experimental
 */
export interface Node<T> {
  /**
   * Value stored in this node.
   */
  value: T;

  /**
   * Next node in the chain, if any.
   */
  next: Node<T>|null;

  /**
   * Previous node in the chain, if any.
   */
  prev: Node<T>|null;
}

/**
 * A function which compares two values, returning the usual -1, 0, or 1.
 *
 * @experimental
 */
export type CompareFn<T> = (a: T, b: T) => number;

/**
 * A linked list of items kept in sorted order, according to the given
 * comparison function.
 *
 * Inserting and removing are O(n), the pop() operation is O(1).
 *
 * @experimental
 */
export class SortedLinkedList<T> {
  /**
   * Create a new, empty list with the given comparison function.
   */
  constructor(public compare: CompareFn<T>) {}

  /**
   * Head of the list, which is null if there are no elements.
   */
  head: Node<T>|null = null;

  /**
   * Tail of the list, which is null if there are no elements.
   */
  tail: Node<T>|null = null;

  /**
   * Tracks the current length of the list.
   */
  length: number = 0;

  /**
   * Insert a new element in a position determined by the
   * comparison function.
   *
   * This is O(n).
   */
  insert(value: T): void {
    // No matter what, inserting will increase the length by one.
    this.length++;

    // Special case insertion into an empty list.
    if (this.head === null) {
      // The head and tail will be the same node, which will have
      // no siblings.
      this.head = this.tail = {value, next: null, prev: null};
      return;
    }

    // Scan through the list until `curr` becomes the node after the
    // point where `value` is to be inserted.
    let curr: Node<T>|null = this.head;
    while (curr !== null) {
      const cmp = this.compare(value, curr.value);
      if (cmp <= 0) {
        // `value` must be inserted before `curr`.
        // At this point though, `curr` could still be at the head
        // of the list, which means that `value` should be the new
        // head.
        if (curr.prev === null) {
          // `curr` is indeed the current head. Construct a new node
          // for `value` which has its next sibling as the current
          // head, and assign it to the current head's previous
          // sibling reference and also to the list head reference
          // in one assignment statement.
          // In other words, go from:
          //   curr <-> ...
          // to:
          //   N(value) <-> curr <-> ...
          this.head = this.head.prev = {value, next: this.head, prev: null};
        } else {
          // `curr` is in the middle of the list, so split `curr` and
          // `curr.prev` and insert the new node in between.
          // In other words, go from:
          //   ... <-> prev <-> curr <-> ...
          // to:
          //   ... <-> prev <-> N(value) <-> curr <-> ...
          curr.prev = curr.prev.next = {value, next: curr, prev: curr.prev};
        }
        // New value has been inserted successfully.
        return;
      }

      // Keep iterating through the list until the end is reached or
      // the value is inserted.
      curr = curr.next;
    }

    // Off the end of the list. This means the value belongs after
    // the list tail.
    // Construct the new node to go after the tail, and assign it in
    // one statement.
    // In other words, go from:
    //   ... <-> tail
    // to:
    //   ... <-> tail <-> N(value)
    this.tail = this.tail !.next = {value, next: null, prev: this.tail};
  }

  /**
   * Remove a value from the list.
   *
   * This is O(n).
   */
  remove(value: T): void {
    // Start at the head of the list and scan through until the
    // value is found or the end of the list is reached.
    let curr = this.head;
    while (curr !== null) {
      // Check the current node to see if it's the one which
      // contains `value.
      if (curr.value === value) {
        // Found it. To remove it, splice prev and next together,
        // if they're set. If they're not, then special logic is
        // needed to handle removes at the head and tail of the
        // list. This splice happens in two steps - the first
        // fixes the pointers in the `prev` direction, the second
        // fixes them in the `next` direction.

        // If the previous node is set, set the pointer from
        // the previous node to skip over `curr`.
        if (curr.prev !== null) {
          curr.prev.next = curr.next;
        } else {
          // The current node is actually the head (no previous
          // sibling) so set the new head to be the next node.
          // The new head's previous pointer also needs to be
          // fixed (set to null).
          this.head = curr.next;
          // There may not be a new head if `curr` was also the
          // tail.
          if (this.head !== null) {
            // Fix the new head's previous pointer.
            this.head.prev = null;
          }
        }

        // If the next node is set, set the pointer from the
        // next node back to skip over `curr` in the `prev`
        // direction.
        if (curr.next !== null) {
          curr.next.prev = curr.prev;
        } else {
          // The current node is actually the tail (no next
          // sibling, so set the new tail to be the previous
          // node. The new tail's next pointer also needs to be
          // fixed (set to null).
          this.tail = curr.prev;
          // There may not be a new tail if `curr` was also the
          // head.
          if (this.tail !== null) {
            // Fix the new tail's next pointer.
            this.tail.next = null;
          }
        }

        // The node has now been removed, so decrement the
        // length to reflect that.
        this.length--;
        return;
      }

      // Keep iterating through the list.
      curr = curr.next;
    }
    // Ran off the end of the list, but the value wasn't found.
    // This is not an error.
  }

  /**
   * Remove and return the head of the list, or return `null`
   * if the list is empty.
   */
  pop(): T|null {
    // If the list is empty, there will be no head node, so
    // check that condition first.
    if (this.head === null) {
      return null;
    }
    // The list is not empty, so go ahead and decrement length
    // to reflect the removal that's about to happen.
    this.length--;

    // Grab the value out of the current head before we remove it.
    const value = this.head.value;

    // In the special case that the list only has one item, set
    // head and tail to null to put the list into an empty state.
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
      return value;
    }

    // this.head.next is guaranteed to be non-null since the special
    // case above was not triggered, so it becomes the new head.
    this.head.next !.prev = null;
    this.head = this.head.next;
    return value;
  }
}
