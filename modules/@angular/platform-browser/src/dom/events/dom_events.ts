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
    // https://github.com/angular/angular/issues/13548
    const zone = this.manager.getZone();
    const outsideHandler = (event: Event) => zone.runGuarded(() => handler(event));
    return zone.runOutsideAngular(() => getDOM().onAndCancel(element, eventName, outsideHandler));
  }
}
