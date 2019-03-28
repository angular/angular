/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ScrollingModule} from '@angular/cdk/scrolling';
import {NgModule} from '@angular/core';
import {BlockScrollStrategyE2E} from './block-scroll-strategy-e2e';

@NgModule({
  imports: [ScrollingModule],
  declarations: [BlockScrollStrategyE2E],
})
export class BlockScrollStrategyE2eModule {
}
