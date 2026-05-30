/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementPosition, LifecycleProfile} from '../../../../../protocol';
import {Subject} from 'rxjs';

import {NodeArray} from '../identity-tracker';

type CreationHook = (
  componentOrDirective: any,
  node: Node,
  id: number,
  isComponent: boolean,
  position: ElementPosition,
) => void;

type LifecycleStartHook = (
  componentOrDirective: any,
  hook: keyof LifecycleProfile,
  node: Node,
  id: number,
  isComponent: boolean,
) => void;

type LifecycleEndHook = (
  componentOrDirective: any,
  hook: keyof LifecycleProfile,
  node: Node,
  id: number,
  isComponent: boolean,
) => void;

type ChangeDetectionStartHook = (
  component: any,
  node: Node,
  id: number,
  position: ElementPosition,
) => void;

type ChangeDetectionEndHook = (
  component: any,
  node: Node,
  id: number,
  position: ElementPosition,
) => void;

type DestroyHook = (
  componentOrDirective: any,
  node: Node,
  id: number,
  isComponent: boolean,
  position: ElementPosition,
) => void;

type OutputStartHook = (
  componentOrDirective: any,
  outputName: string,
  node: Node,
  id: number | undefined,
  isComponent: boolean,
) => void;
type OutputEndHook = (
  componentOrDirective: any,
  outputName: string,
  node: Node,
  id: number | undefined,
  isComponent: boolean,
) => void;

export interface Hooks {
  onCreate: CreationHook;
  onDestroy: DestroyHook;
  onChangeDetectionStart: ChangeDetectionStartHook;
  onChangeDetectionEnd: ChangeDetectionEndHook;
  onLifecycleHookStart: LifecycleStartHook;
  onLifecycleHookEnd: LifecycleEndHook;
  onOutputStart: OutputStartHook;
  onOutputEnd: OutputEndHook;
}

/**
 *  Class for profiling angular applications. Handles hook subscriptions and emitting change
 * detection events.
 */
export abstract class Profiler {
  /** @internal */
  protected _inChangeDetection = false;

  changeDetection$ = new Subject<void>();

  private _hooks: Partial<Hooks>[] = [];

  constructor(config: Partial<Hooks> = {}) {
    this._hooks.push(config);
  }

  abstract destroy(): void;

  abstract onIndexForest(newNodes: NodeArray, removedNodes: NodeArray): void;

  subscribe(config: Partial<Hooks>): void {
    this._hooks.push(config);
  }

  unsubscribe(config: Partial<Hooks>): void {
    this._hooks.splice(this._hooks.indexOf(config), 1);
  }

  /** @internal */
  protected _onCreate(
    _: any,
    hook: Node,
    id: number | undefined,
    node: boolean,
    position: ElementPosition | undefined,
  ): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onCreate', [_, hook, id, node, position]);
  }

  /** @internal */
  protected _onDestroy(
    _: any,
    hook: Node,
    id: number | undefined,
    node: boolean,
    position: ElementPosition | undefined,
  ): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onDestroy', [_, hook, id, node, position]);
  }

  /** @internal */
  protected _onChangeDetectionStart(
    _: any,
    hook: Node,
    id: number | undefined,
    position: ElementPosition | undefined,
  ): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onChangeDetectionStart', [_, hook, id, position]);
  }

  /** @internal */
  protected _onChangeDetectionEnd(
    _: any,
    hook: Node,
    id: number | undefined,
    position: ElementPosition | undefined,
  ): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onChangeDetectionEnd', [_, hook, id, position]);
  }

  /** @internal */
  protected _onLifecycleHookStart(
    componentOrDirective: any,
    hook: keyof LifecycleProfile | 'unknown',
    node: Node,
    id: number | undefined,
    isComponent: boolean,
  ): void {
    if (id === undefined || hook === 'unknown') {
      return;
    }
    const a = arguments;
    this._invokeCallback('onLifecycleHookStart', [
      componentOrDirective,
      hook,
      node,
      id,
      isComponent,
    ]);
  }

  /** @internal */
  protected _onLifecycleHookEnd(
    componentOrDirective: any,
    hook: keyof LifecycleProfile | 'unknown',
    node: Node,
    id: number | undefined,
    isComponent: boolean,
  ): void {
    if (id === undefined || hook === 'unknown') {
      return;
    }
    this._invokeCallback('onLifecycleHookEnd', [componentOrDirective, hook, node, id, isComponent]);
  }

  /** @internal */
  protected _onOutputStart(
    componentOrDirective: any,
    hook: string,
    node: Node,
    id: number | undefined,
    isComponent: boolean,
  ): void {
    if (id === undefined) {
      return;
    }
    this._invokeCallback('onOutputStart', [componentOrDirective, hook, node, id, isComponent]);
  }

  /** @internal */
  protected _onOutputEnd(
    componentOrDirective: any,
    hook: string,
    node: Node,
    id: number | undefined,
    isComponent: boolean,
  ): void {
    if (id === undefined) {
      return;
    }
    this._invokeCallback('onOutputEnd', [componentOrDirective, hook, node, id, isComponent]);
  }

  /** @internal */
  private _invokeCallback<K extends keyof Hooks>(name: K, args: Parameters<Hooks[K]>): void {
    this._hooks.forEach((config) => {
      const cb = (config as Hooks)[name];
      if (typeof cb === 'function') {
        (cb as Function).apply(null, args);
      }
    });
  }
}

const hookNames = [
  'OnInit',
  'OnDestroy',
  'OnChanges',
  'DoCheck',
  'AfterContentInit',
  'AfterContentChecked',
  'AfterViewInit',
  'AfterViewChecked',
];

const hookMethodNames = new Set(hookNames.map((hook) => `ng${hook}`));

export const getLifeCycleName = (obj: {}, fn: any): keyof LifecycleProfile | 'unknown' => {
  const proto = Object.getPrototypeOf(obj);
  const keys = Object.getOwnPropertyNames(proto);
  for (const propName of keys) {
    // We don't want to touch random get accessors.
    if (!hookMethodNames.has(propName)) {
      continue;
    }
    if (proto[propName] === fn) {
      return propName as keyof LifecycleProfile;
    }
  }
  const fnName = fn.name;
  if (typeof fnName !== 'string') {
    return 'unknown';
  }
  for (const hookName of hookNames) {
    if (fnName.indexOf(hookName) >= 0) {
      return `ng${hookName}` as keyof LifecycleProfile;
    }
  }
  return 'unknown';
};
