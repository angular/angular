/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bootstrapWorkerApp} from '@angular/platform-browser-dynamic';
import {App} from './index_common';

export function main() {
  bootstrapWorkerApp(App);
}
