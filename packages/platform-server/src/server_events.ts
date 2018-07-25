/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable} from '@angular/core';
import {DOCUMENT, ɵgetDOM as getDOM} from '@angular/platform-browser';

@Injectable()
export class ServerEventManagerPlugin /* extends EventManagerPlugin which is private */ {
  constructor(@Inject(DOCUMENT) private doc: any) {}

  // Handle all events on the server.
  supports(eventName: string) { return true; }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    return getDOM().onAndCancel(element, eventName, handler);
  }

  addGlobalEventListener(element: string, eventName: string, handler: Function): Function {
    const target: HTMLElement = getDOM().getGlobalEventTarget(this.doc, element);
    if (!target) {
      throw new Error(`Unsupported event target ${target} for event ${eventName}`);
    }
    return this.addEventListener(target, eventName, handler);
  }
}
