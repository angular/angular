/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../di/injector';
import {assertTNodeForLView} from '../render3/assert';
import {getLContext} from '../render3/context_discovery';
import {CONTAINER_HEADER_OFFSET, LContainer, NATIVE} from '../render3/interfaces/container';
import {TElementNode, TNode, TNodeFlags, TNodeType} from '../render3/interfaces/node';
import {isComponentHost, isLContainer} from '../render3/interfaces/type_checks';
import {
  DECLARATION_COMPONENT_VIEW,
  LView,
  PARENT,
  T_HOST,
  TData,
  TVIEW,
} from '../render3/interfaces/view';
import {
  getComponent,
  getContext,
  getInjectionTokens,
  getInjector,
  getListeners,
  getLocalRefs,
  getOwningComponent,
} from '../render3/util/discovery_utils';
import {INTERPOLATION_DELIMITER} from '../render3/util/misc_utils';
import {renderStringify} from '../render3/util/stringify_utils';
import {getComponentLViewByIndex, getNativeByTNodeOrNull} from '../render3/util/view_utils';
import {assertDomNode} from '../util/assert';

/**
 * @publicApi
 */
export class DebugEventListener {
  constructor(
    public name: string,
    public callback: Function,
  ) {}
}

/**
 * @publicApi
 */
export function asNativeElements(debugEls: DebugElement[]): any {
  return debugEls.map((el) => el.nativeElement);
}

/**
 * @publicApi
 */
export class DebugNode {
  /**
   * The underlying DOM node.
   */
  readonly nativeNode: any;

  constructor(nativeNode: Node) {
    this.nativeNode = nativeNode;
  }

  /**
   * The `DebugElement` parent. Will be `null` if this is the root element.
   */
  get parent(): DebugElement | null {
    const parent = this.nativeNode.parentNode as Element;
    return parent ? new DebugElement(parent) : null;
  }

  /**
   * The host dependency injector. For example, the root element's component instance injector.
   */
  get injector(): Injector {
    return getInjector(this.nativeNode);
  }

  /**
   * The element's own component instance, if it has one.
   */
  get componentInstance(): any {
    const nativeElement = this.nativeNode;
    return (
      nativeElement && (getComponent(nativeElement as Element) || getOwningComponent(nativeElement))
    );
  }

  /**
   * An object that provides parent context for this element. Often an ancestor component instance
   * that governs this element.
   *
   * When an element is repeated within *ngFor, the context is an `NgForOf` whose `$implicit`
   * property is the value of the row instance value. For example, the `hero` in `*ngFor="let hero
   * of heroes"`.
   */
  get context(): any {
    return getComponent(this.nativeNode as Element) || getContext(this.nativeNode as Element);
  }

  /**
   * The callbacks attached to the component's @Output properties and/or the element's event
   * properties.
   */
  get listeners(): DebugEventListener[] {
    return getListeners(this.nativeNode as Element).filter((listener) => listener.type === 'dom');
  }

  /**
   * Dictionary of objects associated with template local variables (e.g. #foo), keyed by the local
   * variable name.
   */
  get references(): {[key: string]: any} {
    return getLocalRefs(this.nativeNode);
  }

  /**
   * This component's injector lookup tokens. Includes the component itself plus the tokens that the
   * component lists in its providers metadata.
   */
  get providerTokens(): any[] {
    return getInjectionTokens(this.nativeNode as Element);
  }
}

/**
 * @publicApi
 *
 * @see [Component testing scenarios](guide/testing/components-scenarios)
 * @see [Basics of testing components](guide/testing/components-basics)
 * @see [Testing utility APIs](guide/testing/utility-apis)
 */
export class DebugElement extends DebugNode {
  constructor(nativeNode: Element) {
    ngDevMode && assertDomNode(nativeNode);
    super(nativeNode);
  }

  /**
   * The underlying DOM element at the root of the component.
   */
  get nativeElement(): any {
    return this.nativeNode.nodeType == Node.ELEMENT_NODE ? (this.nativeNode as Element) : null;
  }

  /**
   * The element tag name, if it is an element.
   */
  get name(): string {
    const context = getLContext(this.nativeNode)!;
    const lView = context ? context.lView : null;

    if (lView !== null) {
      const tData = lView[TVIEW].data;
      const tNode = tData[context.nodeIndex] as TNode;
      return tNode.value!;
    } else {
      return this.nativeNode.nodeName;
    }
  }

  /**
   *  Gets a map of property names to property values for an element.
   *
   *  This map includes:
   *  - Regular property bindings (e.g. `[id]="id"`)
   *  - Host property bindings (e.g. `host: { '[id]': "id" }`)
   *  - Interpolated property bindings (e.g. `id="{{ value }}")
   *
   *  It does not include:
   *  - input property bindings (e.g. `[myCustomInput]="value"`)
   *  - attribute bindings (e.g. `[attr.role]="menu"`)
   */
  get properties(): {[key: string]: any} {
    const context = getLContext(this.nativeNode)!;
    const lView = context ? context.lView : null;

    if (lView === null) {
      return {};
    }

    const tData = lView[TVIEW].data;
    const tNode = tData[context.nodeIndex] as TNode;

    const properties: {[key: string]: string} = {};
    // Collect properties from the DOM.
    copyDomProperties(this.nativeElement, properties);
    // Collect properties from the bindings. This is needed for animation renderer which has
    // synthetic properties which don't get reflected into the DOM.
    collectPropertyBindings(properties, tNode, lView, tData);
    return properties;
  }

  /**
   *  A map of attribute names to attribute values for an element.
   */
  // TODO: replace null by undefined in the return type
  get attributes(): {[key: string]: string | null} {
    const attributes: {[key: string]: string | null} = {};
    const element = this.nativeElement as Element | undefined;

    if (!element) {
      return attributes;
    }

    const context = getLContext(element)!;
    const lView = context ? context.lView : null;

    if (lView === null) {
      return {};
    }

    const tNodeAttrs = (lView[TVIEW].data[context.nodeIndex] as TNode).attrs;
    const lowercaseTNodeAttrs: string[] = [];

    // For debug nodes we take the element's attribute directly from the DOM since it allows us
    // to account for ones that weren't set via bindings (e.g. ViewEngine keeps track of the ones
    // that are set through `Renderer2`). The problem is that the browser will lowercase all names,
    // however since we have the attributes already on the TNode, we can preserve the case by going
    // through them once, adding them to the `attributes` map and putting their lower-cased name
    // into an array. Afterwards when we're going through the native DOM attributes, we can check
    // whether we haven't run into an attribute already through the TNode.
    if (tNodeAttrs) {
      let i = 0;
      while (i < tNodeAttrs.length) {
        const attrName = tNodeAttrs[i];

        // Stop as soon as we hit a marker. We only care about the regular attributes. Everything
        // else will be handled below when we read the final attributes off the DOM.
        if (typeof attrName !== 'string') break;

        const attrValue = tNodeAttrs[i + 1];
        attributes[attrName] = attrValue as string;
        lowercaseTNodeAttrs.push(attrName.toLowerCase());

        i += 2;
      }
    }

    for (const attr of element.attributes) {
      // Make sure that we don't assign the same attribute both in its
      // case-sensitive form and the lower-cased one from the browser.
      if (!lowercaseTNodeAttrs.includes(attr.name)) {
        attributes[attr.name] = attr.value;
      }
    }

    return attributes;
  }

  /**
   * The inline styles of the DOM element.
   */
  // TODO: replace null by undefined in the return type
  get styles(): {[key: string]: string | null} {
    const element = this.nativeElement as HTMLElement | null;
    return (element?.style ?? {}) as {[key: string]: string | null};
  }

  /**
   * A map containing the class names on the element as keys.
   *
   * This map is derived from the `className` property of the DOM element.
   *
   * Note: The values of this object will always be `true`. The class key will not appear in the KV
   * object if it does not exist on the element.
   *
   * @see [Element.className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className)
   */
  get classes(): {[key: string]: boolean} {
    const result: {[key: string]: boolean} = {};
    const element = this.nativeElement as HTMLElement | SVGElement;

    // SVG elements return an `SVGAnimatedString` instead of a plain string for the `className`.
    const className = element.className as string | SVGAnimatedString;
    const classes =
      typeof className !== 'string' ? className.baseVal.split(' ') : className.split(' ');

    classes.forEach((value: string) => (result[value] = true));

    return result;
  }

  /**
   * The `childNodes` of the DOM element as a `DebugNode` array.
   *
   * @see [Node.childNodes](https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes)
   */
  get childNodes(): DebugNode[] {
    const childNodes = this.nativeNode.childNodes;
    const children: DebugNode[] = [];
    for (let i = 0; i < childNodes.length; i++) {
      const element = childNodes[i];
      children.push(getDebugNode(element)!);
    }
    return children;
  }

  /**
   * The immediate `DebugElement` children. Walk the tree by descending through `children`.
   */
  get children(): DebugElement[] {
    const nativeElement = this.nativeElement;
    if (!nativeElement) return [];
    const childNodes = nativeElement.children;
    const children: DebugElement[] = [];
    for (let i = 0; i < childNodes.length; i++) {
      const element = childNodes[i];
      children.push(getDebugNode(element) as DebugElement);
    }
    return children;
  }

  /**
   * @returns the first `DebugElement` that matches the predicate at any depth in the subtree.
   */
  query(predicate: Predicate<DebugElement>): DebugElement {
    const results = this.queryAll(predicate);
    return results[0] || null;
  }

  /**
   * @returns All `DebugElement` matches for the predicate at any depth in the subtree.
   */
  queryAll(predicate: Predicate<DebugElement>): DebugElement[] {
    const matches: DebugElement[] = [];
    _queryAll(this, predicate, matches, true);
    return matches;
  }

  /**
   * @returns All `DebugNode` matches for the predicate at any depth in the subtree.
   */
  queryAllNodes(predicate: Predicate<DebugNode>): DebugNode[] {
    const matches: DebugNode[] = [];
    _queryAll(this, predicate, matches, false);
    return matches;
  }

  /**
   * Triggers the event by its name if there is a corresponding listener in the element's
   * `listeners` collection.
   *
   * If the event lacks a listener or there's some other problem, consider
   * calling `nativeElement.dispatchEvent(eventObject)`.
   *
   * @param eventName The name of the event to trigger
   * @param eventObj The _event object_ expected by the handler
   *
   * @see [Testing components scenarios](guide/testing/components-scenarios#trigger-event-handler)
   */
  triggerEventHandler(eventName: string, eventObj?: any): void {
    const node = this.nativeNode as any;
    const invokedListeners: Function[] = [];

    this.listeners.forEach((listener) => {
      if (listener.name === eventName) {
        const callback = listener.callback;
        callback.call(node, eventObj);
        invokedListeners.push(callback);
      }
    });

    // We need to check whether `eventListeners` exists, because it's something
    // that Zone.js only adds to `EventTarget` in browser environments.
    if (typeof node.eventListeners === 'function') {
      // Note that in Ivy we wrap event listeners with a call to `event.preventDefault` in some
      // cases. We use '__ngUnwrap__' as a special token that gives us access to the actual event
      // listener.
      node.eventListeners(eventName).forEach((listener: Function) => {
        // In order to ensure that we can detect the special __ngUnwrap__ token described above, we
        // use `toString` on the listener and see if it contains the token. We use this approach to
        // ensure that it still worked with compiled code since it cannot remove or rename string
        // literals. We also considered using a special function name (i.e. if(listener.name ===
        // special)) but that was more cumbersome and we were also concerned the compiled code could
        // strip the name, turning the condition in to ("" === "") and always returning true.
        if (listener.toString().indexOf('__ngUnwrap__') !== -1) {
          const unwrappedListener = listener('__ngUnwrap__');
          return (
            invokedListeners.indexOf(unwrappedListener) === -1 &&
            unwrappedListener.call(node, eventObj)
          );
        }
      });
    }
  }
}

function copyDomProperties(element: Element | null, properties: {[name: string]: string}): void {
  if (element) {
    // Skip own properties (as those are patched)
    let obj = Object.getPrototypeOf(element);
    const NodePrototype: any = Node.prototype;
    while (obj !== null && obj !== NodePrototype) {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      for (let key in descriptors) {
        if (!key.startsWith('__') && !key.startsWith('on')) {
          // don't include properties starting with `__` and `on`.
          // `__` are patched values which should not be included.
          // `on` are listeners which also should not be included.
          const value = (element as any)[key];
          if (isPrimitiveValue(value)) {
            properties[key] = value;
          }
        }
      }
      obj = Object.getPrototypeOf(obj);
    }
  }
}

function isPrimitiveValue(value: any): boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    value === null
  );
}

/**
 * Walk the TNode tree to find matches for the predicate.
 *
 * @param parentElement the element from which the walk is started
 * @param predicate the predicate to match
 * @param matches the list of positive matches
 * @param elementsOnly whether only elements should be searched
 */
function _queryAll(
  parentElement: DebugElement,
  predicate: Predicate<DebugElement>,
  matches: DebugElement[],
  elementsOnly: true,
): void;
function _queryAll(
  parentElement: DebugElement,
  predicate: Predicate<DebugNode>,
  matches: DebugNode[],
  elementsOnly: false,
): void;
function _queryAll(
  parentElement: DebugElement,
  predicate: Predicate<DebugElement> | Predicate<DebugNode>,
  matches: DebugElement[] | DebugNode[],
  elementsOnly: boolean,
) {
  const context = getLContext(parentElement.nativeNode)!;
  const lView = context ? context.lView : null;
  if (lView !== null) {
    const parentTNode = lView[TVIEW].data[context.nodeIndex] as TNode;
    _queryNodeChildren(
      parentTNode,
      lView,
      predicate,
      matches,
      elementsOnly,
      parentElement.nativeNode,
    );
  } else {
    // If the context is null, then `parentElement` was either created with Renderer2 or native DOM
    // APIs.
    _queryNativeNodeDescendants(parentElement.nativeNode, predicate, matches, elementsOnly);
  }
}

/**
 * Recursively match the current TNode against the predicate, and goes on with the next ones.
 *
 * @param tNode the current TNode
 * @param lView the LView of this TNode
 * @param predicate the predicate to match
 * @param matches the list of positive matches
 * @param elementsOnly whether only elements should be searched
 * @param rootNativeNode the root native node on which predicate should not be matched
 */
function _queryNodeChildren(
  tNode: TNode,
  lView: LView,
  predicate: Predicate<DebugElement> | Predicate<DebugNode>,
  matches: DebugElement[] | DebugNode[],
  elementsOnly: boolean,
  rootNativeNode: any,
) {
  ngDevMode && assertTNodeForLView(tNode, lView);
  const nativeNode = getNativeByTNodeOrNull(tNode, lView);
  // For each type of TNode, specific logic is executed.
  if (tNode.type & (TNodeType.AnyRNode | TNodeType.ElementContainer)) {
    // Case 1: the TNode is an element
    // The native node has to be checked.
    _addQueryMatch(nativeNode, predicate, matches, elementsOnly, rootNativeNode);
    if (isComponentHost(tNode)) {
      // If the element is the host of a component, then all nodes in its view have to be processed.
      // Note: the component's content (tNode.child) will be processed from the insertion points.
      const componentView = getComponentLViewByIndex(tNode.index, lView);
      if (componentView && componentView[TVIEW].firstChild) {
        _queryNodeChildren(
          componentView[TVIEW].firstChild!,
          componentView,
          predicate,
          matches,
          elementsOnly,
          rootNativeNode,
        );
      }
    } else {
      if (tNode.child) {
        // Otherwise, its children have to be processed.
        _queryNodeChildren(tNode.child, lView, predicate, matches, elementsOnly, rootNativeNode);
      }

      // We also have to query the DOM directly in order to catch elements inserted through
      // Renderer2. Note that this is __not__ optimal, because we're walking similar trees multiple
      // times. ViewEngine could do it more efficiently, because all the insertions go through
      // Renderer2, however that's not the case in Ivy. This approach is being used because:
      // 1. Matching the ViewEngine behavior would mean potentially introducing a dependency
      //    from `Renderer2` to Ivy which could bring Ivy code into ViewEngine.
      // 2. It allows us to capture nodes that were inserted directly via the DOM.
      nativeNode && _queryNativeNodeDescendants(nativeNode, predicate, matches, elementsOnly);
    }
    // In all cases, if a dynamic container exists for this node, each view inside it has to be
    // processed.
    const nodeOrContainer = lView[tNode.index];
    if (isLContainer(nodeOrContainer)) {
      _queryNodeChildrenInContainer(
        nodeOrContainer,
        predicate,
        matches,
        elementsOnly,
        rootNativeNode,
      );
    }
  } else if (tNode.type & TNodeType.Container) {
    // Case 2: the TNode is a container
    // The native node has to be checked.
    const lContainer = lView[tNode.index];
    _addQueryMatch(lContainer[NATIVE], predicate, matches, elementsOnly, rootNativeNode);
    // Each view inside the container has to be processed.
    _queryNodeChildrenInContainer(lContainer, predicate, matches, elementsOnly, rootNativeNode);
  } else if (tNode.type & TNodeType.Projection) {
    // Case 3: the TNode is a projection insertion point (i.e. a <ng-content>).
    // The nodes projected at this location all need to be processed.
    const componentView = lView![DECLARATION_COMPONENT_VIEW];
    const componentHost = componentView[T_HOST] as TElementNode;
    const head: TNode | null = (componentHost.projection as (TNode | null)[])[
      tNode.projection as number
    ];

    if (Array.isArray(head)) {
      for (let nativeNode of head) {
        _addQueryMatch(nativeNode, predicate, matches, elementsOnly, rootNativeNode);
      }
    } else if (head) {
      const nextLView = componentView[PARENT]! as LView;
      const nextTNode = nextLView[TVIEW].data[head.index] as TNode;
      _queryNodeChildren(nextTNode, nextLView, predicate, matches, elementsOnly, rootNativeNode);
    }
  } else if (tNode.child) {
    // Case 4: the TNode is a view.
    _queryNodeChildren(tNode.child, lView, predicate, matches, elementsOnly, rootNativeNode);
  }

  // We don't want to go to the next sibling of the root node.
  if (rootNativeNode !== nativeNode) {
    // To determine the next node to be processed, we need to use the next or the projectionNext
    // link, depending on whether the current node has been projected.
    const nextTNode = tNode.flags & TNodeFlags.isProjected ? tNode.projectionNext : tNode.next;
    if (nextTNode) {
      _queryNodeChildren(nextTNode, lView, predicate, matches, elementsOnly, rootNativeNode);
    }
  }
}

/**
 * Process all TNodes in a given container.
 *
 * @param lContainer the container to be processed
 * @param predicate the predicate to match
 * @param matches the list of positive matches
 * @param elementsOnly whether only elements should be searched
 * @param rootNativeNode the root native node on which predicate should not be matched
 */
function _queryNodeChildrenInContainer(
  lContainer: LContainer,
  predicate: Predicate<DebugElement> | Predicate<DebugNode>,
  matches: DebugElement[] | DebugNode[],
  elementsOnly: boolean,
  rootNativeNode: any,
) {
  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    const childView = lContainer[i] as LView;
    const firstChild = childView[TVIEW].firstChild;
    if (firstChild) {
      _queryNodeChildren(firstChild, childView, predicate, matches, elementsOnly, rootNativeNode);
    }
  }
}

/**
 * Match the current native node against the predicate.
 *
 * @param nativeNode the current native node
 * @param predicate the predicate to match
 * @param matches the list of positive matches
 * @param elementsOnly whether only elements should be searched
 * @param rootNativeNode the root native node on which predicate should not be matched
 */
function _addQueryMatch(
  nativeNode: any,
  predicate: Predicate<DebugElement> | Predicate<DebugNode>,
  matches: DebugElement[] | DebugNode[],
  elementsOnly: boolean,
  rootNativeNode: any,
) {
  if (rootNativeNode !== nativeNode) {
    const debugNode = getDebugNode(nativeNode);
    if (!debugNode) {
      return;
    }
    // Type of the "predicate and "matches" array are set based on the value of
    // the "elementsOnly" parameter. TypeScript is not able to properly infer these
    // types with generics, so we manually cast the parameters accordingly.
    if (
      elementsOnly &&
      debugNode instanceof DebugElement &&
      predicate(debugNode) &&
      matches.indexOf(debugNode) === -1
    ) {
      matches.push(debugNode);
    } else if (
      !elementsOnly &&
      (predicate as Predicate<DebugNode>)(debugNode) &&
      (matches as DebugNode[]).indexOf(debugNode) === -1
    ) {
      (matches as DebugNode[]).push(debugNode);
    }
  }
}

/**
 * Match all the descendants of a DOM node against a predicate.
 *
 * @param nativeNode the current native node
 * @param predicate the predicate to match
 * @param matches the list where matches are stored
 * @param elementsOnly whether only elements should be searched
 */
function _queryNativeNodeDescendants(
  parentNode: any,
  predicate: Predicate<DebugElement> | Predicate<DebugNode>,
  matches: DebugElement[] | DebugNode[],
  elementsOnly: boolean,
) {
  const nodes = parentNode.childNodes;
  const length = nodes.length;

  for (let i = 0; i < length; i++) {
    const node = nodes[i];
    const debugNode = getDebugNode(node);

    if (debugNode) {
      if (
        elementsOnly &&
        debugNode instanceof DebugElement &&
        predicate(debugNode) &&
        matches.indexOf(debugNode) === -1
      ) {
        matches.push(debugNode);
      } else if (
        !elementsOnly &&
        (predicate as Predicate<DebugNode>)(debugNode) &&
        (matches as DebugNode[]).indexOf(debugNode) === -1
      ) {
        (matches as DebugNode[]).push(debugNode);
      }

      _queryNativeNodeDescendants(node, predicate, matches, elementsOnly);
    }
  }
}

/**
 * Iterates through the property bindings for a given node and generates
 * a map of property names to values. This map only contains property bindings
 * defined in templates, not in host bindings.
 */
function collectPropertyBindings(
  properties: {[key: string]: string},
  tNode: TNode,
  lView: LView,
  tData: TData,
): void {
  let bindingIndexes = tNode.propertyBindings;

  if (bindingIndexes !== null) {
    for (let i = 0; i < bindingIndexes.length; i++) {
      const bindingIndex = bindingIndexes[i];
      const propMetadata = tData[bindingIndex] as string;
      const metadataParts = propMetadata.split(INTERPOLATION_DELIMITER);
      const propertyName = metadataParts[0];
      if (metadataParts.length > 1) {
        let value = metadataParts[1];
        for (let j = 1; j < metadataParts.length - 1; j++) {
          value += renderStringify(lView[bindingIndex + j - 1]) + metadataParts[j + 1];
        }
        properties[propertyName] = value;
      } else {
        properties[propertyName] = lView[bindingIndex];
      }
    }
  }
}

// Need to keep the nodes in a global Map so that multiple angular apps are supported.
const _nativeNodeToDebugNode = new Map<any, DebugNode>();

const NG_DEBUG_PROPERTY = '__ng_debug__';

/**
 * @publicApi
 */
export function getDebugNode(nativeNode: any): DebugNode | null {
  if (nativeNode instanceof Node) {
    if (!nativeNode.hasOwnProperty(NG_DEBUG_PROPERTY)) {
      (nativeNode as any)[NG_DEBUG_PROPERTY] =
        nativeNode.nodeType == Node.ELEMENT_NODE
          ? new DebugElement(nativeNode as Element)
          : new DebugNode(nativeNode);
    }
    return (nativeNode as any)[NG_DEBUG_PROPERTY];
  }
  return null;
}

export function getAllDebugNodes(): DebugNode[] {
  return Array.from(_nativeNodeToDebugNode.values());
}

export function indexDebugNode(node: DebugNode) {
  _nativeNodeToDebugNode.set(node.nativeNode, node);
}

export function removeDebugNodeFromIndex(node: DebugNode) {
  _nativeNodeToDebugNode.delete(node.nativeNode);
}

/**
 * A boolean-valued function over a value, possibly including context information
 * regarding that value's position in an array.
 *
 * @publicApi
 */
export type Predicate<T> = (value: T) => boolean;
