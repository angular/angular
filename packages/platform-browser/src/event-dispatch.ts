/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  ElementRef,
  ɵinitGlobalEventDelegation,
  inject,
  GlobalEventDelegation,
  cleanupGlobalEventDelegation,
  IS_GLOBAL_EVENT_DELEGATION_ENABLED,
  AfterContentInit,
} from '@angular/core';

@Directive({
  selector: '[event-dispatch]',
  providers: [
    {
      provide: IS_GLOBAL_EVENT_DELEGATION_ENABLED,
      useValue: true,
    },
  ],
  standalone: true,
})
export class EventDispatchDirective implements AfterContentInit {
  private readonly globalEventDelegation = inject(GlobalEventDelegation);
  constructor() {
    const element = inject(ElementRef);
    ɵinitGlobalEventDelegation(element.nativeElement);
  }
  ngAfterContentInit() {
    cleanupGlobalEventDelegation(this.globalEventDelegation);
  }
}
