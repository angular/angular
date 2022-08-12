/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PortalModule} from '@angular/cdk/portal';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {ErrorStateMatcher, MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatStepHeader} from './step-header';
import {MatStepLabel} from './step-label';
import {MatStep, MatStepper} from './stepper';
import {MatStepperNext, MatStepperPrevious} from './stepper-button';
import {MatStepperIcon} from './stepper-icon';
import {MAT_STEPPER_INTL_PROVIDER} from './stepper-intl';
import {MatStepContent} from './step-content';

@NgModule({
  imports: [
    MatCommonModule,
    CommonModule,
    PortalModule,
    MatLegacyButtonModule,
    CdkStepperModule,
    MatIconModule,
    MatRippleModule,
  ],
  exports: [
    MatCommonModule,
    MatStep,
    MatStepLabel,
    MatStepper,
    MatStepperNext,
    MatStepperPrevious,
    MatStepHeader,
    MatStepperIcon,
    MatStepContent,
  ],
  declarations: [
    MatStep,
    MatStepLabel,
    MatStepper,
    MatStepperNext,
    MatStepperPrevious,
    MatStepHeader,
    MatStepperIcon,
    MatStepContent,
  ],
  providers: [MAT_STEPPER_INTL_PROVIDER, ErrorStateMatcher],
})
export class MatStepperModule {}
