/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ImageDemo} from './index_common';
import {bootstrapWorkerApp} from '@angular/platform-browser-dynamic';

export function main() {
  bootstrapWorkerApp(ImageDemo);
}
