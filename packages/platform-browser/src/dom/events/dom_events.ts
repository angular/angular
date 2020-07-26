/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, ɵgetDOM as getDOM} from '@angular/common';
import {Inject, Injectable} from '@angular/core';

import {EventManagerPlugin, EventManagerPluginOptions} from './event_manager';
import {onAndCancelWithZone} from './zone_event_util';

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

  addEventListener(
      element: HTMLElement, eventName: string, handler: Function,
      options?: EventManagerPluginOptions): Function {
    return onAndCancelWithZone(
        element, eventName, handler as EventListener, this.manager.getZone(), options);
  }
}
