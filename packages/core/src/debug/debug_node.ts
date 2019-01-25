/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di';
import {getComponent, getContext, getInjectionTokens, getInjector, getListeners, getLocalRefs, isBrowserEvents, loadLContext, loadLContextFromNode} from '../render3/discovery_utils';
import {TNode} from '../render3/interfaces/node';
import {StylingIndex} from '../render3/interfaces/styling';
import {LView, TData, TVIEW} from '../render3/interfaces/view';
import {getProp, getValue, isClassBasedValue} from '../render3/styling/class_and_style_bindings';
import {getStylingContext} from '../render3/styling/util';
import {INTERPOLATION_DELIMITER, isPropMetadataString, renderStringify} from '../render3/util';
import {assertDomNode} from '../util/assert';
import {DebugContext} from '../view/index';

export class EventListener {
  constructor(public name: string, public callback: Function) {}
}

/**
 * @publicApi
 */
export interface DebugNode {
  readonly listeners: EventListener[];
  readonly parent: DebugElement|null;
  readonly nativeNode: any;
  readonly injector: Injector;
  readonly componentInstance: any;
  readonly context: any;
  readonly references: {[key: string]: any};
  readonly providerTokens: any[];
}
export class DebugNode__PRE_R3__ {
  readonly listeners: EventListener[] = [];
  readonly parent: DebugElement|null = null;
  readonly nativeNode: any;
  private readonly _debugContext: DebugContext;

  constructor(nativeNode: any, parent: DebugNode|null, _debugContext: DebugContext) {
    this._debugContext = _debugContext;
    this.nativeNode = nativeNode;
    if (parent && parent instanceof DebugElement__PRE_R3__) {
      parent.addChild(this);
    }
  }

  get injector(): Injector { return this._debugContext.injector; }

  get componentInstance(): any { return this._debugContext.component; }

  get context(): any { return this._debugContext.context; }

  get references(): {[key: string]: any} { return this._debugContext.references; }

  get providerTokens(): any[] { return this._debugContext.providerTokens; }
}

/**
 * @publicApi
 */
export interface DebugElement extends DebugNode {
  readonly name: string;
  readonly properties: {[key: string]: any};
  readonly attributes: {[key: string]: string | null};
  readonly classes: {[key: string]: boolean};
  readonly styles: {[key: string]: string | null};
  readonly childNodes: DebugNode[];
  readonly nativeElement: any;
  readonly children: DebugElement[];

  query(predicate: Predicate<DebugElement>): DebugElement;
  queryAll(predicate: Predicate<DebugElement>): DebugElement[];
  queryAllNodes(predicate: Predicate<DebugNode>): DebugNode[];
  triggerEventHandler(eventName: string, eventObj: any): void;
}
export class DebugElement__PRE_R3__ extends DebugNode__PRE_R3__ implements DebugElement {
  readonly name !: string;
  readonly properties: {[key: string]: any} = {};
  readonly attributes: {[key: string]: string | null} = {};
  readonly classes: {[key: string]: boolean} = {};
  readonly styles: {[key: string]: string | null} = {};
  readonly childNodes: DebugNode[] = [];
  readonly nativeElement: any;

  constructor(nativeNode: any, parent: any, _debugContext: DebugContext) {
    super(nativeNode, parent, _debugContext);
    this.nativeElement = nativeNode;
  }

  addChild(child: DebugNode) {
    if (child) {
      this.childNodes.push(child);
      (child as{parent: DebugNode}).parent = this;
    }
  }

  removeChild(child: DebugNode) {
    const childIndex = this.childNodes.indexOf(child);
    if (childIndex !== -1) {
      (child as{parent: DebugNode | null}).parent = null;
      this.childNodes.splice(childIndex, 1);
    }
  }

  insertChildrenAfter(child: DebugNode, newChildren: DebugNode[]) {
    const siblingIndex = this.childNodes.indexOf(child);
    if (siblingIndex !== -1) {
      this.childNodes.splice(siblingIndex + 1, 0, ...newChildren);
      newChildren.forEach(c => {
        if (c.parent) {
          (c.parent as DebugElement__PRE_R3__).removeChild(c);
        }
        (child as{parent: DebugNode}).parent = this;
      });
    }
  }

  insertBefore(refChild: DebugNode, newChild: DebugNode): void {
    const refIndex = this.childNodes.indexOf(refChild);
    if (refIndex === -1) {
      this.addChild(newChild);
    } else {
      if (newChild.parent) {
        (newChild.parent as DebugElement__PRE_R3__).removeChild(newChild);
      }
      (newChild as{parent: DebugNode}).parent = this;
      this.childNodes.splice(refIndex, 0, newChild);
    }
  }

  query(predicate: Predicate<DebugElement>): DebugElement {
    const results = this.queryAll(predicate);
    return results[0] || null;
  }

  queryAll(predicate: Predicate<DebugElement>): DebugElement[] {
    const matches: DebugElement[] = [];
    _queryElementChildren(this, predicate, matches);
    return matches;
  }

  queryAllNodes(predicate: Predicate<DebugNode>): DebugNode[] {
    const matches: DebugNode[] = [];
    _queryNodeChildren(this, predicate, matches);
    return matches;
  }

  get children(): DebugElement[] {
    return this
        .childNodes  //
        .filter((node) => node instanceof DebugElement__PRE_R3__) as DebugElement[];
  }

  triggerEventHandler(eventName: string, eventObj: any) {
    this.listeners.forEach((listener) => {
      if (listener.name == eventName) {
        listener.callback(eventObj);
      }
    });
  }
}

/**
 * @publicApi
 */
export function asNativeElements(debugEls: DebugElement[]): any {
  return debugEls.map((el) => el.nativeElement);
}

function _queryElementChildren(
    element: DebugElement, predicate: Predicate<DebugElement>, matches: DebugElement[]) {
  element.childNodes.forEach(node => {
    if (node instanceof DebugElement__PRE_R3__) {
      if (predicate(node)) {
        matches.push(node);
      }
      _queryElementChildren(node, predicate, matches);
    }
  });
}

function _queryNodeChildren(
    parentNode: DebugNode, predicate: Predicate<DebugNode>, matches: DebugNode[]) {
  if (parentNode instanceof DebugElement__PRE_R3__) {
    parentNode.childNodes.forEach(node => {
      if (predicate(node)) {
        matches.push(node);
      }
      if (node instanceof DebugElement__PRE_R3__) {
        _queryNodeChildren(node, predicate, matches);
      }
    });
  }
}

function notImplemented(): Error {
  throw new Error('Missing proper ivy implementation.');
}

class DebugNode__POST_R3__ implements DebugNode {
  readonly nativeNode: Node;

  constructor(nativeNode: Node) { this.nativeNode = nativeNode; }

  get parent(): DebugElement|null {
    const parent = this.nativeNode.parentNode as Element;
    return parent ? new DebugElement__POST_R3__(parent) : null;
  }

  get injector(): Injector { return getInjector(this.nativeNode); }

  get componentInstance(): any {
    const nativeElement = this.nativeNode;
    return nativeElement && getComponent(nativeElement as Element);
  }
  get context(): any { return getContext(this.nativeNode as Element); }

  get listeners(): EventListener[] {
    return getListeners(this.nativeNode as Element).filter(isBrowserEvents);
  }

  get references(): {[key: string]: any;} { return getLocalRefs(this.nativeNode); }

  get providerTokens(): any[] { return getInjectionTokens(this.nativeNode as Element); }
}

class DebugElement__POST_R3__ extends DebugNode__POST_R3__ implements DebugElement {
  constructor(nativeNode: Element) {
    ngDevMode && assertDomNode(nativeNode);
    super(nativeNode);
  }

  get nativeElement(): Element|null {
    return this.nativeNode.nodeType == Node.ELEMENT_NODE ? this.nativeNode as Element : null;
  }

  get name(): string { return this.nativeElement !.nodeName; }

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
  get properties(): {[key: string]: any;} {
    const context = loadLContext(this.nativeNode) !;
    const lView = context.lView;
    const tData = lView[TVIEW].data;
    const tNode = tData[context.nodeIndex] as TNode;

    const properties = collectPropertyBindings(tNode, lView, tData);
    const hostProperties = collectHostPropertyBindings(tNode, lView, tData);
    return {...properties, ...hostProperties};
  }

  get attributes(): {[key: string]: string | null;} {
    const attributes: {[key: string]: string | null;} = {};
    const element = this.nativeElement;
    if (element) {
      const eAttrs = element.attributes;
      for (let i = 0; i < eAttrs.length; i++) {
        const attr = eAttrs[i];
        attributes[attr.name] = attr.value;
      }
    }
    return attributes;
  }

  get classes(): {[key: string]: boolean;} {
    const classes: {[key: string]: boolean;} = {};
    const element = this.nativeElement;
    if (element) {
      const lContext = loadLContextFromNode(element);
      const lNode = lContext.lView[lContext.nodeIndex];
      const stylingContext = getStylingContext(lContext.nodeIndex, lContext.lView);
      if (stylingContext) {
        for (let i = StylingIndex.SingleStylesStartPosition; i < lNode.length;
             i += StylingIndex.Size) {
          if (isClassBasedValue(lNode, i)) {
            const className = getProp(lNode, i);
            const value = getValue(lNode, i);
            if (typeof value == 'boolean') {
              // we want to ignore `null` since those don't overwrite the values.
              classes[className] = value;
            }
          }
        }
      } else {
        // Fallback, just read DOM.
        const eClasses = element.classList;
        for (let i = 0; i < eClasses.length; i++) {
          classes[eClasses[i]] = true;
        }
      }
    }
    return classes;
  }

  get styles(): {[key: string]: string | null;} {
    const styles: {[key: string]: string | null;} = {};
    const element = this.nativeElement;
    if (element) {
      const lContext = loadLContextFromNode(element);
      const lNode = lContext.lView[lContext.nodeIndex];
      const stylingContext = getStylingContext(lContext.nodeIndex, lContext.lView);
      if (stylingContext) {
        for (let i = StylingIndex.SingleStylesStartPosition; i < lNode.length;
             i += StylingIndex.Size) {
          if (!isClassBasedValue(lNode, i)) {
            const styleName = getProp(lNode, i);
            const value = getValue(lNode, i) as string | null;
            if (value !== null) {
              // we want to ignore `null` since those don't overwrite the values.
              styles[styleName] = value;
            }
          }
        }
      } else {
        // Fallback, just read DOM.
        const eStyles = (element as HTMLElement).style;
        for (let i = 0; i < eStyles.length; i++) {
          const name = eStyles.item(i);
          styles[name] = eStyles.getPropertyValue(name);
        }
      }
    }
    return styles;
  }

  get childNodes(): DebugNode[] {
    const childNodes = this.nativeNode.childNodes;
    const children: DebugNode[] = [];
    for (let i = 0; i < childNodes.length; i++) {
      const element = childNodes[i];
      children.push(getDebugNode__POST_R3__(element));
    }
    return children;
  }

  get children(): DebugElement[] {
    const nativeElement = this.nativeElement;
    if (!nativeElement) return [];
    const childNodes = nativeElement.children;
    const children: DebugElement[] = [];
    for (let i = 0; i < childNodes.length; i++) {
      const element = childNodes[i];
      children.push(getDebugNode__POST_R3__(element));
    }
    return children;
  }

  query(predicate: Predicate<DebugElement>): DebugElement {
    const results = this.queryAll(predicate);
    return results[0] || null;
  }

  queryAll(predicate: Predicate<DebugElement>): DebugElement[] {
    const matches: DebugElement[] = [];
    _queryNodeChildrenR3(this, predicate, matches, true);
    return matches;
  }

  queryAllNodes(predicate: Predicate<DebugNode>): DebugNode[] {
    const matches: DebugNode[] = [];
    _queryNodeChildrenR3(this, predicate, matches, false);
    return matches;
  }

  triggerEventHandler(eventName: string, eventObj: any): void {
    this.listeners.forEach((listener) => {
      if (listener.name === eventName) {
        listener.callback(eventObj);
      }
    });
  }
}

function _queryNodeChildrenR3(
    parentNode: DebugNode, predicate: Predicate<DebugNode>, matches: DebugNode[],
    elementsOnly: boolean) {
  if (parentNode instanceof DebugElement__POST_R3__) {
    parentNode.childNodes.forEach(node => {
      if (predicate(node)) {
        matches.push(node);
      }
      if (node instanceof DebugElement__POST_R3__) {
        if (elementsOnly ? node.nativeElement : true) {
          _queryNodeChildrenR3(node, predicate, matches, elementsOnly);
        }
      }
    });
  }
}

/**
 * Iterates through the property bindings for a given node and generates
 * a map of property names to values. This map only contains property bindings
 * defined in templates, not in host bindings.
 */
function collectPropertyBindings(
    tNode: TNode, lView: LView, tData: TData): {[key: string]: string} {
  const properties: {[key: string]: string} = {};
  let bindingIndex = getFirstBindingIndex(tNode.propertyMetadataStartIndex, tData);

  while (bindingIndex < tNode.propertyMetadataEndIndex) {
    let value = '';
    let propMetadata = tData[bindingIndex] as string;
    while (!isPropMetadataString(propMetadata)) {
      // This is the first value for an interpolation. We need to build up
      // the full interpolation by combining runtime values in LView with
      // the static interstitial values stored in TData.
      value += renderStringify(lView[bindingIndex]) + tData[bindingIndex];
      propMetadata = tData[++bindingIndex] as string;
    }
    value += lView[bindingIndex];
    // Property metadata string has 3 parts: property name, prefix, and suffix
    const metadataParts = propMetadata.split(INTERPOLATION_DELIMITER);
    const propertyName = metadataParts[0];
    // Attr bindings don't have property names and should be skipped
    if (propertyName) {
      // Wrap value with prefix and suffix (will be '' for normal bindings)
      properties[propertyName] = metadataParts[1] + value + metadataParts[2];
    }
    bindingIndex++;
  }
  return properties;
}

/**
 * Retrieves the first binding index that holds values for this property
 * binding.
 *
 * For normal bindings (e.g. `[id]="id"`), the binding index is the
 * same as the metadata index. For interpolations (e.g. `id="{{id}}-{{name}}"`),
 * there can be multiple binding values, so we might have to loop backwards
 * from the metadata index until we find the first one.
 *
 * @param metadataIndex The index of the first property metadata string for
 * this node.
 * @param tData The data array for the current TView
 * @returns The first binding index for this binding
 */
function getFirstBindingIndex(metadataIndex: number, tData: TData): number {
  let currentBindingIndex = metadataIndex - 1;

  // If the slot before the metadata holds a string, we know that this
  // metadata applies to an interpolation with at least 2 bindings, and
  // we need to search further to access the first binding value.
  let currentValue = tData[currentBindingIndex];

  // We need to iterate until we hit either a:
  // - TNode (it is an element slot marking the end of `consts` section), OR a
  // - metadata string (slot is attribute metadata or a previous node's property metadata)
  while (typeof currentValue === 'string' && !isPropMetadataString(currentValue)) {
    currentValue = tData[--currentBindingIndex];
  }
  return currentBindingIndex + 1;
}

function collectHostPropertyBindings(
    tNode: TNode, lView: LView, tData: TData): {[key: string]: string} {
  const properties: {[key: string]: string} = {};

  // Host binding values for a node are stored after directives on that node
  let hostPropIndex = tNode.directiveEnd;
  let propMetadata = tData[hostPropIndex] as any;

  // When we reach a value in TView.data that is not a string, we know we've
  // hit the next node's providers and directives and should stop copying data.
  while (typeof propMetadata === 'string') {
    const propertyName = propMetadata.split(INTERPOLATION_DELIMITER)[0];
    properties[propertyName] = lView[hostPropIndex];
    propMetadata = tData[++hostPropIndex];
  }
  return properties;
}


// Need to keep the nodes in a global Map so that multiple angular apps are supported.
const _nativeNodeToDebugNode = new Map<any, DebugNode>();

function getDebugNode__PRE_R3__(nativeNode: any): DebugNode|null {
  return _nativeNodeToDebugNode.get(nativeNode) || null;
}

export function getDebugNode__POST_R3__(nativeNode: Element): DebugElement__POST_R3__;
export function getDebugNode__POST_R3__(nativeNode: Node): DebugNode__POST_R3__;
export function getDebugNode__POST_R3__(nativeNode: null): null;
export function getDebugNode__POST_R3__(nativeNode: any): DebugNode|null {
  if (nativeNode instanceof Node) {
    return nativeNode.nodeType == Node.ELEMENT_NODE ?
        new DebugElement__POST_R3__(nativeNode as Element) :
        new DebugNode__POST_R3__(nativeNode);
  }
  return null;
}

/**
 * @publicApi
 */
export const getDebugNode: (nativeNode: any) => DebugNode | null = getDebugNode__PRE_R3__;

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
export interface Predicate<T> { (value: T): boolean; }

/**
 * @publicApi
 */
export const DebugNode: {new (...args: any[]): DebugNode} = DebugNode__PRE_R3__ as any;

/**
 * @publicApi
 */
export const DebugElement: {new (...args: any[]): DebugElement} = DebugElement__PRE_R3__ as any;
