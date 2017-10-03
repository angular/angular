/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkStepper, CdkStep} from './stepper';
import {CommonModule} from '@angular/common';
import {CdkStepLabel} from './step-label';
import {CdkStepperNext, CdkStepperPrevious} from './stepper-button';
import {BidiModule} from '@angular/cdk/bidi';

@NgModule({
  imports: [BidiModule, CommonModule],
  exports: [CdkStep, CdkStepper, CdkStepLabel, CdkStepperNext, CdkStepperPrevious],
  declarations: [CdkStep, CdkStepper, CdkStepLabel, CdkStepperNext, CdkStepperPrevious]
})
export class CdkStepperModule {}
