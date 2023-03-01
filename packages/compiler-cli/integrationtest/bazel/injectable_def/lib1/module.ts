/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgModule} from '@angular/core';

@NgModule({})
export class Lib1Module {
}

@Injectable({
  providedIn: Lib1Module,
})
export class Service {
  static instanceCount = 0;
  instance = Service.instanceCount++;
}
