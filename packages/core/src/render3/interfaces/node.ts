/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LContainer} from './container';
import {LInjector} from './injector';
import {LProjection} from './projection';
import {LQueries} from './query';
import {RElement, RNode, RText} from './renderer';
import {LView, TData, TView} from './view';



/**
 * TNodeType corresponds to the TNode.type property. It contains information
 * on how to map a particular set of bits in LNode.flags to the node type.
 */
export const enum TNodeType {
  Container = 0b00,
  Projection = 0b01,
  View = 0b10,
  Element = 0b11,
  ViewOrElement = 0b10,
}

/**
 * Corresponds to the TNode.flags property.
 */
export const enum TNodeFlags {
  /** The number of directives on this node is encoded on the least significant bits */
  DirectiveCountMask = 0b00000000000000000000111111111111,

  /** Then this bit is set when the node is a component */
  isComponent = 0b1000000000000,

  /** The index of the first directive on this node is encoded on the most significant bits  */
  DirectiveStartingIndexShift = 13,
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
   * The associated DOM node. Storing this allows us to:
   *  - append children to their element parents in the DOM (e.g. `parent.native.appendChild(...)`)
   *  - retrieve the sibling elements of text nodes whose creation / insertion has been delayed
   */
  readonly native: RElement|RText|null|undefined;

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
  tNode: TNode;

  /**
   * A pointer to an LContainerNode created by directives requesting ViewContainerRef
   */
  // TODO(kara): Remove when removing LNodes
  dynamicLContainerNode: LContainerNode|null;
}


/** LNode representing an element. */
export interface LElementNode extends LNode {
  /** The DOM element associated with this node. */
  readonly native: RElement;

  /** If Component then data has LView (light DOM) */
  readonly data: LView|null;
}

/** LNode representing a #text node. */
export interface LTextNode extends LNode {
  /** The text node associated with this node. */
  native: RText;
  readonly data: null;
  dynamicLContainerNode: null;
}

/** Abstract node which contains root nodes of a view. */
export interface LViewNode extends LNode {
  readonly native: null;
  readonly data: LView;
  dynamicLContainerNode: null;
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
}


export interface LProjectionNode extends LNode {
  readonly native: null;
  readonly data: LProjection;
  dynamicLContainerNode: null;
}

/**
 * A set of marker values to be used in the attributes arrays. Those markers indicate that some
 * items are not regular attributes and the processing should be adapted accordingly.
 */
export const enum AttributeMarker {
  NS = 0,  // namespace. Has to be repeated.

  /**
   * This marker indicates that the following attribute names were extracted from bindings (ex.:
   * [foo]="exp") and / or event handlers (ex. (bar)="doSth()").
   * Taking the above bindings and outputs as an example an attributes array could look as follows:
   * ['class', 'fade in', AttributeMarker.SELECT_ONLY, 'foo', 'bar']
   */
  SELECT_ONLY = 1
}

/**
 * A combination of:
 * - attribute names and values
 * - special markers acting as flags to alter attributes processing.
 */
export type TAttributes = (string | AttributeMarker)[];

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
  /** The type of the TNode. See TNodeType. */
  type: TNodeType;

  /**
   * Index of the TNode in TView.data and corresponding LNode in LView.data.
   *
   * This is necessary to get from any TNode to its corresponding LNode when
   * traversing the node tree.
   *
   * If null, this is a dynamically created container node or embedded view node.
   */
  index: number|null;

  /**
   * This number stores two values using its bits:
   *
   * - the number of directives on that node (first 12 bits)
   * - the starting index of the node's directives in the directives array (last 20 bits).
   *
   * These two values are necessary so DI can effectively search the directives associated
   * with a node without searching the whole directives array.
   */
  flags: TNodeFlags;

  /** The tag name associated with this node. */
  tagName: string|null;

  /**
   * Attributes associated with an element. We need to store attributes to support various use-cases
   * (attribute injection, content projection with selectors, directives matching).
   * Attributes are stored statically because reading them from the DOM would be way too slow for
   * content projection and queries.
   *
   * Since attrs will always be calculated first, they will never need to be marked undefined by
   * other instructions.
   *
   * For regular attributes a name of an attribute and its value alternate in the array.
   * e.g. ['role', 'checkbox']
   * This array can contain flags that will indicate "special attributes" (attributes with
   * namespaces, attributes extracted from bindings and outputs).
   */
  attrs: TAttributes|null;

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

  /** Information about input properties that need to be set once from attribute data. */
  initialInputs: InitialInputData|null|undefined;

  /**
   * Input data for all directives on this node.
   *
   * - `undefined` means that the prop has not been initialized yet,
   * - `null` means that the prop has been initialized but no inputs have been found.
   */
  inputs: PropertyAliases|null|undefined;

  /**
   * Output data for all directives on this node.
   *
   * - `undefined` means that the prop has not been initialized yet,
   * - `null` means that the prop has been initialized but no outputs have been found.
   */
  outputs: PropertyAliases|null|undefined;

  /**
   * The TView or TViews attached to this node.
   *
   * If this TNode corresponds to an LContainerNode with inline views, the container will
   * need to store separate static data for each of its view blocks (TView[]). Otherwise,
   * nodes in inline views with the same index as nodes in their parent views will overwrite
   * each other, as they are in the same template.
   *
   * Each index in this array corresponds to the static data for a certain
   * view. So if you had V(0) and V(1) in a container, you might have:
   *
   * [
   *   [{tagName: 'div', attrs: ...}, null],     // V(0) TView
   *   [{tagName: 'button', attrs ...}, null]    // V(1) TView
   *
   * If this TNode corresponds to an LContainerNode with a template (e.g. structural
   * directive), the template's TView will be stored here.
   *
   * If this TNode corresponds to an LElementNode, tViews will be null .
   */
  tViews: TView|TView[]|null;

  /**
   * The next sibling node. Necessary so we can propagate through the root nodes of a view
   * to insert them or remove them from the DOM.
   */
  next: TNode|null;

  /**
   * First child of the current node.
   *
   * For component nodes, the child will always be a ContentChild (in same view).
   * For embedded view nodes, the child will be in their child view.
   */
  child: TNode|null;

  /**
   * Parent node (in the same view only).
   *
   * We need a reference to a node's parent so we can append the node to its parent's native
   * element at the appropriate time.
   *
   * If the parent would be in a different view (e.g. component host), this property will be null.
   * It's important that we don't try to cross component boundaries when retrieving the parent
   * because the parent will change (e.g. index, attrs) depending on where the component was
   * used (and thus shouldn't be stored on TNode). In these cases, we retrieve the parent through
   * LView.node instead (which will be instance-specific).
   *
   * If this is an inline view node (V), the parent will be its container.
   */
  parent: TElementNode|TContainerNode|null;

  /**
   * A pointer to a TContainerNode created by directives requesting ViewContainerRef
   */
  dynamicContainerNode: TNode|null;
}

/** Static data for an LElementNode  */
export interface TElementNode extends TNode {
  /** Index in the data[] array */
  index: number;
  child: TElementNode|TTextNode|TContainerNode|TProjectionNode|null;
  /**
   * Element nodes will have parents unless they are the first node of a component or
   * embedded view (which means their parent is in a different view and must be
   * retrieved using LView.node).
   */
  parent: TElementNode|null;
  tViews: null;
}

/** Static data for an LTextNode  */
export interface TTextNode extends TNode {
  /** Index in the data[] array */
  index: number;
  child: null;
  /**
   * Text nodes will have parents unless they are the first node of a component or
   * embedded view (which means their parent is in a different view and must be
   * retrieved using LView.node).
   */
  parent: TElementNode|null;
  tViews: null;
}

/** Static data for an LContainerNode */
export interface TContainerNode extends TNode {
  /**
   * If number, index in the data[] array.
   *
   * If null, this is a dynamically created container node that isn't stored in
   * data[] (e.g. when you inject ViewContainerRef) .
   */
  index: number|null;
  child: null;

  /**
   * Container nodes will have parents unless:
   *
   * - They are the first node of a component or embedded view
   * - They are dynamically created
   */
  parent: TElementNode|null;
  tViews: TView|TView[]|null;
}

/** Static data for an LViewNode  */
export interface TViewNode extends TNode {
  /** If null, it's a dynamically created view*/
  index: number|null;
  child: TElementNode|TTextNode|TContainerNode|TProjectionNode|null;
  parent: TContainerNode|null;
  tViews: null;
}

/** Static data for an LProjectionNode  */
export interface TProjectionNode extends TNode {
  /** Index in the data[] array */
  child: null;
  /**
   * Projection nodes will have parents unless they are the first node of a component
   * or embedded view (which means their parent is in a different view and must be
   * retrieved using LView.node).
   */
  parent: TElementNode|null;
  tViews: null;
}

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
 * Store the runtime input or output names for all the directives.
 *
 * - Even indices: directive index
 * - Odd indices: minified / internal name
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
