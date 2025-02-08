/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵpublishExternalGlobalUtil} from '@angular/core';
import {Route} from './models';

export function getLoadedRoutes(route: Route): Route[] | undefined {
  return route._loadedRoutes;
}

ɵpublishExternalGlobalUtil('ɵgetLoadedRoutes', getLoadedRoutes);
