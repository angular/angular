/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpHandler, Verbosity, bootstrapServiceWorker} from '@angular/service-worker/sdk';
import {Dynamic, ExternalContentCache, FreshnessStrategy, PerformanceStrategy, Push, RouteRedirection, StaticContentCache} from '@angular/service-worker/sdk/plugins';

export function main() {
  bootstrapServiceWorker({
    manifestUrl: 'ngsw-manifest.json',
    plugins: [
      StaticContentCache(),
      Dynamic([
        new FreshnessStrategy(),
        new PerformanceStrategy(),
      ]),
      ExternalContentCache(),
      RouteRedirection(),
      Push(),
    ],
    logLevel: Verbosity.DEBUG,
    logHandlers: [
      new HttpHandler('/ngsw-log'),
    ],
  });
}

main();
