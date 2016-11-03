/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

import {EventManagerPlugin} from './event_manager';

@Injectable()
export class DomEventsPlugin extends EventManagerPlugin {
  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  supports(eventName: string): boolean { return true; }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    element.addEventListener(eventName, handler as any, false);
    return () => element.removeEventListener(eventName, handler as any, false);
  }

  addGlobalEventListener(target: string, eventName: string, handler: Function): Function {
    let element: any;
    switch (target) {
      case 'window':
        element = window;
        break;
      case 'document':
        element = document;
        break;
      case 'body':
        element = document.body;
        break;
      default:
        throw new Error(`Unsupported event target ${target} for event ${eventName}`);
    }
    return this.addEventListener(element, eventName, handler);
  }
}
