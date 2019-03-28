/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {ExampleViewerModule} from '../example-viewer/example-viewer-module';
import {ButtonToggleE2e} from './button-toggle-e2e';

@NgModule({
  imports: [
    ExampleViewerModule,
  ],
  declarations: [ButtonToggleE2e],
})
export class ButtonToggleE2eModule {
}
