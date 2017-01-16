/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di';
import {Predicate} from '../facade/collection';
import {RenderDebugInfo} from '../render/api';

export class EventListener { constructor(public name: string, public callback: Function){}; }

/**
 * @experimental All debugging apis are currently experimental.
 */
export class DebugNode {
  nativeNode: any;
  listeners: EventListener[];
  parent: DebugElement;

  constructor(nativeNode: any, parent: DebugNode, private _debugInfo: RenderDebugInfo) {
    this.nativeNode = nativeNode;
    if (parent && parent instanceof DebugElement) {
      parent.addChild(this);
    } else {
      this.parent = null;
    }
    this.listeners = [];
  }

  get injector(): Injector { return this._debugInfo ? this._debugInfo.injector : null; }

  get componentInstance(): any { return this._debugInfo ? this._debugInfo.component : null; }

  get context(): any { return this._debugInfo ? this._debugInfo.context : null; }

  get references(): {[key: string]: any} {
    return this._debugInfo ? this._debugInfo.references : null;
  }

  get providerTokens(): any[] { return this._debugInfo ? this._debugInfo.providerTokens : null; }

  get source(): string { return this._debugInfo ? this._debugInfo.source : null; }
}

/**
 * @experimental All debugging apis are currently experimental.
 */
export class DebugElement extends DebugNode {
  name: string;
  properties: {[key: string]: any};
  attributes: {[key: string]: string};
  classes: {[key: string]: boolean};
  styles: {[key: string]: string};
  childNodes: DebugNode[];
  nativeElement: any;

  constructor(nativeNode: any, parent: any, _debugInfo: RenderDebugInfo) {
    super(nativeNode, parent, _debugInfo);
    this.properties = {};
    this.attributes = {};
    this.classes = {};
    this.styles = {};
    this.childNodes = [];
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
      const previousChildren = this.childNodes.slice(0, siblingIndex + 1);
      const nextChildren = this.childNodes.slice(siblingIndex + 1);
      this.childNodes = previousChildren.concat(newChildren, nextChildren);
      for (let i = 0; i < newChildren.length; ++i) {
        const newChild = newChildren[i];
        if (newChild.parent) {
          newChild.parent.removeChild(newChild);
        }
        newChild.parent = this;
      }
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
 * @experimental
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
 * @experimental
 */
export function getDebugNode(nativeNode: any): DebugNode {
  return _nativeNodeToDebugNode.get(nativeNode);
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
