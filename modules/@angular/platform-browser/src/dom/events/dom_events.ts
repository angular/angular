/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

import {getDOM} from '../dom_adapter';

import {EventManagerPlugin} from './event_manager';

@Injectable()
export class DomEventsPlugin extends EventManagerPlugin {
  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  supports(eventName: string): boolean { return true; }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    // IE9 doesn't fire the input event on backspace, delete or cut
    if (getDOM().msie() === 9 && eventName === 'input') {
      element.addEventListener('change', handler as any, false);

      const keydownHandler = (event: KeyboardEvent) => {
        const key: number = event.keyCode;

        // ignore
        //    command            modifiers                   arrows
        if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) return;

        setTimeout(() => handler(event));
      };

      element.addEventListener('keydown', keydownHandler, false);

      return () => {
        element.removeEventListener('change', handler as any, false);
        element.removeEventListener('keydown', keydownHandler, false);
      };
    }

    element.addEventListener(eventName, handler as any, false);
    return () => element.removeEventListener(eventName, handler as any, false);
  }
}
