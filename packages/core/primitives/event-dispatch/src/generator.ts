/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Contains the generic interface for iterating over the dom path
 * an event has traveled. These generators are meant to be singletons so you
 * should not construct them yourself. You should use the static factory method
 * getGenerator instead.
 */

import {Property} from './property';

/** */
export interface Generator {
  /** @return The next element in the generator or null if none found. */
  next(): Node|null;
}

/**
 * Constructs a generator of all the ancestors of an element.
 * @unrestricted
 */
export class Ancestors implements Generator {
  /**
   * @param target the element to start walking ancestors at
   * @param container the element to stop walking ancestors at
   */
  constructor(
      private target: Node|null = null,
      private container: ParentNode|null = null,
  ) {}

  /**
   * Resets an ancestors generator of an element with a new target and
   * container.
   * @param target the element to start walking ancestors at.
   * @param container the element to stop walking ancestors at.
   */
  reset(target: Node, container: ParentNode): Generator {
    this.target = target;
    this.container = container;
    return this;
  }

  next(): Node|null {
    // Walk to the parent node, unless the node has a different owner in
    // which case we walk to the owner.
    const curr = this.target;
    if (this.target && this.target !== this.container) {
      this.target = this.target[Property.OWNER] || this.target.parentNode;
    } else {
      this.target = null;
    }

    return curr;
  }
}

/**
 * Constructs a generator of all elements in a path array.
 * Correctly handles Property.OWNER on elements.
 * @unrestricted
 */
export class EventPath implements Generator {
  private idx = 0;

  private usingAncestors = false;

  constructor(
      private path: Element[] = [],
      private container: Element|null = null,
  ) {}

  /** Resets an EventPath with a new path and container. */
  reset(path: Element[], container: Element): Generator {
    this.path = path;
    this.idx = 0;
    this.container = container;
    this.usingAncestors = false;
    return this;
  }

  next(): Node|null {
    // NOTE: If we could ban OWNERS for all users of event.path
    // then you could greatly simplify the code here.
    if (this.usingAncestors) {
      return ancestors.next();
    }
    if (this.idx !== this.path.length) {
      const curr = this.path[this.idx];
      this.idx++;
      if (curr !== this.container) {
        // NOTE: The presence of the OWNER property indicates that
        // the user wants to override the browsers expected event path with
        // one of their own. The eventpath generator still needs to respect
        // the OWNER property since this is used by a lot of jsactions
        // consumers.
        // tslint:disable-next-line:no-dict-access-on-struct-type
        if (curr && curr[Property.OWNER]) {
          this.usingAncestors = true;
          // tslint:disable-next-line:no-dict-access-on-struct-type
          ancestors.reset(curr[Property.OWNER], this.container as Element);
        }
      }
      return curr;
    }
    return null;
  }
}

/** A reusable generator for dom ancestor walks. */
const ancestors = new Ancestors();

/** A reusable generator for elements in a path array. */
const eventPath = new EventPath();

/**
 * Return the correct dom generator for a given event.
 * @param e the event.
 * @param target the events target element.
 * @param container the jsaction container.
 */
export function getGenerator(
    e: Event,
    target: Element,
    container: Element,
    ): Generator {
  // The path API doesn't exist in most browsers, so this can be deleted.
  //   TS2339: Property 'path' does not exist on type 'Event'.
  // @ts-ignore
  if (e.path) {
    // @ts-ignore
    return eventPath.reset(e.path, container);
  } else if (e.composedPath) {
    return eventPath.reset(e.composedPath() as unknown as Element[], container);
  }
  return ancestors.reset(target, container);
}
