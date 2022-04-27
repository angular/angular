/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Adapter} from './src/adapter.js';
import {CacheDatabase} from './src/db-cache.js';
import {Driver} from './src/driver.js';

const scope = self as unknown as ServiceWorkerGlobalScope;

const adapter = new Adapter(scope.registration.scope, self.caches);
new Driver(scope, adapter, new CacheDatabase(adapter));
