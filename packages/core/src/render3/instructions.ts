/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './ng_dev_mode';

import {assertEqual, assertLessThan, assertNotEqual, assertNotNull, assertNull, assertSame} from './assert';
import {LContainer, TContainer} from './interfaces/container';
import {CssSelector, LProjection} from './interfaces/projection';
import {LQueries} from './interfaces/query';
import {LView, LifecycleStage, TData, TView} from './interfaces/view';

import {LContainerNode, LElementNode, LNode, LNodeFlags, LProjectionNode, LTextNode, LViewNode, TNode, TContainerNode, InitialInputData, InitialInputs, PropertyAliases, PropertyAliasValue,} from './interfaces/node';
import {assertNodeType} from './node_assert';
import {appendChild, insertChild, insertView, appendProjectedNode, removeView, canInsertNativeNode} from './node_manipulation';
import {matchingSelectorIndex} from './node_selector_matcher';
import {ComponentDef, ComponentTemplate, ComponentType, DirectiveDef, DirectiveType} from './interfaces/definition';
import {RElement, RText, Renderer3, RendererFactory3, ProceduralRenderer3, ObjectOrientedRenderer3, RendererStyleFlags3, isProceduralRenderer} from './interfaces/renderer';
import {isDifferent, stringify} from './util';
import {executeHooks, executeContentHooks, queueLifecycleHooks, queueInitHooks, executeInitHooks} from './hooks';

/**
 * Directive (D) sets a property on all component instances using this constant as a key and the
 * component's host node (LElement) as the value. This is used in methods like detectChanges to
 * facilitate jumping from an instance to the host node.
 */
export const NG_HOST_SYMBOL = '__ngHostLNode__';

/**
 * This property gets set before entering a template.
 *
 * This renderer can be one of two varieties of Renderer3:
 *
 * - ObjectedOrientedRenderer3
 *
 * This is the native browser API style, e.g. operations are methods on individual objects
 * like HTMLElement. With this style, no additional code is needed as a facade (reducing payload
 * size).
 *
 * - ProceduralRenderer3
 *
 * In non-native browser environments (e.g. platforms such as web-workers), this is the facade
 * that enables element manipulation. This also facilitates backwards compatibility with
 * Renderer2.
 */
let renderer: Renderer3;
let rendererFactory: RendererFactory3;

export function getRenderer(): Renderer3 {
  // top level variables should not be exported for performance reason (PERF_NOTES.md)
  return renderer;
}

/** Used to set the parent property when nodes are created. */
let previousOrParentNode: LNode;

export function getPreviousOrParentNode(): LNode {
  // top level variables should not be exported for performance reason (PERF_NOTES.md)
  return previousOrParentNode;
}

/**
 * If `isParent` is:
 *  - `true`: then `previousOrParentNode` points to a parent node.
 *  - `false`: then `previousOrParentNode` points to previous node (sibling).
 */
let isParent: boolean;

/**
 * Static data that corresponds to the instance-specific data array on an LView.
 *
 * Each node's static data is stored in tData at the same index that it's stored
 * in the data array. Each directive's definition is stored here at the same index
 * as its directive instance in the data array. Any nodes that do not have static
 * data store a null value in tData to avoid a sparse array.
 */
let tData: TData;

/**
 * State of the current view being processed.
 *
 * NOTE: we cheat here and initialize it to `null` even thought the type does not
 * contain `null`. This is because we expect this value to be not `null` as soon
 * as we enter the view. Declaring the type as `null` would require us to place `!`
 * in most instructions since they all assume that `currentView` is defined.
 */
let currentView: LView = null !;

let currentQueries: LQueries|null;

export function getCurrentQueries(QueryType: {new (): LQueries}): LQueries {
  // top level variables should not be exported for performance reason (PERF_NOTES.md)
  return currentQueries || (currentQueries = new QueryType());
}

/**
 * This property gets set before entering a template.
 */
let creationMode: boolean;

export function getCreationMode(): boolean {
  // top level variables should not be exported for performance reason (PERF_NOTES.md)
  return creationMode;
}

/**
 * An array of nodes (text, element, container, etc), their bindings, and
 * any local variables that need to be stored between invocations.
 */
let data: any[];

/**
 * Points to the next binding index to read or write to.
 */
let bindingIndex: number;

/**
 * When a view is destroyed, listeners need to be released and outputs need to be
 * unsubscribed. This cleanup array stores both listener data (in chunks of 4)
 * and output data (in chunks of 2) for a particular view. Combining the arrays
 * saves on memory (70 bytes per array) and on a few bytes of code size (for two
 * separate for loops).
 *
 * If it's a listener being stored:
 * 1st index is: event name to remove
 * 2nd index is: native element
 * 3rd index is: listener function
 * 4th index is: useCapture boolean
 *
 * If it's an output subscription:
 * 1st index is: unsubscribe function
 * 2nd index is: context for function
 */
let cleanup: any[]|null;

const enum BindingDirection {
  Input,
  Output,
}

/**
 * Swap the current state with a new state.
 *
 * For performance reasons we store the state in the top level of the module.
 * This way we minimize the number of properties to read. Whenever a new view
 * is entered we have to store the state for later, and when the view is
 * exited the state has to be restored
 *
 * @param newView New state to become active
 * @param host Element to which the View is a child of
 * @returns the previous state;
 */
export function enterView(newView: LView, host: LElementNode | LViewNode | null): LView {
  const oldView = currentView;
  data = newView && newView.data;
  bindingIndex = newView && newView.bindingStartIndex || 0;
  tData = newView && newView.tView.data;
  creationMode = newView && newView.creationMode;

  cleanup = newView && newView.cleanup;
  renderer = newView && newView.renderer;

  if (host != null) {
    previousOrParentNode = host;
    isParent = true;
  }

  currentView = newView;
  currentQueries = newView && newView.queries;

  return oldView !;
}

/**
 * Used in lieu of enterView to make it clear when we are exiting a child view. This makes
 * the direction of traversal (up or down the view tree) a bit clearer.
 */
export function leaveView(newView: LView): void {
  executeHooks(
      currentView.data, currentView.tView.viewHooks, currentView.tView.viewCheckHooks,
      creationMode);
  currentView.creationMode = false;
  currentView.lifecycleStage = LifecycleStage.INIT;
  currentView.tView.firstTemplatePass = false;
  enterView(newView, null);
}

export function createLView(
    viewId: number, renderer: Renderer3, tView: TView, template: ComponentTemplate<any>| null,
    context: any | null): LView {
  const newView = {
    parent: currentView,
    id: viewId,    // -1 for component views
    node: null !,  // until we initialize it in createNode.
    data: [],
    tView: tView,
    cleanup: null,
    renderer: renderer,
    child: null,
    tail: null,
    next: null,
    bindingStartIndex: null,
    creationMode: true,
    template: template,
    context: context,
    dynamicViewCount: 0,
    lifecycleStage: LifecycleStage.INIT,
    queries: null,
  };

  return newView;
}

/**
 * A common way of creating the LNode to make sure that all of them have same shape to
 * keep the execution code monomorphic and fast.
 */
export function createLNode(
    index: number | null, type: LNodeFlags.Element, native: RElement | RText | null,
    lView?: LView | null): LElementNode;
export function createLNode(
    index: null, type: LNodeFlags.View, native: null, lView: LView): LViewNode;
export function createLNode(
    index: number, type: LNodeFlags.Container, native: undefined,
    lContainer: LContainer): LContainerNode;
export function createLNode(
    index: number, type: LNodeFlags.Projection, native: null,
    lProjection: LProjection): LProjectionNode;
export function createLNode(
    index: number | null, type: LNodeFlags, native: RText | RElement | null | undefined,
    state?: null | LView | LContainer | LProjection): LElementNode&LTextNode&LViewNode&
    LContainerNode&LProjectionNode {
  const parent = isParent ? previousOrParentNode :
                            previousOrParentNode && previousOrParentNode.parent as LNode;
  let queries =
      (isParent ? currentQueries : previousOrParentNode && previousOrParentNode.queries) ||
      parent && parent.queries && parent.queries.child();
  const isState = state != null;
  const node: LElementNode&LTextNode&LViewNode&LContainerNode&LProjectionNode = {
    flags: type,
    native: native as any,
    view: currentView,
    parent: parent as any,
    child: null,
    next: null,
    nodeInjector: parent ? parent.nodeInjector : null,
    data: isState ? state as any : null,
    queries: queries,
    tNode: null,
    pNextOrParent: null
  };

  if ((type & LNodeFlags.ViewOrElement) === LNodeFlags.ViewOrElement && isState) {
    // Bit of a hack to bust through the readonly because there is a circular dep between
    // LView and LNode.
    ngDevMode && assertNull((state as LView).node, 'LView.node should not have been initialized');
    (state as LView as{node: LNode}).node = node;
  }
  if (index != null) {
    // We are Element or Container
    ngDevMode && assertDataNext(index);
    data[index] = node;

    // Every node adds a value to the static data array to avoid a sparse array
    if (index >= tData.length) {
      tData[index] = null;
    } else {
      node.tNode = tData[index] as TNode;
    }

    // Now link ourselves into the tree.
    if (isParent) {
      currentQueries = null;
      if (previousOrParentNode.view === currentView ||
          (previousOrParentNode.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.View) {
        // We are in the same view, which means we are adding content node to the parent View.
        ngDevMode && assertNull(
                         previousOrParentNode.child,
                         `previousOrParentNode's child should not have been set.`);
        previousOrParentNode.child = node;
      } else {
        // We are adding component view, so we don't link parent node child to this node.
      }
    } else if (previousOrParentNode) {
      ngDevMode && assertNull(
                       previousOrParentNode.next,
                       `previousOrParentNode's next property should not have been set.`);
      previousOrParentNode.next = node;
    }
  }
  previousOrParentNode = node;
  isParent = true;
  return node;
}


//////////////////////////
//// Render
//////////////////////////

/**
 * Resets the application state.
 */
function resetApplicationState() {
  isParent = false;
  previousOrParentNode = null !;
}

/**
 *
 * @param host Existing node to render into.
 * @param template Template function with the instructions.
 * @param context to pass into the template.
 */
export function renderTemplate<T>(
    hostNode: RElement, template: ComponentTemplate<T>, context: T,
    providedRendererFactory: RendererFactory3, host: LElementNode | null): LElementNode {
  if (host == null) {
    resetApplicationState();
    rendererFactory = providedRendererFactory;
    host = createLNode(
        null, LNodeFlags.Element, hostNode,
        createLView(
            -1, providedRendererFactory.createRenderer(null, null), getOrCreateTView(template),
            null, null));
  }
  const hostView = host.data !;
  ngDevMode && assertNotNull(hostView, 'Host node should have an LView defined in host.data.');
  renderComponentOrTemplate(host, hostView, context, template);
  return host;
}

export function renderEmbeddedTemplate<T>(
    viewNode: LViewNode | null, template: ComponentTemplate<T>, context: T,
    renderer: Renderer3): LViewNode {
  const _isParent = isParent;
  const _previousOrParentNode = previousOrParentNode;
  try {
    isParent = true;
    previousOrParentNode = null !;
    let cm: boolean = false;
    if (viewNode == null) {
      const view = createLView(-1, renderer, createTView(), template, context);
      viewNode = createLNode(null, LNodeFlags.View, null, view);
      cm = true;
    }
    enterView(viewNode.data, viewNode);

    template(context, cm);
  } finally {
    refreshDynamicChildren();
    leaveView(currentView !.parent !);
    isParent = _isParent;
    previousOrParentNode = _previousOrParentNode;
  }
  return viewNode;
}

export function renderComponentOrTemplate<T>(
    node: LElementNode, hostView: LView, componentOrContext: T, template?: ComponentTemplate<T>) {
  const oldView = enterView(hostView, node);
  try {
    if (rendererFactory.begin) {
      rendererFactory.begin();
    }
    if (template) {
      template(componentOrContext !, creationMode);
    } else {
      // Element was stored at 0 and directive was stored at 1 in renderComponent
      // so to refresh the component, refresh() needs to be called with (1, 0)
      directiveRefresh(1, 0);
    }
  } finally {
    if (rendererFactory.end) {
      rendererFactory.end();
    }
    leaveView(oldView);
  }
}

//////////////////////////
//// Element
//////////////////////////

/**
 * Create DOM element. The instruction must later be followed by `elementEnd()` call.
 *
 * @param index Index of the element in the data array
 * @param nameOrComponentType Name of the DOM Node or `ComponentType` to create.
 * @param attrs Statically bound set of attributes to be written into the DOM element on creation.
 * @param directiveTypes A set of directives declared on this element.
 * @param localRefs A set of local reference bindings on the element.
 *
 * Attributes and localRefs are passed as an array of strings where elements with an even index
 * hold an attribute name and elements with an odd index hold an attribute value, ex.:
 * ['id', 'warning5', 'class', 'alert']
 */
export function elementStart(
    index: number, nameOrComponentType?: string | ComponentType<any>, attrs?: string[] | null,
    directiveTypes?: DirectiveType<any>[] | null, localRefs?: string[] | null): RElement {
  let node: LElementNode;
  let native: RElement;

  if (nameOrComponentType == null) {
    // native node retrieval - used for exporting elements as tpl local variables (<div #foo>)
    const node = data[index] !;
    native = node && (node as LElementNode).native;
  } else {
    ngDevMode &&
        assertNull(currentView.bindingStartIndex, 'elements should be created before any bindings');
    const isHostElement = typeof nameOrComponentType !== 'string';
    // MEGAMORPHIC: `ngComponentDef` is a megamorphic property access here.
    // This is OK, since we will refactor this code and store the result in `TView.data`
    // which means that we will be reading this value only once. We are trading clean/simple
    // template
    // code for slight startup(first run) performance. (No impact on subsequent runs)
    // TODO(misko): refactor this to store the `ComponentDef` in `TView.data`.
    const hostComponentDef =
        isHostElement ? (nameOrComponentType as ComponentType<any>).ngComponentDef : null;
    const name = isHostElement ? hostComponentDef !.tag : nameOrComponentType as string;
    if (name === null) {
      // TODO: future support for nameless components.
      throw 'for now name is required';
    } else {
      native = renderer.createElement(name);

      let componentView: LView|null = null;
      if (isHostElement) {
        const tView = getOrCreateTView(hostComponentDef !.template);
        componentView = addToViewTree(createLView(
            -1, rendererFactory.createRenderer(native, hostComponentDef !.rendererType), tView,
            null, null));
      }

      // Only component views should be added to the view tree directly. Embedded views are
      // accessed through their containers because they may be removed / re-added later.
      node = createLNode(index, LNodeFlags.Element, native, componentView);

      // TODO(misko): implement code which caches the local reference resolution
      const queryName: string|null = hack_findQueryName(hostComponentDef, localRefs, '');

      if (node.tNode == null) {
        ngDevMode && assertDataInRange(index - 1);
        node.tNode = tData[index] =
            createTNode(name, attrs || null, null, hostComponentDef ? null : queryName);
      }

      if (attrs) setUpAttributes(native, attrs);
      appendChild(node.parent !, native, currentView);

      if (hostComponentDef) {
        // TODO(mhevery): This assumes that the directives come in correct order, which
        // is not guaranteed. Must be refactored to take it into account.
        directiveCreate(++index, hostComponentDef.n(), hostComponentDef, queryName);
      }
      hack_declareDirectives(index, directiveTypes, localRefs);
    }
  }
  return native;
}

/**
 * This function instantiates a directive with a correct queryName. It is a hack since we should
 * compute the query value only once and store it with the template (rather than on each invocation)
 */
function hack_declareDirectives(
    index: number, directiveTypes: DirectiveType<any>[] | null | undefined,
    localRefs: string[] | null | undefined, ) {
  if (directiveTypes) {
    // TODO(mhevery): This assumes that the directives come in correct order, which
    // is not guaranteed. Must be refactored to take it into account.
    for (let i = 0; i < directiveTypes.length; i++) {
      // MEGAMORPHIC: `ngDirectiveDef` is a megamorphic property access here.
      // This is OK, since we will refactor this code and store the result in `TView.data`
      // which means that we will be reading this value only once. We are trading clean/simple
      // template
      // code for slight startup(first run) performance. (No impact on subsequent runs)
      // TODO(misko): refactor this to store the `DirectiveDef` in `TView.data`.
      const directiveType = directiveTypes[i];
      const directiveDef = directiveType.ngDirectiveDef;
      directiveCreate(
          ++index, directiveDef.n(), directiveDef, hack_findQueryName(directiveDef, localRefs));
    }
  }
}

/**
 * This function returns the queryName for a directive. It is a hack since we should
 * compute the query value only once and store it with the template (rather than on each invocation)
 */
function hack_findQueryName(
    directiveDef: DirectiveDef<any>| null, localRefs: string[] | null | undefined,
    defaultExport?: string, ): string|null {
  const exportAs = directiveDef && directiveDef.exportAs || defaultExport;
  if (exportAs != null && localRefs) {
    for (let i = 0; i < localRefs.length; i = i + 2) {
      const local = localRefs[i];
      const toExportAs = localRefs[i | 1];
      if (toExportAs === exportAs || toExportAs === defaultExport) {
        return local;
      }
    }
  }
  return null;
}

/**
 * Gets TView from a template function or creates a new TView
 * if it doesn't already exist.
 *
 * @param template The template from which to get static data
 * @returns TView
 */
function getOrCreateTView(template: ComponentTemplate<any>): TView {
  return template.ngPrivateData || (template.ngPrivateData = createTView() as never);
}

/** Creates a TView instance */
export function createTView(): TView {
  return {
    data: [],
    firstTemplatePass: true,
    initHooks: null,
    checkHooks: null,
    contentHooks: null,
    contentCheckHooks: null,
    viewHooks: null,
    viewCheckHooks: null,
    destroyHooks: null
  };
}

function setUpAttributes(native: RElement, attrs: string[]): void {
  ngDevMode && assertEqual(attrs.length % 2, 0, 'each attribute should have a key and a value');

  const isProc = isProceduralRenderer(renderer);
  for (let i = 0; i < attrs.length; i += 2) {
    isProc ? (renderer as ProceduralRenderer3).setAttribute(native, attrs[i], attrs[i | 1]) :
             native.setAttribute(attrs[i], attrs[i | 1]);
  }
}

export function createError(text: string, token: any) {
  return new Error(`Renderer: ${text} [${stringify(token)}]`);
}


/**
 * Locates the host native element, used for bootstrapping existing nodes into rendering pipeline.
 *
 * @param elementOrSelector Render element or CSS selector to locate the element.
 */
export function locateHostElement(
    factory: RendererFactory3, elementOrSelector: RElement | string): RElement|null {
  ngDevMode && assertDataInRange(-1);
  rendererFactory = factory;
  const defaultRenderer = factory.createRenderer(null, null);
  const rNode = typeof elementOrSelector === 'string' ?
      (isProceduralRenderer(defaultRenderer) ?
           defaultRenderer.selectRootElement(elementOrSelector) :
           defaultRenderer.querySelector(elementOrSelector)) :
      elementOrSelector;
  if (ngDevMode && !rNode) {
    if (typeof elementOrSelector === 'string') {
      throw createError('Host node with selector not found:', elementOrSelector);
    } else {
      throw createError('Host node is required:', elementOrSelector);
    }
  }
  return rNode;
}

/**
 * Creates the host LNode.
 *
 * @param rNode Render host element.
 * @param def ComponentDef
 */
export function hostElement(rNode: RElement | null, def: ComponentDef<any>) {
  resetApplicationState();
  createLNode(
      0, LNodeFlags.Element, rNode,
      createLView(-1, renderer, getOrCreateTView(def.template), null, null));
}


/**
 * Adds an event listener to the current node.
 *
 * If an output exists on one of the node's directives, it also subscribes to the output
 * and saves the subscription for later cleanup.
 *
 * @param eventName Name of the event
 * @param listener The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener.
 */
export function listener(eventName: string, listener: EventListener, useCapture = false): void {
  ngDevMode && assertPreviousIsParent();
  const node = previousOrParentNode;
  const native = node.native as RElement;

  // In order to match current behavior, native DOM event listeners must be added for all
  // events (including outputs).
  if (isProceduralRenderer(renderer)) {
    const cleanupFn = renderer.listen(native, eventName, listener);
    (cleanup || (cleanup = currentView.cleanup = [])).push(cleanupFn, null);
  } else {
    native.addEventListener(eventName, listener, useCapture);
    (cleanup || (cleanup = currentView.cleanup = [])).push(eventName, native, listener, useCapture);
  }

  let tNode: TNode|null = node.tNode !;
  if (tNode.outputs === undefined) {
    // if we create TNode here, inputs must be undefined so we know they still need to be
    // checked
    tNode.outputs = generatePropertyAliases(node.flags, BindingDirection.Output);
  }

  const outputs = tNode.outputs;
  let outputData: PropertyAliasValue|undefined;
  if (outputs && (outputData = outputs[eventName])) {
    createOutput(outputData, listener);
  }
}

/**
 * Iterates through the outputs associated with a particular event name and subscribes to
 * each output.
 */
function createOutput(outputs: PropertyAliasValue, listener: Function): void {
  for (let i = 0; i < outputs.length; i += 2) {
    ngDevMode && assertDataInRange(outputs[i] as number);
    const subscription = data[outputs[i] as number][outputs[i | 1]].subscribe(listener);
    cleanup !.push(subscription.unsubscribe, subscription);
  }
}

/** Mark the end of the element. */
export function elementEnd() {
  if (isParent) {
    isParent = false;
  } else {
    ngDevMode && assertHasParent();
    previousOrParentNode = previousOrParentNode.parent !;
  }
  ngDevMode && assertNodeType(previousOrParentNode, LNodeFlags.Element);
  const queries = previousOrParentNode.queries;
  queries && queries.addNode(previousOrParentNode);
  queueLifecycleHooks(previousOrParentNode.flags, currentView);
}

/**
 * Updates the value of removes an attribute on an Element.
 *
 * @param number index The index of the element in the data array
 * @param string name The name of the attribute.
 * @param any value The attribute is removed when value is `null` or `undefined`.
 *                  Otherwise the attribute value is set to the stringified value.
 */
export function elementAttribute(index: number, name: string, value: any): void {
  if (value !== NO_CHANGE) {
    const element: LElementNode = data[index];
    if (value == null) {
      isProceduralRenderer(renderer) ? renderer.removeAttribute(element.native, name) :
                                       element.native.removeAttribute(name);
    } else {
      isProceduralRenderer(renderer) ?
          renderer.setAttribute(element.native, name, stringify(value)) :
          element.native.setAttribute(name, stringify(value));
    }
  }
}

/**
 * Update a property on an Element.
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new @Inputs don't have to be re-compiled.
 *
 * @param index The index of the element to update in the data array
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 */

export function elementProperty<T>(index: number, propName: string, value: T | NO_CHANGE): void {
  if (value === NO_CHANGE) return;
  const node = data[index] as LElementNode;
  const tNode = node.tNode !;
  // if tNode.inputs is undefined, a listener has created outputs, but inputs haven't
  // yet been checked
  if (tNode.inputs === undefined) {
    // mark inputs as checked
    tNode.inputs = generatePropertyAliases(node.flags, BindingDirection.Input);
  }

  const inputData = tNode.inputs;
  let dataValue: PropertyAliasValue|undefined;
  if (inputData && (dataValue = inputData[propName])) {
    setInputsForProperty(dataValue, value);
  } else {
    const native = node.native;
    isProceduralRenderer(renderer) ? renderer.setProperty(native, propName, value) :
                                     (native.setProperty ? native.setProperty(propName, value) :
                                                           (native as any)[propName] = value);
  }
}

/**
 * Constructs a TNode object from the arguments.
 *
 * @param tagName
 * @param attrs
 * @param data
 * @returns the TNode object
 */
function createTNode(
    tagName: string | null, attrs: string[] | null, data: TContainer | null,
    localName: string | null): TNode {
  return {
    tagName: tagName,
    attrs: attrs,
    localNames: localName ? [localName, -1] : null,
    initialInputs: undefined,
    inputs: undefined,
    outputs: undefined,
    data: data
  };
}

/**
 * Given a list of directive indices and minified input names, sets the
 * input properties on the corresponding directives.
 */
function setInputsForProperty(inputs: PropertyAliasValue, value: any): void {
  for (let i = 0; i < inputs.length; i += 2) {
    ngDevMode && assertDataInRange(inputs[i] as number);
    data[inputs[i] as number][inputs[i | 1]] = value;
  }
}

/**
 * Consolidates all inputs or outputs of all directives on this logical node.
 *
 * @param number lNodeFlags logical node flags
 * @param Direction direction whether to consider inputs or outputs
 * @returns PropertyAliases|null aggregate of all properties if any, `null` otherwise
 */
function generatePropertyAliases(lNodeFlags: number, direction: BindingDirection): PropertyAliases|
    null {
  const size = (lNodeFlags & LNodeFlags.SIZE_MASK) >> LNodeFlags.SIZE_SHIFT;
  let propStore: PropertyAliases|null = null;

  if (size > 0) {
    const start = lNodeFlags >> LNodeFlags.INDX_SHIFT;
    const isInput = direction === BindingDirection.Input;

    for (let i = start, ii = start + size; i < ii; i++) {
      const directiveDef = tData ![i] as DirectiveDef<any>;
      const propertyAliasMap: {[publicName: string]: string} =
          isInput ? directiveDef.inputs : directiveDef.outputs;
      for (let publicName in propertyAliasMap) {
        if (propertyAliasMap.hasOwnProperty(publicName)) {
          propStore = propStore || {};
          const internalName = propertyAliasMap[publicName];
          const hasProperty = propStore.hasOwnProperty(publicName);
          hasProperty ? propStore[publicName].push(i, internalName) :
                        (propStore[publicName] = [i, internalName]);
        }
      }
    }
  }
  return propStore;
}

/**
 * Add or remove a class in a classList.
 *
 * This instruction is meant to handle the [class.foo]="exp" case
 *
 * @param index The index of the element to update in the data array
 * @param className Name of class to toggle. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value A value indicating if a given class should be added or removed.
 */
export function elementClass<T>(index: number, className: string, value: T | NO_CHANGE): void {
  if (value !== NO_CHANGE) {
    const lElement = data[index] as LElementNode;
    if (value) {
      isProceduralRenderer(renderer) ? renderer.addClass(lElement.native, className) :
                                       lElement.native.classList.add(className);

    } else {
      isProceduralRenderer(renderer) ? renderer.removeClass(lElement.native, className) :
                                       lElement.native.classList.remove(className);
    }
  }
}

/**
 * Update a given style on an Element.
 *
 * @param index Index of the element to change in the data array
 * @param styleName Name of property. Because it is going to DOM this is not subject to
 *        renaming as part of minification.
 * @param value New value to write (null to remove).
 * @param suffix Suffix to add to style's value (optional).
 */
export function elementStyle<T>(
    index: number, styleName: string, value: T | NO_CHANGE, suffix?: string): void {
  if (value !== NO_CHANGE) {
    const lElement = data[index] as LElementNode;
    if (value == null) {
      isProceduralRenderer(renderer) ?
          renderer.removeStyle(lElement.native, styleName, RendererStyleFlags3.DashCase) :
          lElement.native.style.removeProperty(styleName);
    } else {
      const strValue = suffix ? stringify(value) + suffix : stringify(value);
      isProceduralRenderer(renderer) ?
          renderer.setStyle(lElement.native, styleName, strValue, RendererStyleFlags3.DashCase) :
          lElement.native.style.setProperty(styleName, strValue);
    }
  }
}


//////////////////////////
//// Text
//////////////////////////

/**
 * Create static text node
 *
 * @param index Index of the node in the data array.
 * @param value Value to write. This value will be stringified.
 *   If value is not provided than the actual creation of the text node is delayed.
 */
export function text(index: number, value?: any): void {
  ngDevMode &&
      assertNull(currentView.bindingStartIndex, 'text nodes should be created before bindings');
  const textNode = value != null ?
      (isProceduralRenderer(renderer) ? renderer.createText(stringify(value)) :
                                        renderer.createTextNode(stringify(value))) :
      null;
  const node = createLNode(index, LNodeFlags.Element, textNode);
  // Text nodes are self closing.
  isParent = false;
  appendChild(node.parent !, textNode, currentView);
}

/**
 * Create text node with binding
 * Bindings should be handled externally with the proper bind(1-8) method
 *
 * @param index Index of the node in the data array.
 * @param value Stringified value to write.
 */
export function textBinding<T>(index: number, value: T | NO_CHANGE): void {
  ngDevMode && assertDataInRange(index);
  let existingNode = data[index] as LTextNode;
  ngDevMode && assertNotNull(existingNode, 'existing node');
  if (existingNode.native) {
    // If DOM node exists and value changed, update textContent
    value !== NO_CHANGE &&
        (isProceduralRenderer(renderer) ? renderer.setValue(existingNode.native, stringify(value)) :
                                          existingNode.native.textContent = stringify(value));
  } else {
    // Node was created but DOM node creation was delayed. Create and append now.
    existingNode.native = isProceduralRenderer(renderer) ?
        renderer.createText(stringify(value)) :
        renderer.createTextNode(stringify(value));
    insertChild(existingNode, currentView);
  }
}


//////////////////////////
//// Directive
//////////////////////////

/**
 * Create a directive.
 *
 * NOTE: directives can be created in order other than the index order. They can also
 *       be retrieved before they are created in which case the value will be null.
 *
 * @param index Each directive in a `View` will have a unique index. Directives can
 *        be created or retrieved out of order.
 * @param directive The directive instance.
 * @param directiveDef DirectiveDef object which contains information about the template.
 * @param queryName Name under which the query can retrieve the directive instance.
 */
export function directiveCreate<T>(
    index: number, directive: T, directiveDef: DirectiveDef<T>, queryName?: string | null): T {
  let instance;
  ngDevMode &&
      assertNull(currentView.bindingStartIndex, 'directives should be created before any bindings');
  ngDevMode && assertPreviousIsParent();
  let flags = previousOrParentNode !.flags;
  let size = flags & LNodeFlags.SIZE_MASK;
  if (size === 0) {
    flags = (index << LNodeFlags.INDX_SHIFT) | LNodeFlags.SIZE_SKIP | flags & LNodeFlags.TYPE_MASK;
  } else {
    flags += LNodeFlags.SIZE_SKIP;
  }
  previousOrParentNode !.flags = flags;

  ngDevMode && assertDataInRange(index - 1);
  Object.defineProperty(
      directive, NG_HOST_SYMBOL, {enumerable: false, value: previousOrParentNode});

  data[index] = instance = directive;

  if (index >= tData.length) {
    tData[index] = directiveDef !;
    if (queryName) {
      ngDevMode && assertNotNull(previousOrParentNode.tNode, 'previousOrParentNode.tNode');
      const tNode = previousOrParentNode !.tNode !;
      (tNode.localNames || (tNode.localNames = [])).push(queryName, index);
    }
  }

  const diPublic = directiveDef !.diPublic;
  if (diPublic) {
    diPublic(directiveDef !);
  }

  if (directiveDef !.attributes != null &&
      (previousOrParentNode.flags & LNodeFlags.TYPE_MASK) == LNodeFlags.Element) {
    setUpAttributes(
        (previousOrParentNode as LElementNode).native, directiveDef !.attributes as string[]);
  }

  const tNode: TNode|null = previousOrParentNode.tNode !;
  if (tNode && tNode.attrs) {
    setInputsFromAttrs<T>(instance, directiveDef !.inputs, tNode);
  }

  // Init hooks are queued now so ngOnInit is called in host components before
  // any projected components.
  queueInitHooks(index, directiveDef.onInit, directiveDef.doCheck, currentView.tView);

  return instance;
}

/**
 * Sets initial input properties on directive instances from attribute data
 *
 * @param instance Instance of the directive on which to set the initial inputs
 * @param inputs The list of inputs from the directive def
 * @param tNode The static data for this node
 */
function setInputsFromAttrs<T>(instance: T, inputs: {[key: string]: string}, tNode: TNode): void {
  const directiveIndex =
      ((previousOrParentNode.flags & LNodeFlags.SIZE_MASK) >> LNodeFlags.SIZE_SHIFT) - 1;

  let initialInputData = tNode.initialInputs as InitialInputData | undefined;
  if (initialInputData === undefined || directiveIndex >= initialInputData.length) {
    initialInputData = generateInitialInputs(directiveIndex, inputs, tNode);
  }

  const initialInputs: InitialInputs|null = initialInputData[directiveIndex];
  if (initialInputs) {
    for (let i = 0; i < initialInputs.length; i += 2) {
      (instance as any)[initialInputs[i]] = initialInputs[i | 1];
    }
  }
}

/**
 * Generates initialInputData for a node and stores it in the template's static storage
 * so subsequent template invocations don't have to recalculate it.
 *
 * initialInputData is an array containing values that need to be set as input properties
 * for directives on this node, but only once on creation. We need this array to support
 * the case where you set an @Input property of a directive using attribute-like syntax.
 * e.g. if you have a `name` @Input, you can set it once like this:
 *
 * <my-component name="Bess"></my-component>
 *
 * @param directiveIndex Index to store the initial input data
 * @param inputs The list of inputs from the directive def
 * @param tNode The static data on this node
 */
function generateInitialInputs(
    directiveIndex: number, inputs: {[key: string]: string}, tNode: TNode): InitialInputData {
  const initialInputData: InitialInputData = tNode.initialInputs || (tNode.initialInputs = []);
  initialInputData[directiveIndex] = null;

  const attrs = tNode.attrs !;
  for (let i = 0; i < attrs.length; i += 2) {
    const attrName = attrs[i];
    const minifiedInputName = inputs[attrName];
    if (minifiedInputName !== undefined) {
      const inputsToStore: InitialInputs =
          initialInputData[directiveIndex] || (initialInputData[directiveIndex] = []);
      inputsToStore.push(minifiedInputName, attrs[i | 1]);
    }
  }
  return initialInputData;
}


//////////////////////////
//// ViewContainer & View
//////////////////////////

/**
 * Creates an LContainerNode.
 *
 * Only `LViewNodes` can go into `LContainerNodes`.
 *
 * @param index The index of the container in the data array
 * @param template Optional inline template
 * @param tagName The name of the container element, if applicable
 * @param attrs The attrs attached to the container, if applicable
 * @param localRefs A set of local reference bindings on the element.
 */
export function container(
    index: number, directiveTypes?: DirectiveType<any>[], template?: ComponentTemplate<any>,
    tagName?: string, attrs?: string[], localRefs?: string[] | null): void {
  ngDevMode &&
      assertNull(
          currentView.bindingStartIndex, 'container nodes should be created before any bindings');

  const currentParent = isParent ? previousOrParentNode : previousOrParentNode.parent !;
  ngDevMode && assertNotNull(currentParent, 'containers should have a parent');

  const lContainer = <LContainer>{
    views: [],
    nextIndex: 0,
    // If the direct parent of the container is a view, its views will need to be added
    // through insertView() when its parent view is being inserted:
    renderParent: canInsertNativeNode(currentParent, currentView) ? currentParent : null,
    template: template == null ? null : template,
    next: null,
    parent: currentView,
    dynamicViewCount: 0,
    queries: null
  };

  const node = createLNode(index, LNodeFlags.Container, undefined, lContainer);

  if (node.tNode == null) {
    // TODO(misko): implement queryName caching
    const queryName: string|null = hack_findQueryName(null, localRefs, '');
    node.tNode = tData[index] = createTNode(tagName || null, attrs || null, [], queryName || null);
  }

  // Containers are added to the current view tree instead of their embedded views
  // because views can be removed and re-inserted.
  addToViewTree(node.data);
  hack_declareDirectives(index, directiveTypes, localRefs);

  isParent = false;
  ngDevMode && assertNodeType(previousOrParentNode, LNodeFlags.Container);
  const queries = node.queries;
  if (queries) {
    // check if a given container node matches
    queries.addNode(node);
    // prepare place for matching nodes from views inserted into a given container
    lContainer.queries = queries.container();
  }
}

/**
 * Sets a container up to receive views.
 *
 * @param index The index of the container in the data array
 */
export function containerRefreshStart(index: number): void {
  ngDevMode && assertDataInRange(index);
  previousOrParentNode = data[index] as LNode;
  ngDevMode && assertNodeType(previousOrParentNode, LNodeFlags.Container);
  isParent = true;
  (previousOrParentNode as LContainerNode).data.nextIndex = 0;
  ngDevMode && assertSame(
                   (previousOrParentNode as LContainerNode).native, undefined,
                   `the container's native element should not have been set yet.`);

  // We need to execute init hooks here so ngOnInit hooks are called in top level views
  // before they are called in embedded views (for backwards compatibility).
  executeInitHooks(currentView, currentView.tView, creationMode);
}

/**
 * Marks the end of the LContainerNode.
 *
 * Marking the end of LContainerNode is the time when to child Views get inserted or removed.
 */
export function containerRefreshEnd(): void {
  if (isParent) {
    isParent = false;
  } else {
    ngDevMode && assertNodeType(previousOrParentNode, LNodeFlags.View);
    ngDevMode && assertHasParent();
    previousOrParentNode = previousOrParentNode.parent !;
  }
  ngDevMode && assertNodeType(previousOrParentNode, LNodeFlags.Container);
  const container = previousOrParentNode as LContainerNode;
  container.native = undefined;
  ngDevMode && assertNodeType(container, LNodeFlags.Container);
  const nextIndex = container.data.nextIndex;
  while (nextIndex < container.data.views.length) {
    // remove extra view.
    removeView(container, nextIndex);
  }
}

function refreshDynamicChildren() {
  for (let current = currentView.child; current !== null; current = current.next) {
    if (current.dynamicViewCount !== 0 && (current as LContainer).views) {
      const container = current as LContainer;
      for (let i = 0; i < container.views.length; i++) {
        const view = container.views[i];
        renderEmbeddedTemplate(view, view.data.template !, view.data.context !, renderer);
      }
    }
  }
}

/**
 * Marks the start of an embedded view.
 *
 * @param viewBlockId The ID of this view
 * @return boolean Whether or not this view is in creation mode
 */
export function embeddedViewStart(viewBlockId: number): boolean {
  const container =
      (isParent ? previousOrParentNode : previousOrParentNode.parent !) as LContainerNode;
  ngDevMode && assertNodeType(container, LNodeFlags.Container);
  const lContainer = container.data;
  const views = lContainer.views;

  const existingView: LViewNode|false =
      !creationMode && lContainer.nextIndex < views.length && views[lContainer.nextIndex];
  let viewUpdateMode = existingView && viewBlockId === (existingView as LViewNode).data.id;

  if (viewUpdateMode) {
    previousOrParentNode = views[lContainer.nextIndex++];
    ngDevMode && assertNodeType(previousOrParentNode, LNodeFlags.View);
    isParent = true;
    enterView((existingView as LViewNode).data, previousOrParentNode as LViewNode);
  } else {
    // When we create a new LView, we always reset the state of the instructions.
    const newView = createLView(
        viewBlockId, renderer, getOrCreateEmbeddedTView(viewBlockId, container), null, null);
    if (lContainer.queries) {
      newView.queries = lContainer.queries.enterView(lContainer.nextIndex);
    }

    enterView(newView, createLNode(null, LNodeFlags.View, null, newView));
    lContainer.nextIndex++;
  }

  return !viewUpdateMode;
}

/**
 * Initialize the TView (e.g. static data) for the active embedded view.
 *
 * Each embedded view needs to set the global tData variable to the static data for
 * that view. Otherwise, the view's static data for a particular node would overwrite
 * the static data for a node in the view above it with the same index (since it's in the
 * same template).
 *
 * @param viewIndex The index of the TView in TContainer
 * @param parent The parent container in which to look for the view's static data
 * @returns TView
 */
function getOrCreateEmbeddedTView(viewIndex: number, parent: LContainerNode): TView {
  ngDevMode && assertNodeType(parent, LNodeFlags.Container);
  const tContainer = (parent !.tNode as TContainerNode).data;
  if (viewIndex >= tContainer.length || tContainer[viewIndex] == null) {
    tContainer[viewIndex] = createTView();
  }
  return tContainer[viewIndex];
}

/** Marks the end of an embedded view. */
export function embeddedViewEnd(): void {
  isParent = false;
  const viewNode = previousOrParentNode = currentView.node as LViewNode;
  const container = previousOrParentNode.parent as LContainerNode;
  if (container) {
    ngDevMode && assertNodeType(viewNode, LNodeFlags.View);
    ngDevMode && assertNodeType(container, LNodeFlags.Container);
    const containerState = container.data;
    const previousView = containerState.nextIndex <= containerState.views.length ?
        containerState.views[containerState.nextIndex - 1] as LViewNode :
        null;
    const viewIdChanged = previousView == null ? true : previousView.data.id !== viewNode.data.id;

    if (viewIdChanged) {
      insertView(container, viewNode, containerState.nextIndex - 1);
    }
  }
  leaveView(currentView !.parent !);
  ngDevMode && assertEqual(isParent, false, 'isParent');
  ngDevMode && assertNodeType(previousOrParentNode, LNodeFlags.View);
}

/////////////

/**
 * Refreshes the directive, triggering init and content hooks.
 *
 * When it is a component, it also enters the component's view and processes it to update bindings,
 * queries, etc.
 *
 * @param directiveIndex
 * @param elementIndex
 */
export function directiveRefresh<T>(directiveIndex: number, elementIndex: number): void {
  executeInitHooks(currentView, currentView.tView, creationMode);
  executeContentHooks(currentView, currentView.tView, creationMode);
  const template = (tData[directiveIndex] as ComponentDef<T>).template;
  if (template != null) {
    ngDevMode && assertDataInRange(elementIndex);
    const element = data ![elementIndex] as LElementNode;
    ngDevMode && assertNodeType(element, LNodeFlags.Element);
    ngDevMode &&
        assertNotNull(element.data, `Component's host node should have an LView attached.`);
    ngDevMode && assertDataInRange(directiveIndex);
    const directive = getDirectiveInstance<T>(data[directiveIndex]);
    const hostView = element.data !;
    const oldView = enterView(hostView, element);
    try {
      template(directive, creationMode);
    } finally {
      refreshDynamicChildren();
      leaveView(oldView);
    }
  }
}

/**
 * Instruction to distribute projectable nodes among <ng-content> occurrences in a given template.
 * It takes all the selectors from the entire component's template and decides where
 * each projected node belongs (it re-distributes nodes among "buckets" where each "bucket" is
 * backed by a selector).
 *
 * @param selectors
 */
export function projectionDef(index: number, selectors?: CssSelector[]): void {
  const noOfNodeBuckets = selectors ? selectors.length + 1 : 1;
  const distributedNodes = new Array<LNode[]>(noOfNodeBuckets);
  for (let i = 0; i < noOfNodeBuckets; i++) {
    distributedNodes[i] = [];
  }

  const componentNode = findComponentHost(currentView);
  let componentChild = componentNode.child;

  while (componentChild !== null) {
    // execute selector matching logic if and only if:
    // - there are selectors defined
    // - a node has a tag name / attributes that can be matched
    if (selectors && componentChild.tNode) {
      const matchedIdx = matchingSelectorIndex(componentChild.tNode, selectors !);
      distributedNodes[matchedIdx].push(componentChild);
    } else {
      distributedNodes[0].push(componentChild);
    }

    componentChild = componentChild.next;
  }

  ngDevMode && assertDataNext(index);
  data[index] = distributedNodes;
}

/**
 * Updates the linked list of a projection node, by appending another linked list.
 *
 * @param projectionNode Projection node whose projected nodes linked list has to be updated
 * @param appendedFirst First node of the linked list to append.
 * @param appendedLast Last node of the linked list to append.
 */
function appendToProjectionNode(
    projectionNode: LProjectionNode,
    appendedFirst: LElementNode | LTextNode | LContainerNode | null,
    appendedLast: LElementNode | LTextNode | LContainerNode | null) {
  ngDevMode && assertEqual(
                   !!appendedFirst, !!appendedLast,
                   'appendedFirst can be null if and only if appendedLast is also null');
  if (!appendedLast) {
    // nothing to append
    return;
  }
  const projectionNodeData = projectionNode.data;
  if (projectionNodeData.tail) {
    projectionNodeData.tail.pNextOrParent = appendedFirst;
  } else {
    projectionNodeData.head = appendedFirst;
  }
  projectionNodeData.tail = appendedLast;
  appendedLast.pNextOrParent = projectionNode;
}

/**
 * Inserts previously re-distributed projected nodes. This instruction must be preceded by a call
 * to the projectionDef instruction.
 *
 * @param nodeIndex
 * @param localIndex - index under which distribution of projected nodes was memorized
 * @param selectorIndex - 0 means <ng-content> without any selector
 * @param attrs - attributes attached to the ng-content node, if present
 */
export function projection(
    nodeIndex: number, localIndex: number, selectorIndex: number = 0, attrs?: string[]): void {
  const node = createLNode(nodeIndex, LNodeFlags.Projection, null, {head: null, tail: null});

  if (node.tNode == null) {
    node.tNode = createTNode(null, attrs || null, null, null);
  }

  isParent = false;  // self closing
  const currentParent = node.parent;

  // re-distribution of projectable nodes is memorized on a component's view level
  const componentNode = findComponentHost(currentView);

  // make sure that nodes to project were memorized
  const nodesForSelector = componentNode.data !.data ![localIndex][selectorIndex];

  // build the linked list of projected nodes:
  for (let i = 0; i < nodesForSelector.length; i++) {
    const nodeToProject = nodesForSelector[i];
    if ((nodeToProject.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Projection) {
      const previouslyProjected = (nodeToProject as LProjectionNode).data;
      appendToProjectionNode(node, previouslyProjected.head, previouslyProjected.tail);
    } else {
      appendToProjectionNode(
          node, nodeToProject as LTextNode | LElementNode | LContainerNode,
          nodeToProject as LTextNode | LElementNode | LContainerNode);
    }
  }

  if (canInsertNativeNode(currentParent, currentView)) {
    // process each node in the list of projected nodes:
    let nodeToProject: LNode|null = node.data.head;
    const lastNodeToProject = node.data.tail;
    while (nodeToProject) {
      appendProjectedNode(
          nodeToProject as LTextNode | LElementNode | LContainerNode, currentParent, currentView);
      nodeToProject = nodeToProject === lastNodeToProject ? null : nodeToProject.pNextOrParent;
    }
  }
}

/**
 * Given a current view, finds the nearest component's host (LElement).
 *
 * @param lView LView for which we want a host element node
 * @returns The host node
 */
function findComponentHost(lView: LView): LElementNode {
  let viewRootLNode = lView.node;
  while ((viewRootLNode.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.View) {
    ngDevMode && assertNotNull(lView.parent, 'lView.parent');
    lView = lView.parent !;
    viewRootLNode = lView.node;
  }

  ngDevMode && assertNodeType(viewRootLNode, LNodeFlags.Element);
  ngDevMode && assertNotNull(viewRootLNode.data, 'node.data');

  return viewRootLNode as LElementNode;
}

/**
 * Adds a LView or a LContainer to the end of the current view tree.
 *
 * This structure will be used to traverse through nested views to remove listeners
 * and call onDestroy callbacks.
 *
 * @param state The LView or LContainer to add to the view tree
 * @returns The state passed in
 */
export function addToViewTree<T extends LView|LContainer>(state: T): T {
  currentView.tail ? (currentView.tail.next = state) : (currentView.child = state);
  currentView.tail = state;
  return state;
}

///////////////////////////////
//// Bindings & interpolations
///////////////////////////////

export interface NO_CHANGE {
  // This is a brand that ensures that this type can never match anything else
  brand: 'NO_CHANGE';
}

/** A special value which designates that a value has not changed. */
export const NO_CHANGE = {} as NO_CHANGE;

/**
 *  Initializes the binding start index. Will get inlined.
 *
 *  This function must be called before any binding related function is called
 *  (ie `bind()`, `interpolationX()`, `pureFunctionX()`)
 */
function initBindings() {
  // `bindingIndex` is initialized when the view is first entered when not in creation mode
  ngDevMode &&
      assertEqual(
          creationMode, true, 'should only be called in creationMode for performance reasons');
  if (currentView.bindingStartIndex == null) {
    bindingIndex = currentView.bindingStartIndex = data.length;
  }
}

/**
 * Creates a single value binding.
 *
 * @param value Value to diff
 */
export function bind<T>(value: T | NO_CHANGE): T|NO_CHANGE {
  if (creationMode) {
    initBindings();
    return data[bindingIndex++] = value;
  }

  const changed: boolean = value !== NO_CHANGE && isDifferent(data[bindingIndex], value);
  if (changed) {
    data[bindingIndex] = value;
  }
  bindingIndex++;
  return changed ? value : NO_CHANGE;
}

/**
 * Create interpolation bindings with a variable number of expressions.
 *
 * If there are 1 to 8 expressions `interpolation1()` to `interpolation8()` should be used instead.
 * Those are faster because there is no need to create an array of expressions and iterate over it.
 *
 * `values`:
 * - has static text at even indexes,
 * - has evaluated expressions at odd indexes.
 *
 * Returns the concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function interpolationV(values: any[]): string|NO_CHANGE {
  ngDevMode && assertLessThan(2, values.length, 'should have at least 3 values');
  ngDevMode && assertEqual(values.length % 2, 1, 'should have an odd number of values');

  let different = false;

  for (let i = 1; i < values.length; i += 2) {
    // Check if bindings (odd indexes) have changed
    bindingUpdated(values[i]) && (different = true);
  }

  if (!different) {
    return NO_CHANGE;
  }

  // Build the updated content
  let content = values[0];
  for (let i = 1; i < values.length; i += 2) {
    content += stringify(values[i]) + values[i + 1];
  }

  return content;
}

/**
 * Creates an interpolation binding with 1 expression.
 *
 * @param prefix static value used for concatenation only.
 * @param v0 value checked for change.
 * @param suffix static value used for concatenation only.
 */
export function interpolation1(prefix: string, v0: any, suffix: string): string|NO_CHANGE {
  const different = bindingUpdated(v0);

  return different ? prefix + stringify(v0) + suffix : NO_CHANGE;
}

/** Creates an interpolation binding with 2 expressions. */
export function interpolation2(
    prefix: string, v0: any, i0: string, v1: any, suffix: string): string|NO_CHANGE {
  const different = bindingUpdated2(v0, v1);

  return different ? prefix + stringify(v0) + i0 + stringify(v1) + suffix : NO_CHANGE;
}

/** Creates an interpolation bindings with 3 expressions. */
export function interpolation3(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): string|
    NO_CHANGE {
  let different = bindingUpdated2(v0, v1);
  different = bindingUpdated(v2) || different;

  return different ? prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + suffix :
                     NO_CHANGE;
}

/** Create an interpolation binding with 4 expressions. */
export function interpolation4(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    suffix: string): string|NO_CHANGE {
  const different = bindingUpdated4(v0, v1, v2, v3);

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) +
          suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 5 expressions. */
export function interpolation5(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, suffix: string): string|NO_CHANGE {
  let different = bindingUpdated4(v0, v1, v2, v3);
  different = bindingUpdated(v4) || different;

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) + i3 +
          stringify(v4) + suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 6 expressions. */
export function interpolation6(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, suffix: string): string|NO_CHANGE {
  let different = bindingUpdated4(v0, v1, v2, v3);
  different = bindingUpdated2(v4, v5) || different;

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) + i3 +
          stringify(v4) + i4 + stringify(v5) + suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 7 expressions. */
export function interpolation7(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): string|
    NO_CHANGE {
  let different = bindingUpdated4(v0, v1, v2, v3);
  different = bindingUpdated2(v4, v5) || different;
  different = bindingUpdated(v6) || different;

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) + i3 +
          stringify(v4) + i4 + stringify(v5) + i5 + stringify(v6) + suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 8 expressions. */
export function interpolation8(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any,
    suffix: string): string|NO_CHANGE {
  let different = bindingUpdated4(v0, v1, v2, v3);
  different = bindingUpdated4(v4, v5, v6, v7) || different;

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) + i3 +
          stringify(v4) + i4 + stringify(v5) + i5 + stringify(v6) + i6 + stringify(v7) + suffix :
      NO_CHANGE;
}

/** Store a value in the `data` at a given `index`. */
export function store<T>(index: number, value: T): void {
  // We don't store any static data for local variables, so the first time
  // we see the template, we should store as null to avoid a sparse array
  if (index >= tData.length) {
    tData[index] = null;
  }
  data[index] = value;
}

/** Retrieves a value from the `data`. */
export function load<T>(index: number): T {
  ngDevMode && assertDataInRange(index, data);
  return data[index];
}

/** Gets the current binding value and increments the binding index. */
export function consumeBinding(): any {
  ngDevMode && assertDataInRange(bindingIndex);
  ngDevMode &&
      assertNotEqual(data[bindingIndex], NO_CHANGE, 'Stored value should never be NO_CHANGE.');
  return data[bindingIndex++];
}

/** Updates binding if changed, then returns whether it was updated. */
export function bindingUpdated(value: any): boolean {
  ngDevMode && assertNotEqual(value, NO_CHANGE, 'Incoming value should never be NO_CHANGE.');

  if (creationMode || isDifferent(data[bindingIndex], value)) {
    creationMode && initBindings();
    data[bindingIndex++] = value;
    return true;
  } else {
    bindingIndex++;
    return false;
  }
}

/** Updates binding if changed, then returns the latest value. */
export function checkAndUpdateBinding(value: any): any {
  bindingUpdated(value);
  return value;
}

/** Updates 2 bindings if changed, then returns whether either was updated. */
export function bindingUpdated2(exp1: any, exp2: any): boolean {
  const different = bindingUpdated(exp1);
  return bindingUpdated(exp2) || different;
}

/** Updates 4 bindings if changed, then returns whether any was updated. */
export function bindingUpdated4(exp1: any, exp2: any, exp3: any, exp4: any): boolean {
  const different = bindingUpdated2(exp1, exp2);
  return bindingUpdated2(exp3, exp4) || different;
}

export function getDirectiveInstance<T>(instanceOrArray: T | [T]): T {
  // Directives with content queries store an array in data[directiveIndex]
  // with the instance as the first index
  return Array.isArray(instanceOrArray) ? instanceOrArray[0] : instanceOrArray;
}

export function assertPreviousIsParent() {
  assertEqual(isParent, true, 'previousOrParentNode should be a parent');
}

function assertHasParent() {
  assertNotNull(previousOrParentNode.parent, 'previousOrParentNode should have a parent');
}

function assertDataInRange(index: number, arr?: any[]) {
  if (arr == null) arr = data;
  assertLessThan(index, arr ? arr.length : 0, 'index expected to be a valid data index');
}

function assertDataNext(index: number) {
  assertEqual(data.length, index, 'index expected to be at the end of data');
}
