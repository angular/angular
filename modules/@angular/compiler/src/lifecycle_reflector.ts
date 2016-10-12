/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LifecycleHooks, reflector} from './private_import_core';


export function hasLifecycleHook(hook: LifecycleHooks, token: any): boolean {
  return reflector.hasLifecycleHook(token, getHookName(hook));
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