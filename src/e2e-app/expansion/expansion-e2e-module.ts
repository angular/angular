/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {ExampleViewerModule} from '../example-viewer/example-viewer-module';
import {ExpansionE2e} from './expansion-e2e';

@NgModule({
  imports: [
    ExampleViewerModule,
  ],
  declarations: [ExpansionE2e],
})
export class ExpansionE2eModule {
}
