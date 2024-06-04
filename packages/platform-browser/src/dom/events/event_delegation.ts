/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, inject, ɵGLOBAL_EVENT_DELEGATION} from '@angular/core';
import {EventManagerPlugin} from './event_manager';
import {DOCUMENT} from '@angular/common';

@Injectable()
export class EventDelegationPlugin extends EventManagerPlugin {
  private delegate = inject(ɵGLOBAL_EVENT_DELEGATION, {optional: true});
  constructor(@Inject(DOCUMENT) doc: any) {
    super(doc);
  }

  override supports(eventName: string): boolean {
    // If `GlobalDelegationEventPlugin` implementation is not provided,
    // this plugin is kept disabled.
    return this.delegate ? this.delegate.supports(eventName) : false;
  }

  override addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    return this.delegate!.addEventListener(element, eventName, handler);
  }

  removeEventListener(element: HTMLElement, eventName: string, callback: Function): void {
    return this.delegate!.removeEventListener(element, eventName, callback);
  }
}
