/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, DoCheck, OnChanges, OnDestroy, OnInit, Type} from '@angular/core';

import {MapWrapper} from './facade/collection';
import {LifecycleHooks, reflector} from './private_import_core';

const LIFECYCLE_INTERFACES: Map<any, Type<any>> = MapWrapper.createFromPairs([
  [LifecycleHooks.OnInit, OnInit],
  [LifecycleHooks.OnDestroy, OnDestroy],
  [LifecycleHooks.DoCheck, DoCheck],
  [LifecycleHooks.OnChanges, OnChanges],
  [LifecycleHooks.AfterContentInit, AfterContentInit],
  [LifecycleHooks.AfterContentChecked, AfterContentChecked],
  [LifecycleHooks.AfterViewInit, AfterViewInit],
  [LifecycleHooks.AfterViewChecked, AfterViewChecked],
]);

const LIFECYCLE_PROPS: Map<any, string> = MapWrapper.createFromPairs([
  [LifecycleHooks.OnInit, 'ngOnInit'],
  [LifecycleHooks.OnDestroy, 'ngOnDestroy'],
  [LifecycleHooks.DoCheck, 'ngDoCheck'],
  [LifecycleHooks.OnChanges, 'ngOnChanges'],
  [LifecycleHooks.AfterContentInit, 'ngAfterContentInit'],
  [LifecycleHooks.AfterContentChecked, 'ngAfterContentChecked'],
  [LifecycleHooks.AfterViewInit, 'ngAfterViewInit'],
  [LifecycleHooks.AfterViewChecked, 'ngAfterViewChecked'],
]);

export function hasLifecycleHook(hook: LifecycleHooks, token: any): boolean {
  var lcInterface = LIFECYCLE_INTERFACES.get(hook);
  var lcProp = LIFECYCLE_PROPS.get(hook);
  return reflector.hasLifecycleHook(token, lcInterface, lcProp);
}
