/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LContainer, TContainer} from './container';
import {LInjector} from './injector';
import {LProjection} from './projection';
import {LQueries} from './query';
import {RElement, RNode, RText} from './renderer';
import {LView, TData, TView} from './view';



/**
 * LNodeFlags corresponds to the LNode.flags property. It contains information
 * on how to map a particular set of bits in LNode.flags to the node type, directive
 * count, or directive starting index.
 *
 * For example, if you wanted to check the type of a certain node, you would mask
 * node.flags with TYPE_MASK and compare it to the value for a certain node type. e.g:
 *
 *```ts
 * if ((node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Element) {...}
 *```
 */
export const enum LNodeFlags {
  Container = 0b00,
  Projection = 0b01,
  View = 0b10,
  Element = 0b11,
  ViewOrElement = 0b10,
  SIZE_SKIP = 0b100,
  SIZE_SHIFT = 2,
  INDX_SHIFT = 12,
  TYPE_MASK = 0b00000000000000000000000000000011,
  SIZE_MASK = 0b00000000000000000000111111111100,
  INDX_MASK = 0b11111111111111111111000000000000
}

/**
 * LNode is an internal data structure which is used for the incremental DOM algorithm.
 * The "L" stands for "Logical" to differentiate between `RNodes` (actual rendered DOM
 * node) and our logical representation of DOM nodes, `LNodes`.
 *
 * The data structure is optimized for speed and size.
 *
 * In order to be fast, all subtypes of `LNode` should have the same shape.
 * Because size of the `LNode` matters, many fields have multiple roles depending
 * on the `LNode` subtype.
 *
 * See: https://en.wikipedia.org/wiki/Inline_caching#Monomorphic_inline_caching
 *
 * NOTE: This is a private data structure and should not be exported by any of the
 * instructions.
 */
export interface LNode {
  /**
   * This number stores three values using its bits:
   *
   * - the type of the node (first 2 bits)
   * - the number of directives on that node (next 10 bits)
   * - the starting index of the node's directives in the directives array (last 20 bits).
   *
   * The latter two values are necessary so DI can effectively search the directives associated
   * with a node without searching the whole directives array.
   */
  flags: LNodeFlags;

  /**
   * The associated DOM node. Storing this allows us to:
   *  - append children to their element parents in the DOM (e.g. `parent.native.appendChild(...)`)
   *  - retrieve the sibling elements of text nodes whose creation / insertion has been delayed
   */
  readonly native: RElement|RText|null|undefined;

  /**
   * We need a reference to a node's parent so we can append the node to its parent's native
   * element at the appropriate time.
   */
  readonly parent: LNode|null;

  /**
   * First child of the current node.
   */
  child: LNode|null;

  /**
   * The next sibling node. Necessary so we can propagate through the root nodes of a view
   * to insert them or remove them from the DOM.
   */
  next: LNode|null;

  /**
   * If regular LElementNode, then `data` will be null.
   * If LElementNode with component, then `data` contains LView.
   * If LViewNode, then `data` contains the LView.
   * If LContainerNode, then `data` contains LContainer.
   * If LProjectionNode, then `data` contains LProjection.
   */
  readonly data: LView|LContainer|LProjection|null;


  /**
   * Each node belongs to a view.
   *
   * When the injector is walking up a tree, it needs access to the `directives` (part of view).
   */
  readonly view: LView;

  /** The injector associated with this node. Necessary for DI. */
  nodeInjector: LInjector|null;

  /**
   * Optional set of queries that track query-related events for this node.
   *
   * If present the node creation/updates are reported to the `LQueries`.
   */
  queries: LQueries|null;

  /**
   * If this node is projected, pointer to the next node in the same projection parent
   * (which is a container, an element, or a text node), or to the parent projection node
   * if this is the last node in the projection.
   * If this node is not projected, this field is null.
   */
  pNextOrParent: LNode|null;

  /**
   * Pointer to the corresponding TNode object, which stores static
   * data about this node.
   */
  tNode: TNode|null;
}


/** LNode representing an element. */
export interface LElementNode extends LNode {
  /** The DOM element associated with this node. */
  readonly native: RElement;

  child: LContainerNode|LElementNode|LTextNode|LProjectionNode|null;
  next: LContainerNode|LElementNode|LTextNode|LProjectionNode|null;

  /** If Component then data has LView (light DOM) */
  readonly data: LView|null;

  /** LElementNodes can be inside other LElementNodes or inside LViewNodes. */
  readonly parent: LElementNode|LViewNode;
}

/** LNode representing a #text node. */
export interface LTextNode extends LNode {
  /** The text node associated with this node. */
  native: RText;
  child: null;
  next: LContainerNode|LElementNode|LTextNode|LProjectionNode|null;

  /** LTextNodes can be inside LElementNodes or inside LViewNodes. */
  readonly parent: LElementNode|LViewNode;
  readonly data: null;
}

/** Abstract node which contains root nodes of a view. */
export interface LViewNode extends LNode {
  readonly native: null;
  child: LContainerNode|LElementNode|LTextNode|LProjectionNode|null;
  next: LViewNode|null;

  /**  LViewNodes can only be added to LContainerNodes. */
  readonly parent: LContainerNode|null;
  readonly data: LView;
}

/** Abstract node container which contains other views. */
export interface LContainerNode extends LNode {
  /*
   * Caches the reference of the first native node following this container in the same native
   * parent.
   * This is reset to undefined in containerRefreshEnd.
   * When it is undefined, it means the value has not been computed yet.
   * Otherwise, it contains the result of findBeforeNode(container, null).
   */
  native: RElement|RText|null|undefined;
  readonly data: LContainer;
  child: null;
  next: LContainerNode|LElementNode|LTextNode|LProjectionNode|null;

  /** Containers can be added to elements or views. */
  readonly parent: LElementNode|LViewNode|null;
}


export interface LProjectionNode extends LNode {
  readonly native: null;
  child: null;
  next: LContainerNode|LElementNode|LTextNode|LProjectionNode|null;

  readonly data: LProjection;

  /** Projections can be added to elements or views. */
  readonly parent: LElementNode|LViewNode;
}

/**
 * LNode binding data (flyweight) for a particular node that is shared between all templates
 * of a specific type.
 *
 * If a property is:
 *    - PropertyAliases: that property's data was generated and this is it
 *    - Null: that property's data was already generated and nothing was found.
 *    - Undefined: that property's data has not yet been generated
 *
 * see: https://en.wikipedia.org/wiki/Flyweight_pattern for more on the Flyweight pattern
 */
export interface TNode {
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
   * A set of local names under which a given element is exported in a template and
   * visible to queries. An entry in this array can be created for different reasons:
   * - an element itself is referenced, ex.: `<div #foo>`
   * - a component is referenced, ex.: `<my-cmpt #foo>`
   * - a directive is referenced, ex.: `<my-cmpt #foo="directiveExportAs">`.
   *
   * A given element might have different local names and those names can be associated
   * with a directive. We store local names at even indexes while odd indexes are reserved
   * for directive index in a view (or `-1` if there is no associated directive).
   *
   * Some examples:
   * - `<div #foo>` => `["foo", -1]`
   * - `<my-cmpt #foo>` => `["foo", myCmptIdx]`
   * - `<my-cmpt #foo #bar="directiveExportAs">` => `["foo", myCmptIdx, "bar", directiveIdx]`
   * - `<div #foo #bar="directiveExportAs">` => `["foo", -1, "bar", directiveIdx]`
   */
  localNames: (string|number)[]|null;

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
   * The static data equivalent of LNode.data.
   *
   * If this TNode corresponds to an LContainerNode, the container will
   * need to store separate static data for each of its views (TContainer).
   *
   * If this TNode corresponds to an LElementNode, data will be null.
   */
  data: TContainer|null;
}

/** Static data for an LElementNode  */
export interface TElementNode extends TNode { data: null; }

/** Static data for an LContainerNode */
export interface TContainerNode extends TNode { data: TContainer; }

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

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
