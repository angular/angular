/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {KeyValueArray} from '../../util/array_utils';
import {TStylingRange} from '../interfaces/styling';
import {CssSelector} from './projection';
import {RNode} from './renderer';
import {LView, TView} from './view';


/**
 * TNodeType corresponds to the {@link TNode} `type` property.
 */
export const enum TNodeType {
  /**
   * The TNode contains information about an {@link LContainer} for embedded views.
   */
  Container = 0,
  /**
   * The TNode contains information about an `<ng-content>` projection
   */
  Projection = 1,
  /**
   * The TNode contains information about an {@link LView}
   */
  View = 2,
  /**
   * The TNode contains information about a DOM element aka {@link RNode}.
   */
  Element = 3,
  /**
   * The TNode contains information about an `<ng-container>` element {@link RNode}.
   */
  ElementContainer = 4,
  /**
   * The TNode contains information about an ICU comment used in `i18n`.
   */
  IcuContainer = 5,
}

/**
 * Converts `TNodeType` into human readable text.
 * Make sure this matches with `TNodeType`
 */
export const TNodeTypeAsString = [
  'Container',         // 0
  'Projection',        // 1
  'View',              // 2
  'Element',           // 3
  'ElementContainer',  // 4
  'IcuContainer'       // 5
] as const;


/**
 * Corresponds to the TNode.flags property.
 */
export const enum TNodeFlags {
  /** Bit #1 - This bit is set if the node is a host for any directive (including a component) */
  isDirectiveHost = 0x1,

  /**
   * Bit #2 - This bit is set if the node is a host for a component.
   *
   * Setting this bit implies that the `isDirectiveHost` bit is set as well.
   * */
  isComponentHost = 0x2,

  /** Bit #3 - This bit is set if the node has been projected */
  isProjected = 0x4,

  /** Bit #4 - This bit is set if any directive on this node has content queries */
  hasContentQuery = 0x8,

  /** Bit #5 - This bit is set if the node has any "class" inputs */
  hasClassInput = 0x10,

  /** Bit #6 - This bit is set if the node has any "style" inputs */
  hasStyleInput = 0x20,

  /** Bit #7 This bit is set if the node has been detached by i18n */
  isDetached = 0x40,

  /**
   * Bit #8 - This bit is set if the node has directives with host bindings.
   *
   * This flags allows us to guard host-binding logic and invoke it only on nodes
   * that actually have directives with host bindings.
   */
  hasHostBindings = 0x80,
}

/**
 * Corresponds to the TNode.providerIndexes property.
 */
export const enum TNodeProviderIndexes {
  /** The index of the first provider on this node is encoded on the least significant bits. */
  ProvidersStartIndexMask = 0b00000000000011111111111111111111,

  /**
   * The count of view providers from the component on this node is
   * encoded on the 20 most significant bits.
   */
  CptViewProvidersCountShift = 20,
  CptViewProvidersCountShifter = 0b00000000000100000000000000000000,
}

/**
 * A set of marker values to be used in the attributes arrays. These markers indicate that some
 * items are not regular attributes and the processing should be adapted accordingly.
 */
export const enum AttributeMarker {
  /**
   * An implicit marker which indicates that the value in the array are of `attributeKey`,
   * `attributeValue` format.
   *
   * NOTE: This is implicit as it is the type when no marker is present in array. We indicate that
   * it should not be present at runtime by the negative number.
   */
  ImplicitAttributes = -1,

  /**
   * Marker indicates that the following 3 values in the attributes array are:
   * namespaceUri, attributeName, attributeValue
   * in that order.
   */
  NamespaceURI = 0,

  /**
   * Signals class declaration.
   *
   * Each value following `Classes` designates a class name to include on the element.
   * ## Example:
   *
   * Given:
   * ```
   * <div class="foo bar baz">...<d/vi>
   * ```
   *
   * the generated code is:
   * ```
   * var _c1 = [AttributeMarker.Classes, 'foo', 'bar', 'baz'];
   * ```
   */
  Classes = 1,

  /**
   * Signals style declaration.
   *
   * Each pair of values following `Styles` designates a style name and value to include on the
   * element.
   * ## Example:
   *
   * Given:
   * ```
   * <div style="width:100px; height:200px; color:red">...</div>
   * ```
   *
   * the generated code is:
   * ```
   * var _c1 = [AttributeMarker.Styles, 'width', '100px', 'height'. '200px', 'color', 'red'];
   * ```
   */
  Styles = 2,

  /**
   * Signals that the following attribute names were extracted from input or output bindings.
   *
   * For example, given the following HTML:
   *
   * ```
   * <div moo="car" [foo]="exp" (bar)="doSth()">
   * ```
   *
   * the generated code is:
   *
   * ```
   * var _c1 = ['moo', 'car', AttributeMarker.Bindings, 'foo', 'bar'];
   * ```
   */
  Bindings = 3,

  /**
   * Signals that the following attribute names were hoisted from an inline-template declaration.
   *
   * For example, given the following HTML:
   *
   * ```
   * <div *ngFor="let value of values; trackBy:trackBy" dirA [dirB]="value">
   * ```
   *
   * the generated code for the `template()` instruction would include:
   *
   * ```
   * ['dirA', '', AttributeMarker.Bindings, 'dirB', AttributeMarker.Template, 'ngFor', 'ngForOf',
   * 'ngForTrackBy', 'let-value']
   * ```
   *
   * while the generated code for the `element()` instruction inside the template function would
   * include:
   *
   * ```
   * ['dirA', '', AttributeMarker.Bindings, 'dirB']
   * ```
   */
  Template = 4,

  /**
   * Signals that the following attribute is `ngProjectAs` and its value is a parsed `CssSelector`.
   *
   * For example, given the following HTML:
   *
   * ```
   * <h1 attr="value" ngProjectAs="[title]">
   * ```
   *
   * the generated code for the `element()` instruction would include:
   *
   * ```
   * ['attr', 'value', AttributeMarker.ProjectAs, ['', 'title', '']]
   * ```
   */
  ProjectAs = 5,

  /**
   * Signals that the following attribute will be translated by runtime i18n
   *
   * For example, given the following HTML:
   *
   * ```
   * <div moo="car" foo="value" i18n-foo [bar]="binding" i18n-bar>
   * ```
   *
   * the generated code is:
   *
   * ```
   * var _c1 = ['moo', 'car', AttributeMarker.I18n, 'foo', 'bar'];
   */
  I18n = 6,
}

/**
 * A combination of:
 * - Attribute names and values.
 * - Special markers acting as flags to alter attributes processing.
 * - Parsed ngProjectAs selectors.
 */
export type TAttributes = (string|AttributeMarker|CssSelector)[];

/**
 * Constants that are associated with a view. Includes:
 * - Attribute arrays.
 * - Local definition arrays.
 */
export type TConstants = (TAttributes|string)[];

/**
 * Binding data (flyweight) for a particular node that is shared between all templates
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
   * Index of the TNode in TView.data and corresponding native element in LView.
   *
   * This is necessary to get from any TNode to its corresponding native element when
   * traversing the node tree.
   *
   * If index is -1, this is a dynamically created container node or embedded view node.
   */
  index: number;

  /**
   * The index of the closest injector in this node's LView.
   *
   * If the index === -1, there is no injector on this node or any ancestor node in this view.
   *
   * If the index !== -1, it is the index of this node's injector OR the index of a parent injector
   * in the same view. We pass the parent injector index down the node tree of a view so it's
   * possible to find the parent injector without walking a potentially deep node tree. Injector
   * indices are not set across view boundaries because there could be multiple component hosts.
   *
   * If tNode.injectorIndex === tNode.parent.injectorIndex, then the index belongs to a parent
   * injector.
   */
  injectorIndex: number;

  /**
   * Stores starting index of the directives.
   */
  directiveStart: number;

  /**
   * Stores final exclusive index of the directives.
   */
  directiveEnd: number;

  /**
   * Stores the last directive which had a styling instruction.
   *
   * Initial value of this is `-1` which means that no `hostBindings` styling instruction has
   * executed. As `hostBindings` instructions execute they set the value to the index of the
   * `DirectiveDef` which contained the last `hostBindings` styling instruction.
   *
   * Valid values are:
   * - `-1` No `hostBindings` instruction has executed.
   * - `directiveStart <= directiveStylingLast < directiveEnd`: Points to the `DirectiveDef` of the
   *   last styling instruction which executed in the `hostBindings`.
   *
   * This data is needed so that styling instructions know which static styling data needs to be
   * collected from the `DirectiveDef.hostAttrs`. A styling instruction needs to collect all data
   * since last styling instruction.
   */
  directiveStylingLast: number;

  /**
   * Stores indexes of property bindings. This field is only set in the ngDevMode and holds indexes
   * of property bindings so TestBed can get bound property metadata for a given node.
   */
  propertyBindings: number[]|null;

  /**
   * Stores if Node isComponent, isProjected, hasContentQuery, hasClassInput and hasStyleInput etc.
   */
  flags: TNodeFlags;

  /**
   * This number stores two values using its bits:
   *
   * - the index of the first provider on that node (first 16 bits)
   * - the count of view providers from the component on this node (last 16 bits)
   */
  // TODO(misko): break this into actual vars.
  providerIndexes: TNodeProviderIndexes;

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
   * Same as `TNode.attrs` but contains merged data across all directive host bindings.
   *
   * We need to keep `attrs` as unmerged so that it can be used for attribute selectors.
   * We merge attrs here so that it can be used in a performant way for initial rendering.
   *
   * The `attrs` are merged in first pass in following order:
   * - Component's `hostAttrs`
   * - Directives' `hostAttrs`
   * - Template `TNode.attrs` associated with the current `TNode`.
   */
  mergedAttrs: TAttributes|null;

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
   * Input data for all directives on this node. `null` means that there are no directives with
   * inputs on this node.
   */
  inputs: PropertyAliases|null;

  /**
   * Output data for all directives on this node. `null` means that there are no directives with
   * outputs on this node.
   */
  outputs: PropertyAliases|null;

  /**
   * The TView or TViews attached to this node.
   *
   * If this TNode corresponds to an LContainer with inline views, the container will
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
   * If this TNode corresponds to an LContainer with a template (e.g. structural
   * directive), the template's TView will be stored here.
   *
   * If this TNode corresponds to an element, tViews will be null .
   */
  tViews: TView|TView[]|null;

  /**
   * The next sibling node. Necessary so we can propagate through the root nodes of a view
   * to insert them or remove them from the DOM.
   */
  next: TNode|null;

  /**
   * The next projected sibling. Since in Angular content projection works on the node-by-node basis
   * the act of projecting nodes might change nodes relationship at the insertion point (target
   * view). At the same time we need to keep initial relationship between nodes as expressed in
   * content view.
   */
  projectionNext: TNode|null;

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
   *   the process is recursive in nature.
   *
   * If `projection` is of type `RNode[][]` than we have a collection of native nodes passed as
   * projectable nodes during dynamic component creation.
   */
  projection: (TNode|RNode[])[]|number|null;

  /**
   * A collection of all `style` static values for an element (including from host).
   *
   * This field will be populated if and when:
   *
   * - There are one or more initial `style`s on an element (e.g. `<div style="width:200px;">`)
   * - There are one or more initial `style`s on a directive/component host
   *   (e.g. `@Directive({host: {style: "width:200px;" } }`)
   */
  styles: string|null;


  /**
   * A collection of all `style` static values for an element excluding host sources.
   *
   * Populated when there are one or more initial `style`s on an element
   * (e.g. `<div style="width:200px;">`)
   * Must be stored separately from `tNode.styles` to facilitate setting directive
   * inputs that shadow the `style` property. If we used `tNode.styles` as is for shadowed inputs,
   * we would feed host styles back into directives as "inputs". If we used `tNode.attrs`, we would
   * have to concatenate the attributes on every template pass. Instead, we process once on first
   * create pass and store here.
   */
  stylesWithoutHost: string|null;

  /**
   * A `KeyValueArray` version of residual `styles`.
   *
   * When there are styling instructions than each instruction stores the static styling
   * which is of lower priority than itself. This means that there may be a higher priority styling
   * than the instruction.
   *
   * Imagine:
   * ```
   * <div style="color: highest;" my-dir>
   *
   * @Directive({
   *   host: {
   *     style: 'color: lowest; ',
   *     '[styles.color]': 'exp' // ɵɵstyleProp('color', ctx.exp);
   *   }
   * })
   * ```
   *
   * In the above case:
   * - `color: lowest` is stored with `ɵɵstyleProp('color', ctx.exp);` instruction
   * -  `color: highest` is the residual and is stored here.
   *
   * - `undefined': not initialized.
   * - `null`: initialized but `styles` is `null`
   * - `KeyValueArray`: parsed version of `styles`.
   */
  residualStyles: KeyValueArray<any>|undefined|null;

  /**
   * A collection of all class static values for an element (including from host).
   *
   * This field will be populated if and when:
   *
   * - There are one or more initial classes on an element (e.g. `<div class="one two three">`)
   * - There are one or more initial classes on an directive/component host
   *   (e.g. `@Directive({host: {class: "SOME_CLASS" } }`)
   */
  classes: string|null;

  /**
   * A collection of all class static values for an element excluding host sources.
   *
   * Populated when there are one or more initial classes on an element
   * (e.g. `<div class="SOME_CLASS">`)
   * Must be stored separately from `tNode.classes` to facilitate setting directive
   * inputs that shadow the `class` property. If we used `tNode.classes` as is for shadowed inputs,
   * we would feed host classes back into directives as "inputs". If we used `tNode.attrs`, we would
   * have to concatenate the attributes on every template pass. Instead, we process once on first
   * create pass and store here.
   */
  classesWithoutHost: string|null;

  /**
   * A `KeyValueArray` version of residual `classes`.
   *
   * Same as `TNode.residualStyles` but for classes.
   *
   * - `undefined': not initialized.
   * - `null`: initialized but `classes` is `null`
   * - `KeyValueArray`: parsed version of `classes`.
   */
  residualClasses: KeyValueArray<any>|undefined|null;

  /**
   * Stores the head/tail index of the class bindings.
   *
   * - If no bindings, the head and tail will both be 0.
   * - If there are template bindings, stores the head/tail of the class bindings in the template.
   * - If no template bindings but there are host bindings, the head value will point to the last
   *   host binding for "class" (not the head of the linked list), tail will be 0.
   *
   * See: `style_binding_list.ts` for details.
   *
   * This is used by `insertTStylingBinding` to know where the next styling binding should be
   * inserted so that they can be sorted in priority order.
   */
  classBindings: TStylingRange;

  /**
   * Stores the head/tail index of the class bindings.
   *
   * - If no bindings, the head and tail will both be 0.
   * - If there are template bindings, stores the head/tail of the style bindings in the template.
   * - If no template bindings but there are host bindings, the head value will point to the last
   *   host binding for "style" (not the head of the linked list), tail will be 0.
   *
   * See: `style_binding_list.ts` for details.
   *
   * This is used by `insertTStylingBinding` to know where the next styling binding should be
   * inserted so that they can be sorted in priority order.
   */
  styleBindings: TStylingRange;
}

/** Static data for an element  */
export interface TElementNode extends TNode {
  /** Index in the data[] array */
  index: number;
  child: TElementNode|TTextNode|TElementContainerNode|TContainerNode|TProjectionNode|null;
  /**
   * Element nodes will have parents unless they are the first node of a component or
   * embedded view (which means their parent is in a different view and must be
   * retrieved using viewData[HOST_NODE]).
   */
  parent: TElementNode|TElementContainerNode|null;
  tViews: null;

  /**
   * If this is a component TNode with projection, this will be an array of projected
   * TNodes or native nodes (see TNode.projection for more info). If it's a regular element node or
   * a component without projection, it will be null.
   */
  projection: (TNode|RNode[])[]|null;
}

/** Static data for a text node */
export interface TTextNode extends TNode {
  /** Index in the data[] array */
  index: number;
  child: null;
  /**
   * Text nodes will have parents unless they are the first node of a component or
   * embedded view (which means their parent is in a different view and must be
   * retrieved using LView.node).
   */
  parent: TElementNode|TElementContainerNode|null;
  tViews: null;
  projection: null;
}

/** Static data for an LContainer */
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
  parent: TElementNode|TElementContainerNode|null;
  tViews: TView|TView[]|null;
  projection: null;
}

/** Static data for an <ng-container> */
export interface TElementContainerNode extends TNode {
  /** Index in the LView[] array. */
  index: number;
  child: TElementNode|TTextNode|TContainerNode|TElementContainerNode|TProjectionNode|null;
  parent: TElementNode|TElementContainerNode|null;
  tViews: null;
  projection: null;
}

/** Static data for an ICU expression */
export interface TIcuContainerNode extends TNode {
  /** Index in the LView[] array. */
  index: number;
  child: TElementNode|TTextNode|null;
  parent: TElementNode|TElementContainerNode|null;
  tViews: null;
  projection: null;
  /**
   * Indicates the current active case for an ICU expression.
   * It is null when there is no active case.
   *
   */
  // FIXME(misko): This is at a wrong location as activeCase is `LView` (not `TView`) concern
  activeCaseIndex: number|null;
}

/** Static data for a view  */
export interface TViewNode extends TNode {
  /** If -1, it's a dynamically created view. Otherwise, it is the view block ID. */
  index: number;
  child: TElementNode|TTextNode|TElementContainerNode|TContainerNode|TProjectionNode|null;
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
  parent: TElementNode|TElementContainerNode|null;
  tViews: null;

  /** Index of the projection node. (See TNode.projection for more info.) */
  projection: number;
}

/**
 * A union type representing all TNode types that can host a directive.
 */
export type TDirectiveHostNode = TElementNode|TContainerNode|TElementContainerNode;

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
 * i+0: directive instance index
 * i+1: privateName
 *
 * e.g. [0, 'change-minified']
 */
export type PropertyAliasValue = (number|string)[];

/**
 * This array contains information about input properties that
 * need to be set once from attribute data. It's ordered by
 * directive index (relative to element) so it's simple to
 * look up a specific directive's initial input data.
 *
 * Within each sub-array:
 *
 * i+0: attribute name
 * i+1: minified/internal input name
 * i+2: initial value
 *
 * If a directive on a node does not have any input properties
 * that should be set from attributes, its index is set to null
 * to avoid a sparse array.
 *
 * e.g. [null, ['role-min', 'minified-input', 'button']]
 */
export type InitialInputData = (InitialInputs|null)[];

/**
 * Used by InitialInputData to store input properties
 * that should be set once from attributes.
 *
 * i+0: attribute name
 * i+1: minified/internal input name
 * i+2: initial value
 *
 * e.g. ['role-min', 'minified-input', 'button']
 */
export type InitialInputs = string[];

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;

/**
 * Type representing a set of TNodes that can have local refs (`#foo`) placed on them.
 */
export type TNodeWithLocalRefs = TContainerNode|TElementNode|TElementContainerNode;

/**
 * Type for a function that extracts a value for a local refs.
 * Example:
 * - `<div #nativeDivEl>` - `nativeDivEl` should point to the native `<div>` element;
 * - `<ng-template #tplRef>` - `tplRef` should point to the `TemplateRef` instance;
 */
export type LocalRefExtractor = (tNode: TNodeWithLocalRefs, currentView: LView) => any;

/**
 * Returns `true` if the `TNode` has a directive which has `@Input()` for `class` binding.
 *
 * ```
 * <div my-dir [class]="exp"></div>
 * ```
 * and
 * ```
 * @Directive({
 * })
 * class MyDirective {
 *   @Input()
 *   class: string;
 * }
 * ```
 *
 * In the above case it is necessary to write the reconciled styling information into the
 * directive's input.
 *
 * @param tNode
 */
export function hasClassInput(tNode: TNode) {
  return (tNode.flags & TNodeFlags.hasClassInput) !== 0;
}

/**
 * Returns `true` if the `TNode` has a directive which has `@Input()` for `style` binding.
 *
 * ```
 * <div my-dir [style]="exp"></div>
 * ```
 * and
 * ```
 * @Directive({
 * })
 * class MyDirective {
 *   @Input()
 *   class: string;
 * }
 * ```
 *
 * In the above case it is necessary to write the reconciled styling information into the
 * directive's input.
 *
 * @param tNode
 */
export function hasStyleInput(tNode: TNode) {
  return (tNode.flags & TNodeFlags.hasStyleInput) !== 0;
}
