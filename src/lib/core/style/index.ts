/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkMonitorFocus, FOCUS_ORIGIN_MONITOR_PROVIDER} from './focus-origin-monitor';
import {PlatformModule} from '../platform/index';


@NgModule({
  imports: [PlatformModule],
  declarations: [CdkMonitorFocus],
  exports: [CdkMonitorFocus],
  providers: [FOCUS_ORIGIN_MONITOR_PROVIDER],
})
export class StyleModule {}


export * from './focus-origin-monitor';
export * from './apply-transform';
