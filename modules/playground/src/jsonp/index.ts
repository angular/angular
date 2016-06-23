/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bootstrap} from '@angular/platform-browser-dynamic';
import {JSONP_PROVIDERS} from '@angular/http';
import {JsonpCmp} from './app/jsonp_comp';

export function main() {
  bootstrap(JsonpCmp, [JSONP_PROVIDERS]);
}
