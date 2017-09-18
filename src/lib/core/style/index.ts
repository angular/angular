/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {A11yModule} from '@angular/cdk/a11y';

/** @deprecated */
@NgModule({
  imports: [A11yModule],
  exports: [A11yModule],
})
export class StyleModule {}

export {
  CdkMonitorFocus,
  FocusMonitor,
  FOCUS_MONITOR_PROVIDER,
  FocusOrigin,
} from '@angular/cdk/a11y';
export * from './apply-transform';
