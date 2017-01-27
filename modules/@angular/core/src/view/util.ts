/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDevMode} from '../application_ref';
import {devModeEqual} from '../change_detection/change_detection';
import {SimpleChange} from '../change_detection/change_detection_util';
import {looseIdentical} from '../facade/lang';
import {Renderer} from '../render/api';

import {expressionChangedAfterItHasBeenCheckedError, isViewError, viewWrappedError} from './errors';
import {ElementData, EntryAction, NodeData, NodeDef, NodeFlags, NodeType, ViewData, ViewDefinition, ViewDefinitionFactory, asElementData, asTextData} from './types';

export function setBindingDebugInfo(
    renderer: Renderer, renderNode: any, propName: string, value: any) {
  try {
    renderer.setBindingDebugInfo(
        renderNode, `ng-reflect-${camelCaseToDashCase(propName)}`, value ? value.toString() : null);
  } catch (e) {
    renderer.setBindingDebugInfo(
        renderNode, `ng-reflect-${camelCaseToDashCase(propName)}`,
        '[ERROR] Exception while trying to serialize the value');
  }
}

const CAMEL_CASE_REGEXP = /([A-Z])/g;

function camelCaseToDashCase(input: string): string {
  return input.replace(CAMEL_CASE_REGEXP, (...m: any[]) => '-' + m[1].toLowerCase());
}

export function checkBindingNoChanges(
    view: ViewData, def: NodeDef, bindingIdx: number, value: any) {
  const oldValue = view.oldValues[def.bindingIndex + bindingIdx];
  if (view.firstChange || !devModeEqual(oldValue, value)) {
    throw expressionChangedAfterItHasBeenCheckedError(
        view.services.createDebugContext(view, def.index), oldValue, value, view.firstChange);
  }
}

export function checkAndUpdateBinding(
    view: ViewData, def: NodeDef, bindingIdx: number, value: any): boolean {
  const oldValues = view.oldValues;
  if (view.firstChange || !looseIdentical(oldValues[def.bindingIndex + bindingIdx], value)) {
    oldValues[def.bindingIndex + bindingIdx] = value;
    return true;
  }
  return false;
}

export function checkAndUpdateBindingWithChange(
    view: ViewData, def: NodeDef, bindingIdx: number, value: any): SimpleChange {
  const oldValues = view.oldValues;
  const oldValue = oldValues[def.bindingIndex + bindingIdx];
  if (view.firstChange || !looseIdentical(oldValue, value)) {
    oldValues[def.bindingIndex + bindingIdx] = value;
    return new SimpleChange(oldValue, value, view.firstChange);
  }
  return null;
}

export function declaredViewContainer(view: ViewData): ElementData {
  if (view.parent) {
    const parentView = view.parent;
    return asElementData(parentView, view.parentIndex);
  }
  return undefined;
}

export function renderNode(view: ViewData, def: NodeDef): any {
  switch (def.type) {
    case NodeType.Element:
      return asElementData(view, def.index).renderElement;
    case NodeType.Text:
      return asTextData(view, def.index).renderText;
  }
}

export function isComponentView(view: ViewData): boolean {
  return view.component === view.context && !!view.parent;
}

const VIEW_DEFINITION_CACHE = new WeakMap<any, ViewDefinition>();

export function resolveViewDefinition(factory: ViewDefinitionFactory): ViewDefinition {
  let value: ViewDefinition = VIEW_DEFINITION_CACHE.get(factory);
  if (!value) {
    value = factory();
    VIEW_DEFINITION_CACHE.set(factory, value);
  }
  return value;
}

export function sliceErrorStack(start: number, end: number): string {
  let err: any;
  try {
    throw new Error();
  } catch (e) {
    err = e;
  }
  const stack = err.stack || '';
  const lines = stack.split('\n');
  if (lines[0].startsWith('Error')) {
    // Chrome always adds the message to the stack as well...
    start++;
    end++;
  }
  return lines.slice(start, end).join('\n');
}

let _currentAction: EntryAction;
let _currentView: ViewData;
let _currentNodeIndex: number;

export function currentView() {
  return _currentView;
}

export function currentNodeIndex() {
  return _currentNodeIndex;
}

export function currentAction() {
  return _currentAction;
}

/**
 * Set the node that is currently worked on.
 * It needs to be called whenever we call user code,
 * or code of the framework that might throw as a valid use case.
 */
export function setCurrentNode(view: ViewData, nodeIndex: number) {
  _currentView = view;
  _currentNodeIndex = nodeIndex;
}

/**
 * Adds a try/catch handler around the given function to wrap all
 * errors that occur into new errors that contain the current debug info
 * set via setCurrentNode.
 */
export function entryAction<A, R>(action: EntryAction, fn: (arg: A) => R): (arg: A) => R {
  return <any>function(arg: any) {
    const oldAction = _currentAction;
    const oldView = _currentView;
    const oldNodeIndex = _currentNodeIndex;
    _currentAction = action;
    // Note: We can't call `isDevMode()` outside of this closure as
    // it might not have been initialized.
    const result = isDevMode() ? callWithTryCatch(fn, arg) : fn(arg);
    _currentAction = oldAction;
    _currentView = oldView;
    _currentNodeIndex = oldNodeIndex;
    return result;
  };
}

function callWithTryCatch(fn: (a: any) => any, arg: any): any {
  try {
    return fn(arg);
  } catch (e) {
    if (isViewError(e) || !_currentView) {
      throw e;
    }
    const debugContext = _currentView.services.createDebugContext(_currentView, _currentNodeIndex);
    throw viewWrappedError(e, debugContext);
  }
}
