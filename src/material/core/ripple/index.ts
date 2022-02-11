/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '../common-behaviors/common-module';
import {MatRipple} from './ripple';

export * from './ripple';
export * from './ripple-ref';
export * from './ripple-renderer';

@NgModule({
  imports: [MatCommonModule],
  exports: [MatRipple, MatCommonModule],
  declarations: [MatRipple],
})
export class MatRippleModule {}
