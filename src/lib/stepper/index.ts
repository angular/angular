/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PortalModule} from '@angular/cdk/portal';
import {MdButtonModule} from '../button/index';
import {MdStep, MdStepper, MdHorizontalStepper, MdVerticalStepper} from './stepper';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {MdCommonModule} from '../core';
import {MdStepLabel} from './step-label';
import {MdStepperNext, MdStepperPrevious} from './stepper-button';
import {MdIconModule} from '../icon/index';
import {MdStepHeader} from './step-header';

@NgModule({
  imports: [
    MdCommonModule,
    CommonModule,
    PortalModule,
    MdButtonModule,
    CdkStepperModule,
    MdIconModule
  ],
  exports: [
    MdCommonModule,
    MdHorizontalStepper,
    MdVerticalStepper,
    MdStep,
    MdStepLabel,
    MdStepper,
    MdStepperNext,
    MdStepperPrevious,
    MdStepHeader
  ],
  declarations: [MdHorizontalStepper, MdVerticalStepper, MdStep, MdStepLabel, MdStepper,
    MdStepperNext, MdStepperPrevious, MdStepHeader],
})
export class MdStepperModule {}

export * from './step-label';
export * from './stepper';
export * from './stepper-button';
export * from './step-header';
