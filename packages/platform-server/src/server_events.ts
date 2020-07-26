/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, ɵgetDOM as getDOM} from '@angular/common';
import {Inject, Injectable, NgZone} from '@angular/core';
import {EventManagerPluginOptions, onAndCancelWithZone} from '@angular/platform-browser';

@Injectable()
export class ServerEventManagerPlugin /* extends EventManagerPlugin which is private */ {
  constructor(@Inject(DOCUMENT) private doc: any, private ngZone: NgZone) {}

  // Handle all events on the server.
  supports(eventName: string) {
    return true;
  }

  addEventListener(
      element: HTMLElement, eventName: string, handler: Function,
      options?: EventManagerPluginOptions): Function {
    return onAndCancelWithZone(element, eventName, handler as EventListener, this.ngZone, options);
  }

  addGlobalEventListener(
      element: string, eventName: string, handler: Function,
      options?: EventManagerPluginOptions): Function {
    const target: HTMLElement = getDOM().getGlobalEventTarget(this.doc, element);
    if (!target) {
      throw new Error(`Unsupported event target ${target} for event ${eventName}`);
    }
    return this.addEventListener(target, eventName, handler, options);
  }
}
