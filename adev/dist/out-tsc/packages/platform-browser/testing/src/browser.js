import {__esDecorate, __runInitializers} from 'tslib';
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵprovideFakePlatformNavigation} from '@angular/common/testing';
import {APP_ID, createPlatformFactory, NgModule} from '@angular/core';
import {TestComponentRenderer} from '@angular/core/testing';
import {BrowserModule, platformBrowser} from '../../index';
import {DOMTestComponentRenderer} from './dom_test_component_renderer';
const ZONELESS_BY_DEFAULT = true;
/**
 * Platform for testing
 *
 * @publicApi
 */
export const platformBrowserTesting = createPlatformFactory(platformBrowser, 'browserTesting');
/**
 * NgModule for testing.
 *
 * @publicApi
 */
let BrowserTestingModule = (() => {
  let _classDecorators = [
    NgModule({
      exports: [BrowserModule],
      providers: [
        {provide: APP_ID, useValue: 'a'},
        ɵprovideFakePlatformNavigation(),
        {provide: TestComponentRenderer, useClass: DOMTestComponentRenderer},
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var BrowserTestingModule = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      BrowserTestingModule = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (BrowserTestingModule = _classThis);
})();
export {BrowserTestingModule};
//# sourceMappingURL=browser.js.map
