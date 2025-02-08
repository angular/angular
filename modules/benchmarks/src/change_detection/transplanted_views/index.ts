/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {init} from './init';
import {TransplantedViewsModule} from './transplanted_views';

enableProdMode();
platformBrowserDynamic().bootstrapModule(TransplantedViewsModule).then(init);
