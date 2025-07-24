/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {loadZone} from '../zone';

import {patchBrowser} from './browser';
import {patchBrowserLegacy} from './browser-legacy';
import {patchCommon} from './rollup-common';

const Zone = loadZone();
patchCommon(Zone);
patchBrowserLegacy();
patchBrowser(Zone);
