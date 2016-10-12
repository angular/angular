/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, DoCheck, OnChanges, OnDestroy, OnInit, Type} from '@angular/core';

import {LifecycleHooks, reflector} from './private_import_core';


export function hasLifecycleHook(hook: LifecycleHooks, token: any): boolean {
  return reflector.hasLifecycleHook(token, getInterface(hook), getHookName(hook));
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

function getInterface(hook: LifecycleHooks): any {
  switch (hook) {
    case LifecycleHooks.OnInit:
      return OnInit;
    case LifecycleHooks.OnDestroy:
      return OnDestroy;
    case LifecycleHooks.DoCheck:
      return DoCheck;
    case LifecycleHooks.OnChanges:
      return OnChanges;
    case LifecycleHooks.AfterContentInit:
      return AfterContentInit;
    case LifecycleHooks.AfterContentChecked:
      return AfterContentChecked;
    case LifecycleHooks.AfterViewInit:
      return AfterViewInit;
    case LifecycleHooks.AfterViewChecked:
      return AfterViewChecked;
  }
}
