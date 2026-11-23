/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementPosition, LifecycleProfile} from '../../../../../protocol';
import {Subject} from 'rxjs';

import {NodeArray} from '../../directive-forest/identity-tracker/identity-tracker';
import {ComponentInstance, DirectiveInstance} from '../../shared/interfaces';

type CreationHook = (
  componentOrDirective: DirectiveInstance,
  node: Node,
  id: number,
  isComponent: boolean,
  position: ElementPosition,
) => void;

type LifecycleStartHook = (
  componentOrDirective: DirectiveInstance,
  hook: keyof LifecycleProfile,
  node: Node,
  id: number,
  isComponent: boolean,
) => void;

type LifecycleEndHook = (
  componentOrDirective: DirectiveInstance,
  hook: keyof LifecycleProfile,
  node: Node,
  id: number,
  isComponent: boolean,
) => void;

type ChangeDetectionStartHook = (
  component: ComponentInstance,
  node: Node,
  id: number,
  position: ElementPosition,
) => void;

type ChangeDetectionEndHook = (
  component: ComponentInstance,
  node: Node,
  id: number,
  position: ElementPosition,
) => void;

type DestroyHook = (
  componentOrDirective: DirectiveInstance,
  node: Node,
  id: number,
  isComponent: boolean,
  position: ElementPosition,
) => void;

type OutputStartHook = (
  componentOrDirective: DirectiveInstance,
  outputName: string,
  node: Node,
  id: number | undefined,
  isComponent: boolean,
) => void;

type OutputEndHook = (
  componentOrDirective: DirectiveInstance,
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
  protected inChangeDetection = false;

  changeDetection$ = new Subject<void>();

  private hooks: Partial<Hooks>[] = [];

  constructor(config: Partial<Hooks> = {}) {
    this.hooks.push(config);
  }

  abstract destroy(): void;

  abstract onIndexForest(newNodes: NodeArray, removedNodes: NodeArray): void;

  subscribe(config: Partial<Hooks>): void {
    this.hooks.push(config);
  }

  unsubscribe(config: Partial<Hooks>): void {
    this.hooks.splice(this.hooks.indexOf(config), 1);
  }

  /** @internal */
  protected onCreate(
    _: DirectiveInstance,
    hook: Node,
    id: number | undefined,
    node: boolean,
    position: ElementPosition | undefined,
  ): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this.invokeCallback('onCreate', [_, hook, id, node, position]);
  }

  /** @internal */
  protected onDestroy(
    _: DirectiveInstance,
    hook: Node,
    id: number | undefined,
    node: boolean,
    position: ElementPosition | undefined,
  ): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this.invokeCallback('onDestroy', [_, hook, id, node, position]);
  }

  /** @internal */
  protected onChangeDetectionStart(
    _: ComponentInstance,
    hook: Node,
    id: number | undefined,
    position: ElementPosition | undefined,
  ): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this.invokeCallback('onChangeDetectionStart', [_, hook, id, position]);
  }

  /** @internal */
  protected onChangeDetectionEnd(
    _: ComponentInstance,
    hook: Node,
    id: number | undefined,
    position: ElementPosition | undefined,
  ): void {
    if (id === undefined || position === undefined) {
      return;
    }
    this.invokeCallback('onChangeDetectionEnd', [_, hook, id, position]);
  }

  /** @internal */
  protected onLifecycleHookStart(
    componentOrDirective: DirectiveInstance,
    hook: keyof LifecycleProfile | 'unknown',
    node: Node,
    id: number | undefined,
    isComponent: boolean,
  ): void {
    if (id === undefined || hook === 'unknown') {
      return;
    }
    const a = arguments;
    this.invokeCallback('onLifecycleHookStart', [
      componentOrDirective,
      hook,
      node,
      id,
      isComponent,
    ]);
  }

  /** @internal */
  protected onLifecycleHookEnd(
    componentOrDirective: DirectiveInstance,
    hook: keyof LifecycleProfile | 'unknown',
    node: Node,
    id: number | undefined,
    isComponent: boolean,
  ): void {
    if (id === undefined || hook === 'unknown') {
      return;
    }
    this.invokeCallback('onLifecycleHookEnd', [componentOrDirective, hook, node, id, isComponent]);
  }

  /** @internal */
  protected onOutputStart(
    componentOrDirective: DirectiveInstance,
    hook: string,
    node: Node,
    id: number | undefined,
    isComponent: boolean,
  ): void {
    if (id === undefined) {
      return;
    }
    this.invokeCallback('onOutputStart', [componentOrDirective, hook, node, id, isComponent]);
  }

  /** @internal */
  protected onOutputEnd(
    componentOrDirective: DirectiveInstance,
    hook: string,
    node: Node,
    id: number | undefined,
    isComponent: boolean,
  ): void {
    if (id === undefined) {
      return;
    }
    this.invokeCallback('onOutputEnd', [componentOrDirective, hook, node, id, isComponent]);
  }

  /** @internal */
  private invokeCallback<K extends keyof Hooks>(name: K, args: Parameters<Hooks[K]>): void {
    this.hooks.forEach((config) => {
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
