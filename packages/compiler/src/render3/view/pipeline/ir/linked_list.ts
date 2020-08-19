/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A node in an intrinsic doubly linked list, of type `T`.
 */
export interface LinkedListNode<T extends LinkedListNode<T>> {
  next: T|null;
  prev: T|null;
}

/**
 * An intrinsic doubly linked list, which stores nodes of type `T`.
 */
export class LinkedList<T extends LinkedListNode<T>> {
  /**
   * Head of the list, or `null` if the list is empty.
   */
  head: T|null = null;

  /**
   * Tail of the list, or `null` if the list is empty.
   */
  tail: T|null = null;

  /**
   * Insert a new node (`insert`) before another (`before`).
   */
  insertBefore(before: T, insert: T): void {
    assertNodeIsDetached(insert);

    if (this.head === before) {
      this.head = insert;
    }

    insert.prev = before.prev;
    insert.next = before;

    if (before.prev !== null) {
      before.prev.next = insert;
    }
    before.prev = insert;
  }

  /**
   * Insert a new node (`insert`) after another (`before`).
   */
  insertAfter(after: T, insert: T): void {
    assertNodeIsDetached(insert);

    if (this.tail === after) {
      this.tail = insert;
    }

    insert.prev = after;
    insert.next = after.next;

    if (after.next !== null) {
      after.next.prev = insert;
    }
    after.next = insert;
  }

  /**
   * Append the given node at the tail of the list.
   */
  append(node: T): void {
    assertNodeIsDetached(node);

    if (this.tail !== null) {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    } else {
      this.head = node;
      this.tail = node;
    }
  }

  /**
   * Splice in a new list of nodes before the head of this one.
   */
  prependList(list: LinkedList<T>): void {
    if (list.tail === null || list.head === null) {
      return;
    } else if (this.head === null) {
      this.head = list.head;
      this.tail = list.tail;
      return;
    }

    this.head.prev = list.tail;
    list.tail.next = this.head;
    this.head = list.head;
  }

  /**
   * Remove the given node from the list and return it.
   *
   * This operation clears the `prev` and `next` pointers of the node. Therefore it's safe to
   * reinsert the node later.
   */
  remove(node: T): T|null {
    const next = node.next;

    if (this.head === node) {
      this.head = node.next as T;
      if (this.tail === node) {
        this.tail = node.next as T;
      }
    } else if (node.prev !== null) {
      node.prev.next = node.next;
      if (this.tail === node) {
        this.tail = node.prev as T;
      } else if (node.next !== null) {
        node.next.prev = node.prev;
      } else {
        throw new Error('AssertionError: non-tail node has null next pointer');
      }
    } else {
      throw new Error('AssertionError: non-head node has null prev pointer');
    }

    node.prev = null;
    node.next = null;

    return next as T;
  }

  /**
   * Apply a transformation operation to all of the nodes in the list.
   */
  applyTransform(transform: Transform<T>): void {
    if (transform.visitList !== undefined) {
      transform.visitList(this);
    }
    if (transform.visit !== undefined) {
      let node = this.head;
      while (node !== null) {
        node = transform.visit(node, this) as T;

        // Need to ensure:
        // - if node is at the beginning, this.head is updated
        // - if node is at the end, this.tail is updated
        // - node.next.prev is node
        // - node.prev.next is node
        if (node.prev !== null) {
          node.prev.next = node;
        } else {
          this.head = node;
        }

        if (node.next !== null) {
          node.next.prev = node;
        } else {
          this.tail = node;
        }

        node = node.next as T;
      }
    }
    if (transform.finalize !== undefined) {
      transform.finalize();
    }
  }

  /**
   * Sort the nodes from `start` to `end`, using `cmp` to compare.
   *
   * Returns the new `start` and `end` nodes, which are guaranteed to be nodes within the original
   * range.
   *
   * The algorithm in use is an in-place insertion sort.
   */
  sortSubset(start: T, end: T, cmp: (a: T, b: T) => number): {start: T, end: T} {
    if (start === end) {
      return {start, end};
    }

    // Track the new start/end nodes as the sort progresses.
    let tmpStart = start;
    let tmpEnd = start;

    // Temporary assignment - will be overwritten with `start.next` as soon as the loop begins.
    let node = start;

    // Safe because there are at least two nodes, otherwise the `start === end` check above would
    // have caused an early return.
    let next: T = start.next!;

    // The single-node special case was handled above, so there is at least one node to process (the
    // end node).
    //
    // This loop body therefore always executes at least once, at which point the while condition
    // will exit the loop if the last node processed was the ending node.
    do {
      // Advance the node to the next one to process, and capture its `next` pointer now since it
      // can change as the sort progresses.
      node = next;
      // Safe because either:
      // 1) this is the first iteration, which guarantees there are at least two nodes due to the
      //    `start !== end` check above, or
      // 2) the loop condition `node !== end` was true, meaning there is a next node.
      next = node.next!;

      // Remove node from its current position.
      this.remove(node);

      // Look through the already sorted part of the subset (from `tmpStart` up until `next`) and
      // check if the node belongs before any of the previously sorted nodes.
      let inserted = false;
      // `pos.next!` is safe here because `tmpStart` is always before `pos` and thus there is always
      // a node after `pos`.
      for (let pos = tmpStart; pos !== next; pos = pos.next!) {
        if (cmp(node, pos) < 0) {
          // Yes, the node belongs before `pos`. Insert it there.
          this.insertBefore(pos, node);

          // If `pos` was the beginning, then the current node is now the new beginning.
          if (pos === tmpStart) {
            tmpStart = node;
          }

          inserted = true;
          break;
        }
      }

      // Handle the case where the node didn't fit before any prior nodes.
      if (!inserted) {
        // The node belongs in its original position. How it gets put back there depends on whether
        // it was the tail end of the list or not.
        if (next !== null) {
          this.insertBefore(next, node);
        } else {
          this.append(node);
        }

        // This node is now the tail end of the "sorted" segment.
        tmpEnd = node;
      }
    } while (node !== end);

    // At this point, `tmpStart` and `tmpEnd` are the correct head/tail pointers of the now-sorted
    // segment of the list.
    return {start: tmpStart, end: tmpEnd};
  }

  /**
   * Stringify the list for debugging purposes.
   */
  toString(printer: (node: T) => string): string {
    const strings: string[] = [];
    for (const node of this) {
      strings.push(printer(node));
    }
    return strings.join('\n');
  }

  /**
   * Generator function implementation of the iterator protocol, which allows `LinkedList`s to be
   * used in for-of loops.
   */
  * [Symbol.iterator](): Iterator<T> {
    for (let node = this.head; node !== null; node = node.next) {
      yield node;
    }
  }
}

/**
 * A transformation which can be applied to a `LinkedList` and its nodes.
 *
 * As part of the transformation, nodes within the list can be mutated, which can result in nodes
 * being removed, replaced, or added during the transformation.
 *
 * Transformations run in 3 stages, all of which are optional:
 *
 * * First, the transformer gets an opportunity to visit the list as a whole. This can be useful if
 *   a certain transformation requires out-of-order iteration of the list.
 * * Next, the transformer can visit each node individually, and can mutate or replace it.
 * * Once iteration is complete, a `finalize` method allows the transformer to perform any cleanup
 *   work after all the nodes have been processed.
 *
 * See the individual method descriptions for specifics.
 */
export interface Transform<T extends LinkedListNode<T>> {
  /**
   * Process the entire list at once.
   *
   * This method is useful if a transformer needs to iterate the nodes and process them in a
   * different order than the normal node visitor would use.
   */
  visitList?(list: LinkedList<T>): void;

  /**
   * Visit a node in the list and return its replacement.
   *
   * This method allows a transformer to examine each node individually, and return a replacement.
   * Replacing a node is subject to several constraints:
   *
   * `node.prev` and `node.next` of the replacement node will be honored, and the list state updated
   * to reflect these changes. This means that `node.prev` must point to a chain of nodes that
   * terminates in the list head, and `node.next` must point to a chain of nodes that terminates in
   * the list tail.
   *
   * Of course, if the node being replaced is the head, then `node.prev` must terminate in `null`.
   * The same goes for replacing the tail and `node.next`.
   *
   * It is not necessary to update `node.prev.next` or `node.next.prev` as the `LinkedList` will
   * apply such changes automatically. This makes it easy to replace one node with a single other
   * node simply by copying its `prev` and `next` pointers into the new node.
   *
   * It _is_ possible to corrupt the `LinkedList` with improper manipulation of nodes during
   * transforms, so exercise caution when replacing nodes this way.
   */
  visit?(node: T, list: LinkedList<T>): T;

  /**
   * Called when all nodes have been visited and the transformation is otherwise complete.
   */
  finalize?(): void;
}

/**
 * Throw an error if the given `node` does not have empty `prev` and `next` pointers.
 */
function assertNodeIsDetached<T extends LinkedListNode<T>>(node: LinkedListNode<T>): void {
  if (node.prev !== null || node.next !== null) {
    throw new Error(`AssertionError: attempt to insert a non-empty ${
        Object.getPrototypeOf(node).constructor.name} node in a LinkedList`);
  }
}
