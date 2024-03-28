/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** All properties that are used by jsaction. */
export enum Property {
  /**
   * The parsed value of the jsaction attribute is stored in this
   * property on the DOM node. The parsed value is an Object. The
   * property names of the object are the events; the values are the
   * names of the actions. This property is attached even on nodes
   * that don't have a jsaction attribute as an optimization, because
   * property lookup is faster than attribute access.
   */
  JSACTION = '__jsaction',

  /**
   * The parsed value of the jsnamespace attribute is stored in this
   * property on the DOM node.
   */
  JSNAMESPACE = '__jsnamespace',

  /** The value of the oi attribute as a property, for faster access. */
  OI = '__oi',

  /**
   * The owner property references an a logical owner for a DOM node. JSAction
   * will follow this reference instead of parentNode when traversing the DOM
   * to find jsaction attributes. This allows overlaying a logical structure
   * over a document where the DOM structure can't reflect that structure.
   */
  OWNER = '__owner',
}

declare global {
  interface Node {
    [Property.JSACTION]?: string;
    [Property.JSNAMESPACE]?: string;
    [Property.OI]?: string;
    [Property.OWNER]?: ParentNode;
  }
}
