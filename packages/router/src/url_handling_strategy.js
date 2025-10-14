/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {inject, Injectable} from '@angular/core';
/**
 * @description
 *
 * Provides a way to migrate AngularJS applications to Angular.
 *
 * @publicApi
 */
let UrlHandlingStrategy = class UrlHandlingStrategy {};
UrlHandlingStrategy = __decorate(
  [Injectable({providedIn: 'root', useFactory: () => inject(DefaultUrlHandlingStrategy)})],
  UrlHandlingStrategy,
);
export {UrlHandlingStrategy};
/**
 * @publicApi
 */
let DefaultUrlHandlingStrategy = class DefaultUrlHandlingStrategy {
  shouldProcessUrl(url) {
    return true;
  }
  extract(url) {
    return url;
  }
  merge(newUrlPart, wholeUrl) {
    return newUrlPart;
  }
};
DefaultUrlHandlingStrategy = __decorate(
  [Injectable({providedIn: 'root'})],
  DefaultUrlHandlingStrategy,
);
export {DefaultUrlHandlingStrategy};
//# sourceMappingURL=url_handling_strategy.js.map
