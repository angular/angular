/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WORKER_UI_LOCATION_PROVIDERS} from '@angular/platform-browser';
import {bootstrapWorkerUi} from "@angular/platform-browser-dynamic";

export function main() {
  bootstrapWorkerUi("loader.js", WORKER_UI_LOCATION_PROVIDERS);
}
