/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformModule} from '@angular/cdk/platform';
import {NgModule} from '@angular/core';
import {CdkScrollable} from './scrollable';

@NgModule({
  imports: [PlatformModule],
  exports: [CdkScrollable],
  declarations: [CdkScrollable],
})
export class ScrollDispatchModule {}
