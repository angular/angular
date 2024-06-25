/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, inject, ɵGlobalEventDelegation} from '@angular/core';
import {EventManagerPlugin} from './event_manager';
import {DOCUMENT} from '@angular/common';

@Injectable()
export class EventDelegationPlugin extends EventManagerPlugin {
  globalEventDelegation = inject(ɵGlobalEventDelegation);
  constructor(@Inject(DOCUMENT) doc: any) {
    super(doc);
  }

  override supports(eventName: string): boolean {
    return this.globalEventDelegation.supports(eventName);
  }

  override addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    return this.globalEventDelegation.addEventListener(element, eventName, handler);
  }

  removeEventListener(element: HTMLElement, eventName: string, callback: Function): void {
    return this.globalEventDelegation.removeEventListener(element, eventName, callback);
  }
}
