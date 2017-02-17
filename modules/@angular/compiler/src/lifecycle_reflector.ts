/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵLifecycleHooks, ɵreflector} from '@angular/core';


export function hasLifecycleHook(hook: ɵLifecycleHooks, token: any): boolean {
  return ɵreflector.hasLifecycleHook(token, getHookName(hook));
}

function getHookName(hook: ɵLifecycleHooks): string {
  switch (hook) {
    case ɵLifecycleHooks.OnInit:
      return 'ngOnInit';
    case ɵLifecycleHooks.OnDestroy:
      return 'ngOnDestroy';
    case ɵLifecycleHooks.DoCheck:
      return 'ngDoCheck';
    case ɵLifecycleHooks.OnChanges:
      return 'ngOnChanges';
    case ɵLifecycleHooks.AfterContentInit:
      return 'ngAfterContentInit';
    case ɵLifecycleHooks.AfterContentChecked:
      return 'ngAfterContentChecked';
    case ɵLifecycleHooks.AfterViewInit:
      return 'ngAfterViewInit';
    case ɵLifecycleHooks.AfterViewChecked:
      return 'ngAfterViewChecked';
  }
}
