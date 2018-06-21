/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di';
import {DebugContext} from '../view/index';
import {DebugElementInterface} from './interfaces';

export class EventListener {
  constructor(public name: string, public callback: Function) {}
}

/**
 * @experimental All debugging apis are currently experimental.
 */
export class DebugNode {
  nativeNode: any;
  listeners: EventListener[];
  parent: DebugElementInterface|null;

  constructor(nativeNode: any, parent: DebugNode|null, private _debugContext: DebugContext) {
    this.nativeNode = nativeNode;
    if (parent && isDebugElement(parent)) {
      parent.addChild(this);
    } else {
      this.parent = null;
    }
    this.listeners = [];
  }

  get injector(): Injector { return this._debugContext.injector; }

  get componentInstance(): any { return this._debugContext.component; }

  get context(): any { return this._debugContext.context; }

  get references(): {[key: string]: any} { return this._debugContext.references; }

  get providerTokens(): any[] { return this._debugContext.providerTokens; }
}



/**
 * @experimental
 */
export function asNativeElements(debugEls: DebugElementInterface[]): any {
  return debugEls.map((el) => el.nativeElement);
}


// Need to keep the nodes in a global Map so that multiple angular apps are supported.
const _nativeNodeToDebugNode = new Map<any, DebugNode>();

/**
 * @experimental
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
 * @experimental All debugging apis are currently experimental.
 */
export interface Predicate<T> { (value: T): boolean; }

export {DebugElement} from './debug_element';

function isDebugElement(node: any): node is DebugElementInterface {
  return node.childNodes !== undefined;
}
