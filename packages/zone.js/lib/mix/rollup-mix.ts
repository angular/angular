/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {patchBrowser} from '../browser/browser';
import {patchCommon} from '../browser/rollup-common';
import {patchNode} from '../node/node';
import {loadZone} from '../zone';

const Zone = loadZone();
patchCommon(Zone);
patchBrowser(Zone);
patchNode(Zone);
