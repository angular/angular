/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, type ListenerOptions} from '@angular/core';

import {EventManagerPlugin} from './event_manager';

@Injectable()
export class DomEventsPlugin extends EventManagerPlugin {
  constructor(@Inject(DOCUMENT) doc: any) {
    super(doc);
  }

  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  override supports(eventName: string): boolean {
    return true;
  }

  override addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: Function,
    options?: ListenerOptions,
  ): Function {
    element.addEventListener(eventName, handler as EventListener, options);
    return () => this.removeEventListener(element, eventName, handler as EventListener, options);
  }

  removeEventListener(
    target: any,
    eventName: string,
    callback: Function,
    options?: ListenerOptions,
  ): void {
    return target.removeEventListener(eventName, callback as EventListener, options);
  }
}
