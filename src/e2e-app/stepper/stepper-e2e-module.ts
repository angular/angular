/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {ExampleViewerModule} from '../example-viewer/example-viewer-module';
import {StepperE2e} from './stepper-e2e';

@NgModule({
  imports: [
    ExampleViewerModule,
  ],
  declarations: [StepperE2e],
})
export class StepperE2eModule {
}
