/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';

import {EventManagerPlugin} from './event_manager';

@Injectable()
export class DomEventsPlugin extends EventManagerPlugin {
  constructor(@Inject(DOCUMENT) doc: any) {
    super(doc);
  }

  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  supports(eventName: string): boolean {
    return true;
  }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    element.addEventListener(eventName, handler as EventListener, false);
    return () => this.removeEventListener(element, eventName, handler as EventListener);
  }

  removeEventListener(target: any, eventName: string, callback: Function): void {
    return target.removeEventListener(eventName, callback as EventListener);
  }
}
