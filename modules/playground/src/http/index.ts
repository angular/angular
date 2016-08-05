/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HTTP_PROVIDERS} from '@angular/http';
import {bootstrap} from '@angular/platform-browser-dynamic';

import {HttpCmp} from './app/http_comp';

export function main() {
  bootstrap(HttpCmp, [HTTP_PROVIDERS]);
}
