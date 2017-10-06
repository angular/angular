/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {PlatformModule} from '@angular/cdk/platform';
import {MatCommonModule} from '../common-behaviors/common-module';
import {MatRipple} from './ripple';

export {MatRipple, RippleGlobalOptions, MAT_RIPPLE_GLOBAL_OPTIONS} from './ripple';
export {RippleRef, RippleState} from './ripple-ref';
export {RippleConfig, RIPPLE_FADE_IN_DURATION, RIPPLE_FADE_OUT_DURATION} from './ripple-renderer';

@NgModule({
  imports: [MatCommonModule, PlatformModule],
  exports: [MatRipple, MatCommonModule],
  declarations: [MatRipple],
})
export class MatRippleModule {}
