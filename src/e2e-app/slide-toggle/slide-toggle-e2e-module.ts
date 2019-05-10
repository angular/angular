/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {SlideToggleE2E} from './slide-toggle-e2e';

@NgModule({
  imports: [MatSlideToggleModule],
  declarations: [SlideToggleE2E],
})
export class SlideToggleE2eModule {
}
