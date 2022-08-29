/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatLegacySlideToggleModule} from '@angular/material/legacy-slide-toggle';
import {LegacySlideToggleE2e} from './legacy-slide-toggle-e2e';

@NgModule({
  imports: [MatLegacySlideToggleModule],
  declarations: [LegacySlideToggleE2e],
})
export class LegacySlideToggleE2eModule {}
