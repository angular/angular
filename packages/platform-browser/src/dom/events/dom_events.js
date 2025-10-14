/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate, __param} from 'tslib';
import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {EventManagerPlugin} from './event_manager';
let DomEventsPlugin = class DomEventsPlugin extends EventManagerPlugin {
  constructor(doc) {
    super(doc);
  }
  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  supports(eventName) {
    return true;
  }
  addEventListener(element, eventName, handler, options) {
    element.addEventListener(eventName, handler, options);
    return () => this.removeEventListener(element, eventName, handler, options);
  }
  removeEventListener(target, eventName, callback, options) {
    return target.removeEventListener(eventName, callback, options);
  }
};
DomEventsPlugin = __decorate([Injectable(), __param(0, Inject(DOCUMENT))], DomEventsPlugin);
export {DomEventsPlugin};
//# sourceMappingURL=dom_events.js.map
