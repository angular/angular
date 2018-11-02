/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di';
import {DebugContext} from '../view/index';

export class EventListener {
  constructor(public name: string, public callback: Function) {}
}

/**
 * @publicApi
 */
export class DebugNode {
  listeners: EventListener[] = [];
  parent: DebugElement|null = null;

  constructor(public nativeNode: any, parent: DebugNode|null, private _debugContext: DebugContext) {
    if (parent && parent instanceof DebugElement) {
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
export class DebugElement extends DebugNode {
  name !: string;
  properties: {[key: string]: any} = {};
  attributes: {[key: string]: string | null} = {};
  classes: {[key: string]: boolean} = {};
  styles: {[key: string]: string | null} = {};
  childNodes: DebugNode[] = [];
  nativeElement: any;

  constructor(nativeNode: any, parent: any, _debugContext: DebugContext) {
    super(nativeNode, parent, _debugContext);
    this.nativeElement = nativeNode;
  }

  addChild(child: DebugNode) {
    if (child) {
      this.childNodes.push(child);
      child.parent = this;
    }
  }

  removeChild(child: DebugNode) {
    const childIndex = this.childNodes.indexOf(child);
    if (childIndex !== -1) {
      child.parent = null;
      this.childNodes.splice(childIndex, 1);
    }
  }

  insertChildrenAfter(child: DebugNode, newChildren: DebugNode[]) {
    const siblingIndex = this.childNodes.indexOf(child);
    if (siblingIndex !== -1) {
      this.childNodes.splice(siblingIndex + 1, 0, ...newChildren);
      newChildren.forEach(c => {
        if (c.parent) {
          c.parent.removeChild(c);
        }
        c.parent = this;
      });
    }
  }

  insertBefore(refChild: DebugNode, newChild: DebugNode): void {
    const refIndex = this.childNodes.indexOf(refChild);
    if (refIndex === -1) {
      this.addChild(newChild);
    } else {
      if (newChild.parent) {
        newChild.parent.removeChild(newChild);
      }
      newChild.parent = this;
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
    return this.childNodes.filter((node) => node instanceof DebugElement) as DebugElement[];
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
    if (node instanceof DebugElement) {
      if (predicate(node)) {
        matches.push(node);
      }
      _queryElementChildren(node, predicate, matches);
    }
  });
}

function _queryNodeChildren(
    parentNode: DebugNode, predicate: Predicate<DebugNode>, matches: DebugNode[]) {
  if (parentNode instanceof DebugElement) {
    parentNode.childNodes.forEach(node => {
      if (predicate(node)) {
        matches.push(node);
      }
      if (node instanceof DebugElement) {
        _queryNodeChildren(node, predicate, matches);
      }
    });
  }
}

// Need to keep the nodes in a global Map so that multiple angular apps are supported.
const _nativeNodeToDebugNode = new Map<any, DebugNode>();

/**
 * @publicApi
 */
export function getDebugNode(nativeNode: any): DebugNode|null {
  return _nativeNodeToDebugNode.get(nativeNode) || null;
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
export interface Predicate<T> { (value: T): boolean; }
