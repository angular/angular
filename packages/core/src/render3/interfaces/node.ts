/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StylingContext} from '../styling';

import {LContainer} from './container';
import {LInjector} from './injector';
import {LQueries} from './query';
import {RComment, RElement, RText} from './renderer';
import {LViewData, TView} from './view';



/**
 * TNodeType corresponds to the TNode.type property. It contains information
 * on how to map a particular set of bits in LNode.flags to the node type.
 */
export const enum TNodeType {
  Container = 0b000,
  Projection = 0b001,
  View = 0b010,
  Element = 0b011,
  ViewOrElement = 0b010,
  ElementContainer = 0b100,
}

/**
 * Corresponds to the TNode.flags property.
 */
export const enum TNodeFlags {
  /** The number of directives on this node is encoded on the least significant bits */
  DirectiveCountMask = 0b00000000000000000000111111111111,

  /** This bit is set if the node is a component */
  isComponent = 0b00000000000000000001000000000000,

  /** This bit is set if the node has been projected */
  isProjected = 0b00000000000000000010000000000000,

  /** This bit is set if the node has any content queries */
  hasContentQuery = 0b00000000000000000100000000000000,

  /** The index of the first directive on this node is encoded on the most significant bits  */
  DirectiveStartingIndexShift = 15,
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
  readonly native: RComment|RElement|RText|null;

  /**
   * If regular LElementNode, LTextNode, and LProjectionNode then `data` will be null.
   * If LElementNode with component, then `data` contains LViewData.
   * If LViewNode, then `data` contains the LViewData.
   * If LContainerNode, then `data` contains LContainer.
   */
  readonly data: LViewData|LContainer|null;


  /**
   * Each node belongs to a view.
   *
   * When the injector is walking up a tree, it needs access to the `directives` (part of view).
   */
  readonly view: LViewData;

  /** The injector associated with this node. Necessary for DI. */
  nodeInjector: LInjector|null;

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
  readonly data: LViewData|null;
}

/** LNode representing <ng-container>. */
export interface LElementContainerNode extends LNode {
  /** The DOM comment associated with this node. */
  readonly native: RComment;
  readonly data: null;
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
  readonly data: LViewData;
  dynamicLContainerNode: null;
}

/** Abstract node container which contains other views. */
export interface LContainerNode extends LNode {
  /*
   * This comment node is appended to the container's parent element to mark where
   * in the DOM the container's child views should be added.
   *
   * If the container is a root node of a view, this comment will not be appended
   * until the parent view is processed.
   */
  native: RComment;
  readonly data: LContainer;
}


export interface LProjectionNode extends LNode {
  readonly native: null;
  readonly data: null;
  dynamicLContainerNode: null;
}

/**
 * A set of marker values to be used in the attributes arrays. Those markers indicate that some
 * items are not regular attributes and the processing should be adapted accordingly.
 */
export const enum AttributeMarker {
  /**
   * Marker indicates that the following 3 values in the attributes array are:
   * namespaceUri, attributeName, attributeValue
   * in that order.
   */
  NamespaceURI = 0,

  /**
   * This marker indicates that the following attribute names were extracted from bindings (ex.:
   * [foo]="exp") and / or event handlers (ex. (bar)="doSth()").
   * Taking the above bindings and outputs as an example an attributes array could look as follows:
   * ['class', 'fade in', AttributeMarker.SelectOnly, 'foo', 'bar']
   */
  SelectOnly = 1
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
   * If index is -1, this is a dynamically created container node or embedded view node.
   */
  index: number;

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

  /**
   * If this node is part of an i18n block, it indicates whether this container is part of the DOM
   * If this node is not part of an i18n block, this field is null.
   */
  detached: boolean|null;

  stylingTemplate: StylingContext|null;
  /**
   * List of projected TNodes for a given component host element OR index into the said nodes.
   *
   * For easier discussion assume this example:
   * `<parent>`'s view definition:
   * ```
   * <child id="c1">content1</child>
   * <child id="c2"><span>content2</span></child>
   * ```
   * `<child>`'s view definition:
   * ```
   * <ng-content id="cont1"></ng-content>
   * ```
   *
   * If `Array.isArray(projection)` then `TNode` is a host element:
   * - `projection` stores the content nodes which are to be projected.
   *    - The nodes represent categories defined by the selector: For example:
   *      `<ng-content/><ng-content select="abc"/>` would represent the heads for `<ng-content/>`
   *      and `<ng-content select="abc"/>` respectively.
   *    - The nodes we store in `projection` are heads only, we used `.next` to get their
   *      siblings.
   *    - The nodes `.next` is sorted/rewritten as part of the projection setup.
   *    - `projection` size is equal to the number of projections `<ng-content>`. The size of
   *      `c1` will be `1` because `<child>` has only one `<ng-content>`.
   * - we store `projection` with the host (`c1`, `c2`) rather than the `<ng-content>` (`cont1`)
   *   because the same component (`<child>`) can be used in multiple locations (`c1`, `c2`) and as
   *   a result have different set of nodes to project.
   * - without `projection` it would be difficult to efficiently traverse nodes to be projected.
   *
   * If `typeof projection == 'number'` then `TNode` is a `<ng-content>` element:
   * - `projection` is an index of the host's `projection`Nodes.
   *   - This would return the first head node to project:
   *     `getHost(currentTNode).projection[currentTNode.projection]`.
   * - When projecting nodes the parent node retrieved may be a `<ng-content>` node, in which case
   *   the process is recursive in nature (not implementation).
   */
  projection: (TNode|null)[]|number|null;
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

  /**
   * If this is a component TNode with projection, this will be an array of projected
   * TNodes (see TNode.projection for more info). If it's a regular element node or a
   * component without projection, it will be null.
   */
  projection: (TNode|null)[]|null;
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
  projection: null;
}

/** Static data for an LContainerNode */
export interface TContainerNode extends TNode {
  /**
   * Index in the data[] array.
   *
   * If it's -1, this is a dynamically created container node that isn't stored in
   * data[] (e.g. when you inject ViewContainerRef) .
   */
  index: number;
  child: null;

  /**
   * Container nodes will have parents unless:
   *
   * - They are the first node of a component or embedded view
   * - They are dynamically created
   */
  parent: TElementNode|null;
  tViews: TView|TView[]|null;
  projection: null;
}

/** Static data for an LViewNode  */
export interface TViewNode extends TNode {
  /** If -1, it's a dynamically created view. Otherwise, it is the view block ID. */
  index: number;
  child: TElementNode|TTextNode|TContainerNode|TProjectionNode|null;
  parent: TContainerNode|null;
  tViews: null;
  projection: null;
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

  /** Index of the projection node. (See TNode.projection for more info.) */
  projection: number;
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

/**
 * Type representing a set of LNodes that can have local refs (`#foo`) placed on them.
 */
export type LNodeWithLocalRefs = LContainerNode | LElementNode | LElementContainerNode;

/**
 * Type for a function that extracts a value for a local refs.
 * Example:
 * - `<div #nativeDivEl>` - `nativeDivEl` should point to the native `<div>` element;
 * - `<ng-template #tplRef>` - `tplRef` should point to the `TemplateRef` instance;
 */
export type LocalRefExtractor = (lNode: LNodeWithLocalRefs) => any;