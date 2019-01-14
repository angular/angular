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
import {TVIEW} from '../render3/interfaces/view';
import {getProp, getValue, isClassBasedValue} from '../render3/styling/class_and_style_bindings';
import {getStylingContext} from '../render3/styling/util';
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

  get properties(): {[key: string]: any;} {
    const context = loadLContext(this.nativeNode) !;
    const lView = context.lView;
    const tView = lView[TVIEW];
    const tNode = tView.data[context.nodeIndex] as TNode;
    const properties = {};
    // TODO: https://angular-team.atlassian.net/browse/FW-681
    // Missing implementation here...
    return properties;
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
