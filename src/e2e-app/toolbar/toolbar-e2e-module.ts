/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {ExampleViewerModule} from '../example-viewer/example-viewer-module';
import {ToolbarE2e} from './toolbar-e2e';

@NgModule({
  imports: [
    ExampleViewerModule,
  ],
  declarations: [ToolbarE2e],
})
export class ToolbarE2eModule {
}
