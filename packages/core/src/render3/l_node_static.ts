/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectiveDef} from './public_interfaces';

/** The type of the global ngStaticData array. */
export type NgStaticData = (LNodeStatic | DirectiveDef<any>| null)[];

/**
 * LNode binding data (flywiehgt) for a particular node that is shared between all templates
 * of a specific type.
 *
 * If a property is:
 *    - Minification Data: that property's data was generated and this is it
 *    - Null: that property's data was already generated and nothing was found.
 *    - Undefined: that property's data has not yet been generated
 */
export interface LNodeStatic {
  /** The tag name associated with this node. */
  tagName: string|null;

  /**
   * Static attributes associated with an element. We need to store
   * static attributes to support content projection with selectors.
   * Attributes are stored statically because reading them from the DOM
   * would be way too slow for content projection and queries.
   *
   * Since attrs will always be calculated first, they will never need
   * to be marked undefined by other instructions.
   *
   * The name of the attribute and its value alternate in the array.
   * e.g. ['role', 'checkbox']
   */
  attrs: string[]|null;

  /**
   * This property contains information about input properties that
   * need to be set once from attribute data.
   */
  initialInputs: InitialInputData|null|undefined;

  /** Input data for all directives on this node. */
  inputs: PropertyAliases|null|undefined;

  /** Output data for all directives on this node. */
  outputs: PropertyAliases|null|undefined;

  /**
   * If this LNodeStatic corresponds to an LContainer, the container will
   * need to have nested static data for each of its embedded views.
   * Otherwise, nodes in embedded views with the same index as nodes
   * in their parent views will overwrite each other, as they are in
   * the same template.
   *
   * Each index in this array corresponds to the static data for a certain
   * view. So if you had V(0) and V(1) in a container, you might have:
   *
   * [
   *   [{tagName: 'div', attrs: ...}, null],     // V(0) ngData
   *   [{tagName: 'button', attrs ...}, null]    // V(1) ngData
   * ]
   */
  containerStatic: (LNodeStatic|null)[][]|null;
}

/** Static data for an LElement */
export interface LElementStatic extends LNodeStatic { containerStatic: null; }

/** Static data for an LContainer */
export interface LContainerStatic extends LNodeStatic { containerStatic: (LNodeStatic|null)[][]; }

/**
 * This mapping is necessary so we can set input properties and output listeners
 * properly at runtime when property names are minified or aliased.
 *
 * Key: unminified / public input or output name
 * Value: array containing minified / internal name and related directive index
 *
 * The value must be an array to support inputs and outputs with the same name
 * on the same node.
 */
export type PropertyAliases = {
  // This uses an object map because using the Map type would be too slow
  [key: string]: PropertyAliasValue
};

/**
 * The value in PropertyAliases.
 *
 * In each array:
 * Even indices: directive index
 * Odd indices: minified / internal name
 *
 * e.g. [0, 'change-minified']
 */
export type PropertyAliasValue = (number | string)[];


/**
 * This array contains information about input properties that
 * need to be set once from attribute data. It's ordered by
 * directive index (relative to element) so it's simple to
 * look up a specific directive's initial input data.
 *
 * Within each sub-array:
 *
 * Even indices: minified/internal input name
 * Odd indices: initial value
 *
 * If a directive on a node does not have any input properties
 * that should be set from attributes, its index is set to null
 * to avoid a sparse array.
 *
 * e.g. [null, ['role-min', 'button']]
 */
export type InitialInputData = (InitialInputs | null)[];

/**
 * Used by InitialInputData to store input properties
 * that should be set once from attributes.
 *
 * Even indices: minified/internal input name
 * Odd indices: initial value
 *
 * e.g. ['role-min', 'button']
 */
export type InitialInputs = string[];
