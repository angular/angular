/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {Injectable, type ListenerOptions} from '@angular/core';
import {EventManagerPlugin} from '@angular/platform-browser';

@Injectable()
export class ServerEventManagerPlugin extends EventManagerPlugin {
  // Handle all events on the server.
  override supports(eventName: string) {
    return true;
  }

  override addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: Function,
    options?: ListenerOptions,
  ): Function {
    return getDOM().onAndCancel(element, eventName, handler, options);
  }
}
