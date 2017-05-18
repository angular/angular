/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileReflector} from './compile_reflector';

export enum LifecycleHooks {
  OnInit,
  OnDestroy,
  DoCheck,
  OnChanges,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked
}

export const LIFECYCLE_HOOKS_VALUES = [
  LifecycleHooks.OnInit, LifecycleHooks.OnDestroy, LifecycleHooks.DoCheck, LifecycleHooks.OnChanges,
  LifecycleHooks.AfterContentInit, LifecycleHooks.AfterContentChecked, LifecycleHooks.AfterViewInit,
  LifecycleHooks.AfterViewChecked
];

export function hasLifecycleHook(
    reflector: CompileReflector, hook: LifecycleHooks, token: any): boolean {
  return reflector.hasLifecycleHook(token, getHookName(hook));
}

export function getAllLifecycleHooks(reflector: CompileReflector, token: any): LifecycleHooks[] {
  return LIFECYCLE_HOOKS_VALUES.filter(hook => hasLifecycleHook(reflector, hook, token));
}

function getHookName(hook: LifecycleHooks): string {
  switch (hook) {
    case LifecycleHooks.OnInit:
      return 'ngOnInit';
    case LifecycleHooks.OnDestroy:
      return 'ngOnDestroy';
    case LifecycleHooks.DoCheck:
      return 'ngDoCheck';
    case LifecycleHooks.OnChanges:
      return 'ngOnChanges';
    case LifecycleHooks.AfterContentInit:
      return 'ngAfterContentInit';
    case LifecycleHooks.AfterContentChecked:
      return 'ngAfterContentChecked';
    case LifecycleHooks.AfterViewInit:
      return 'ngAfterViewInit';
    case LifecycleHooks.AfterViewChecked:
      return 'ngAfterViewChecked';
  }
}
