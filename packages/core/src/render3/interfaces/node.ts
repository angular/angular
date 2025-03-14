/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Type} from '../../interface/type';
import {KeyValueArray} from '../../util/array_utils';
import {TStylingRange} from '../interfaces/styling';
import {AttributeMarker} from './attribute_marker';

import {TIcu} from './i18n';
import {CssSelector} from './projection';
import {RNode} from './renderer_dom';
import type {LView, TView} from './view';

/**
 * TNodeType corresponds to the {@link TNode} `type` property.
 *
 * NOTE: type IDs are such that we use each bit to denote a type. This is done so that we can easily
 * check if the `TNode` is of more than one type.
 *
 * `if (tNode.type === TNodeType.Text || tNode.type === TNode.Element)`
 * can be written as:
 * `if (tNode.type & (TNodeType.Text | TNodeType.Element))`
 *
 * However any given `TNode` can only be of one type.
 */
export const enum TNodeType {
  /**
   * The TNode contains information about a DOM element aka {@link RText}.
   */
  Text = 0b1,

  /**
   * The TNode contains information about a DOM element aka {@link RElement}.
   */
  Element = 0b10,

  /**
   * The TNode contains information about an {@link LContainer} for embedded views.
   */
  Container = 0b100,

  /**
   * The TNode contains information about an `<ng-container>` element {@link RNode}.
   */
  ElementContainer = 0b1000,

  /**
   * The TNode contains information about an `<ng-content>` projection
   */
  Projection = 0b10000,

  /**
   * The TNode contains information about an ICU comment used in `i18n`.
   */
  Icu = 0b100000,

  /**
   * Special node type representing a placeholder for future `TNode` at this location.
   *
   * I18n translation blocks are created before the element nodes which they contain. (I18n blocks
   * can span over many elements.) Because i18n `TNode`s (representing text) are created first they
   * often may need to point to element `TNode`s which are not yet created. In such a case we create
   * a `Placeholder` `TNode`. This allows the i18n to structurally link the `TNode`s together
   * without knowing any information about the future nodes which will be at that location.
   *
   * On `firstCreatePass` When element instruction executes it will try to create a `TNode` at that
   * location. Seeing a `Placeholder` `TNode` already there tells the system that it should reuse
   * existing `TNode` (rather than create a new one) and just update the missing information.
   */
  Placeholder = 0b1000000,

  /**
   * The TNode contains information about a `@let` declaration.
   */
  LetDeclaration = 0b10000000,

  // Combined Types These should never be used for `TNode.type` only as a useful way to check
  // if `TNode.type` is one of several choices.

  // See: https://github.com/microsoft/TypeScript/issues/35875 why we can't refer to existing enum.
  AnyRNode = 0b11, // Text | Element
  AnyContainer = 0b1100, // Container | ElementContainer
}

/**
 * Converts `TNodeType` into human readable text.
 * Make sure this matches with `TNodeType`
 */
export function toTNodeTypeAsString(tNodeType: TNodeType): string {
  let text = '';
  tNodeType & TNodeType.Text && (text += '|Text');
  tNodeType & TNodeType.Element && (text += '|Element');
  tNodeType & TNodeType.Container && (text += '|Container');
  tNodeType & TNodeType.ElementContainer && (text += '|ElementContainer');
  tNodeType & TNodeType.Projection && (text += '|Projection');
  tNodeType & TNodeType.Icu && (text += '|IcuContainer');
  tNodeType & TNodeType.Placeholder && (text += '|Placeholder');
  tNodeType & TNodeType.LetDeclaration && (text += '|LetDeclaration');
  return text.length > 0 ? text.substring(1) : text;
}

/**
 * Helper function to detect if a given value matches a `TNode` shape.
 *
 * The logic uses the `insertBeforeIndex` and its possible values as
 * a way to differentiate a TNode shape from other types of objects
 * within the `TView.data`. This is not a perfect check, but it can
 * be a reasonable differentiator, since we control the shapes of objects
 * within `TView.data`.
 */
export function isTNodeShape(value: unknown): value is TNode {
  return (
    value != null &&
    typeof value === 'object' &&
    ((value as TNode).insertBeforeIndex === null ||
      typeof (value as TNode).insertBeforeIndex === 'number' ||
      Array.isArray((value as TNode).insertBeforeIndex))
  );
}

export function isLetDeclaration(tNode: TNode): boolean {
  return !!(tNode.type & TNodeType.LetDeclaration);
}

/**
 * Corresponds to the TNode.flags property.
 */
export const enum TNodeFlags {
  /** Bit #1 - This bit is set if the node is a host for any directive (including a component) */
  isDirectiveHost = 0x1,

  /** Bit #2 - This bit is set if the node has been projected */
  isProjected = 0x2,

  /** Bit #3 - This bit is set if any directive on this node has content queries */
  hasContentQuery = 0x4,

  /** Bit #4 - This bit is set if the node has any "class" inputs */
  hasClassInput = 0x8,

  /** Bit #5 - This bit is set if the node has any "style" inputs */
  hasStyleInput = 0x10,

  /** Bit #6 - This bit is set if the node has been detached by i18n */
  isDetached = 0x20,

  /**
   * Bit #7 - This bit is set if the node has directives with host bindings.
   *
   * This flags allows us to guard host-binding logic and invoke it only on nodes
   * that actually have directives with host bindings.
   */
  hasHostBindings = 0x40,

  /**
   * Bit #8 - This bit is set if the node is a located inside skip hydration block.
   */
  inSkipHydrationBlock = 0x80,

  /**
   * Bit #9 - This bit is set if the node is a start of a set of control flow blocks.
   */
  isControlFlowStart = 0x100,

  /**
   * Bit #10 - This bit is set if the node is within a set of control flow blocks.
   */
  isInControlFlow = 0x200,
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
 * A combination of:
 * - Attribute names and values.
 * - Special markers acting as flags to alter attributes processing.
 * - Parsed ngProjectAs selectors.
 */
export type TAttributes = (string | AttributeMarker | CssSelector)[];

/**
 * Constants that are associated with a view. Includes:
 * - Attribute arrays.
 * - Local definition arrays.
 * - Translated messages (i18n).
 */
export type TConstants = (TAttributes | string)[];

/**
 * Factory function that returns an array of consts. Consts can be represented as a function in
 * case any additional statements are required to define consts in the list. An example is i18n
 * where additional i18n calls are generated, which should be executed when consts are requested
 * for the first time.
 */
export type TConstantsFactory = () => TConstants;

/**
 * TConstants type that describes how the `consts` field is generated on ComponentDef: it can be
 * either an array or a factory function that returns that array.
 */
export type TConstantsOrFactory = TConstants | TConstantsFactory;

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
   * Insert before existing DOM node index.
   *
   * When DOM nodes are being inserted, normally they are being appended as they are created.
   * Under i18n case, the translated text nodes are created ahead of time as part of the
   * `ɵɵi18nStart` instruction which means that this `TNode` can't just be appended and instead
   * needs to be inserted using `insertBeforeIndex` semantics.
   *
   * Additionally sometimes it is necessary to insert new text nodes as a child of this `TNode`. In
   * such a case the value stores an array of text nodes to insert.
   *
   * Example:
   * ```html
   * <div i18n>
   *   Hello <span>World</span>!
   * </div>
   * ```
   * In the above example the `ɵɵi18nStart` instruction can create `Hello `, `World` and `!` text
   * nodes. It can also insert `Hello ` and `!` text node as a child of `<div>`, but it can't
   * insert `World` because the `<span>` node has not yet been created. In such a case the
   * `<span>` `TNode` will have an array which will direct the `<span>` to not only insert
   * itself in front of `!` but also to insert the `World` (created by `ɵɵi18nStart`) into
   * `<span>` itself.
   *
   * Pseudo code:
   * ```ts
   *   if (insertBeforeIndex === null) {
   *     // append as normal
   *   } else if (Array.isArray(insertBeforeIndex)) {
   *     // First insert current `TNode` at correct location
   *     const currentNode = lView[this.index];
   *     parentNode.insertBefore(currentNode, lView[this.insertBeforeIndex[0]]);
   *     // Now append all of the children
   *     for(let i=1; i<this.insertBeforeIndex; i++) {
   *       currentNode.appendChild(lView[this.insertBeforeIndex[i]]);
   *     }
   *   } else {
   *     parentNode.insertBefore(lView[this.index], lView[this.insertBeforeIndex])
   *   }
   * ```
   * - null: Append as normal using `parentNode.appendChild`
   * - `number`: Append using
   *      `parentNode.insertBefore(lView[this.index], lView[this.insertBeforeIndex])`
   *
   * *Initialization*
   *
   * Because `ɵɵi18nStart` executes before nodes are created, on `TView.firstCreatePass` it is not
   * possible for `ɵɵi18nStart` to set the `insertBeforeIndex` value as the corresponding `TNode`
   * has not yet been created. For this reason the `ɵɵi18nStart` creates a `TNodeType.Placeholder`
   * `TNode` at that location. See `TNodeType.Placeholder` for more information.
   */
  insertBeforeIndex: InsertBeforeIndex;

  /**
   * The index of the closest injector in this node's LView.
   *
   * If the index === -1, there is no injector on this node or any ancestor node in this view.
   *
   * If the index !== -1, it is the index of this node's injector OR the index of a parent
   * injector in the same view. We pass the parent injector index down the node tree of a view so
   * it's possible to find the parent injector without walking a potentially deep node tree.
   * Injector indices are not set across view boundaries because there could be multiple component
   * hosts.
   *
   * If tNode.injectorIndex === tNode.parent.injectorIndex, then the index belongs to a parent
   * injector.
   */
  injectorIndex: number;

  /** Stores starting index of the directives. */
  directiveStart: number;

  /**
   * Stores final exclusive index of the directives.
   *
   * The area right behind the `directiveStart-directiveEnd` range is used to allocate the
   * `HostBindingFunction` `vars` (or null if no bindings.) Therefore `directiveEnd` is used to set
   * `LFrame.bindingRootIndex` before `HostBindingFunction` is executed.
   */
  directiveEnd: number;

  /**
   * Offset from the `directiveStart` at which the component (one at most) of the node is stored.
   * Set to -1 if no components have been applied to the node. Component index can be found using
   * `directiveStart + componentOffset`.
   */
  componentOffset: number;

  /**
   * Stores the last directive which had a styling instruction.
   *
   * Initial value of this is `-1` which means that no `hostBindings` styling instruction has
   * executed. As `hostBindings` instructions execute they set the value to the index of the
   * `DirectiveDef` which contained the last `hostBindings` styling instruction.
   *
   * Valid values are:
   * - `-1` No `hostBindings` instruction has executed.
   * - `directiveStart <= directiveStylingLast < directiveEnd`: Points to the `DirectiveDef` of
   * the last styling instruction which executed in the `hostBindings`.
   *
   * This data is needed so that styling instructions know which static styling data needs to be
   * collected from the `DirectiveDef.hostAttrs`. A styling instruction needs to collect all data
   * since last styling instruction.
   */
  directiveStylingLast: number;

  /**
   * Stores indexes of property bindings. This field is only set in the ngDevMode and holds
   * indexes of property bindings so TestBed can get bound property metadata for a given node.
   */
  propertyBindings: number[] | null;

  /**
   * Stores if Node isComponent, isProjected, hasContentQuery, hasClassInput and hasStyleInput
   * etc.
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

  /**
   * The value name associated with this node.
   * if type:
   *   `TNodeType.Text`: text value
   *   `TNodeType.Element`: tag name
   *   `TNodeType.ICUContainer`: `TIcu`
   */
  value: any;

  /**
   * Attributes associated with an element. We need to store attributes to support various
   * use-cases (attribute injection, content projection with selectors, directives matching).
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
  attrs: TAttributes | null;

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
  mergedAttrs: TAttributes | null;

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
  localNames: (string | number)[] | null;

  /** Information about input properties that need to be set once from attribute data. */
  initialInputs: InitialInputData | null;

  /**
   * Input data for all directives on this node. `null` means that there are no directives with
   * inputs on this node.
   */
  inputs: NodeInputBindings | null;

  /**
   * Input data for host directives applied to the node.
   */
  hostDirectiveInputs: HostDirectiveInputs | null;

  /**
   * Output data for all directives on this node. `null` means that there are no directives with
   * outputs on this node.
   */
  outputs: NodeOutputBindings | null;

  /**
   * Input data for host directives applied to the node.
   */
  hostDirectiveOutputs: HostDirectiveOutputs | null;

  /**
   * Mapping between directive classes applied to the node and their indexes.
   */
  directiveToIndex: DirectiveIndexMap | null;

  /**
   * The TView attached to this node.
   *
   * If this TNode corresponds to an LContainer with a template (e.g. structural
   * directive), the template's TView will be stored here.
   *
   * If this TNode corresponds to an element, tView will be `null`.
   */
  tView: TView | null;

  /**
   * The next sibling node. Necessary so we can propagate through the root nodes of a view
   * to insert them or remove them from the DOM.
   */
  next: TNode | null;

  /**
   * The previous sibling node.
   * This simplifies operations when we need a pointer to the previous node.
   */
  prev: TNode | null;

  /**
   * The next projected sibling. Since in Angular content projection works on the node-by-node
   * basis the act of projecting nodes might change nodes relationship at the insertion point
   * (target view). At the same time we need to keep initial relationship between nodes as
   * expressed in content view.
   */
  projectionNext: TNode | null;

  /**
   * First child of the current node.
   *
   * For component nodes, the child will always be a ContentChild (in same view).
   * For embedded view nodes, the child will be in their child view.
   */
  child: TNode | null;

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
  parent: TElementNode | TContainerNode | null;

  /**
   * List of projected TNodes for a given component host element OR index into the said nodes.
   *
   * For easier discussion assume this example:
   * `<parent>`'s view definition:
   * ```html
   * <child id="c1">content1</child>
   * <child id="c2"><span>content2</span></child>
   * ```
   * `<child>`'s view definition:
   * ```html
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
   *   because the same component (`<child>`) can be used in multiple locations (`c1`, `c2`) and
   * as a result have different set of nodes to project.
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
  projection: (TNode | RNode[])[] | number | null;

  /**
   * A collection of all `style` static values for an element (including from host).
   *
   * This field will be populated if and when:
   *
   * - There are one or more initial `style`s on an element (e.g. `<div style="width:200px;">`)
   * - There are one or more initial `style`s on a directive/component host
   *   (e.g. `@Directive({host: {style: "width:200px;" } }`)
   */
  styles: string | null;

  /**
   * A collection of all `style` static values for an element excluding host sources.
   *
   * Populated when there are one or more initial `style`s on an element
   * (e.g. `<div style="width:200px;">`)
   * Must be stored separately from `tNode.styles` to facilitate setting directive
   * inputs that shadow the `style` property. If we used `tNode.styles` as is for shadowed inputs,
   * we would feed host styles back into directives as "inputs". If we used `tNode.attrs`, we
   * would have to concatenate the attributes on every template pass. Instead, we process once on
   * first create pass and store here.
   */
  stylesWithoutHost: string | null;

  /**
   * A `KeyValueArray` version of residual `styles`.
   *
   * When there are styling instructions than each instruction stores the static styling
   * which is of lower priority than itself. This means that there may be a higher priority
   * styling than the instruction.
   *
   * Imagine:
   * ```angular-ts
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
  residualStyles: KeyValueArray<any> | undefined | null;

  /**
   * A collection of all class static values for an element (including from host).
   *
   * This field will be populated if and when:
   *
   * - There are one or more initial classes on an element (e.g. `<div class="one two three">`)
   * - There are one or more initial classes on an directive/component host
   *   (e.g. `@Directive({host: {class: "SOME_CLASS" } }`)
   */
  classes: string | null;

  /**
   * A collection of all class static values for an element excluding host sources.
   *
   * Populated when there are one or more initial classes on an element
   * (e.g. `<div class="SOME_CLASS">`)
   * Must be stored separately from `tNode.classes` to facilitate setting directive
   * inputs that shadow the `class` property. If we used `tNode.classes` as is for shadowed
   * inputs, we would feed host classes back into directives as "inputs". If we used
   * `tNode.attrs`, we would have to concatenate the attributes on every template pass. Instead,
   * we process once on first create pass and store here.
   */
  classesWithoutHost: string | null;

  /**
   * A `KeyValueArray` version of residual `classes`.
   *
   * Same as `TNode.residualStyles` but for classes.
   *
   * - `undefined': not initialized.
   * - `null`: initialized but `classes` is `null`
   * - `KeyValueArray`: parsed version of `classes`.
   */
  residualClasses: KeyValueArray<any> | undefined | null;

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

/**
 * See `TNode.insertBeforeIndex`
 */
export type InsertBeforeIndex = null | number | number[];

/** Static data for an element  */
export interface TElementNode extends TNode {
  /** Index in the data[] array */
  index: number;
  child: TElementNode | TTextNode | TElementContainerNode | TContainerNode | TProjectionNode | null;
  /**
   * Element nodes will have parents unless they are the first node of a component or
   * embedded view (which means their parent is in a different view and must be
   * retrieved using viewData[HOST_NODE]).
   */
  parent: TElementNode | TElementContainerNode | null;
  tView: null;

  /**
   * If this is a component TNode with projection, this will be an array of projected
   * TNodes or native nodes (see TNode.projection for more info). If it's a regular element node
   * or a component without projection, it will be null.
   */
  projection: (TNode | RNode[])[] | null;

  /**
   * Stores TagName
   */
  value: string;
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
  parent: TElementNode | TElementContainerNode | null;
  tView: null;
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
  parent: TElementNode | TElementContainerNode | null;
  tView: TView | null;
  projection: null;
  value: null;
}

/** Static data for an <ng-container> */
export interface TElementContainerNode extends TNode {
  /** Index in the LView[] array. */
  index: number;
  child: TElementNode | TTextNode | TContainerNode | TElementContainerNode | TProjectionNode | null;
  parent: TElementNode | TElementContainerNode | null;
  tView: null;
  projection: null;
}

/** Static data for an ICU expression */
export interface TIcuContainerNode extends TNode {
  /** Index in the LView[] array. */
  index: number;
  child: null;
  parent: TElementNode | TElementContainerNode | null;
  tView: null;
  projection: null;
  value: TIcu;
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
  parent: TElementNode | TElementContainerNode | null;
  tView: null;

  /** Index of the projection node. (See TNode.projection for more info.) */
  projection: number;
  value: null;
}

/**
 * Static data for a `@let` declaration. This node is necessary, because the expression of a
 * `@let` declaration can contain code that uses the node injector (e.g. pipes). In order for
 * the node injector to work, it needs this `TNode`.
 */
export interface TLetDeclarationNode extends TNode {
  index: number;
  child: null;
  parent: TElementNode | TElementContainerNode | null;
  tView: null;
  projection: null;
  value: null; // TODO(crisbeto): capture the name here? Might come in handy for the dev tools.
}

/**
 * A union type representing all TNode types that can host a directive.
 */
export type TDirectiveHostNode = TElementNode | TContainerNode | TElementContainerNode;

/**
 * Maps the public names of outputs available on a specific node to the index
 * of the directive instance that defines the output, for example:
 *
 * ```
 * {
 *   "publicName": [0, 5]
 * }
 * ```
 */
export type NodeOutputBindings = Record<string, number[]>;

/**
 * Maps the public names of inputs applied to a specific node to the index of the
 * directive instance to which the input value should be written, for example:
 *
 * ```
 * {
 *   "publicName": [0, 5]
 * }
 * ```
 */
export type NodeInputBindings = Record<string, number[]>;

/**
 * This array contains information about input properties that
 * need to be set once from attribute data. It's ordered by
 * directive index (relative to element) so it's simple to
 * look up a specific directive's initial input data.
 *
 * Within each sub-array:
 *
 * i+0: public name
 * i+1: initial value
 *
 * If a directive on a node does not have any input properties
 * that should be set from attributes, its index is set to null
 * to avoid a sparse array.
 *
 * e.g. [null, ['role-min', 'minified-input', 'button']]
 */
export type InitialInputData = (InitialInputs | null)[];

/**
 * Used by InitialInputData to store input properties
 * that should be set once from attributes.
 *
 * i+0: attribute name
 * i+1: minified/internal input name
 * i+2: input flags
 * i+3: initial value
 *
 * e.g. ['role-min', 'minified-input', 'button']
 */
export type InitialInputs = string[];

/**
 * Represents inputs coming from a host directive and exposed on a TNode.
 *
 * - The key is the public name of an input as it is exposed on the specific node.
 * - The value is an array where:
 *   - i+0: Index of the host directive that should be written to.
 *   - i+1: Public name of the input as it was defined on the host directive before aliasing.
 */
export type HostDirectiveInputs = Record<string, (number | string)[]>;

/**
 * Represents outputs coming from a host directive and exposed on a TNode.
 *
 * - The key is the public name of an output as it is exposed on the specific node.
 * - The value is an array where:
 *   - i+0: Index of the host directive on which the output is defined..
 *   - i+1: Public name of the output as it was defined on the host directive before aliasing.
 */
export type HostDirectiveOutputs = Record<string, (number | string)[]>;

/**
 * Represents a map between a class reference and the index at which its directive is available on
 * a specific TNode. The value can be either:
 *   1. A number means that there's only one selector-matched directive on the node and it
 *      doesn't have any host directives.
 *   2. An array means that there's a selector-matched directive and it has host directives.
 *      The array is structured as follows:
 *        - 0: Index of the selector-matched directive.
 *        - 1: Start index of the range within which the host directives are defined.
 *        - 2: End of the host directive range.
 *
 * Example:
 * ```
 * Map {
 *   [NoHostDirectives]: 5,
 *   [HasHostDirectives]: [10, 6, 8],
 * }
 * ```
 */
export type DirectiveIndexMap = Map<
  Type<unknown>,
  number | [directiveIndex: number, hostDirectivesStart: number, hostDirectivesEnd: number]
>;

/**
 * Type representing a set of TNodes that can have local refs (`#foo`) placed on them.
 */
export type TNodeWithLocalRefs = TContainerNode | TElementNode | TElementContainerNode;

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
 * ```html
 * <div my-dir [class]="exp"></div>
 * ```
 * and
 * ```ts
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
 * ```html
 * <div my-dir [style]="exp"></div>
 * ```
 * and
 * ```ts
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
