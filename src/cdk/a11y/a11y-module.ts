/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FocusTrapDeprecatedDirective, FocusTrapDirective, FocusTrapFactory} from './focus-trap';
import {LIVE_ANNOUNCER_PROVIDER} from './live-announcer';
import {InteractivityChecker} from './interactivity-checker';
import {CommonModule} from '@angular/common';
import {PlatformModule} from '@angular/cdk/platform';
import {AriaDescriber, ARIA_DESCRIBER_PROVIDER} from './aria-describer';
import {CdkMonitorFocus, FOCUS_MONITOR_PROVIDER} from './focus-monitor';

@NgModule({
  imports: [CommonModule, PlatformModule],
  declarations: [FocusTrapDirective, FocusTrapDeprecatedDirective, CdkMonitorFocus],
  exports: [FocusTrapDirective, FocusTrapDeprecatedDirective, CdkMonitorFocus],
  providers: [
    InteractivityChecker,
    FocusTrapFactory,
    AriaDescriber,
    LIVE_ANNOUNCER_PROVIDER,
    ARIA_DESCRIBER_PROVIDER,
    FOCUS_MONITOR_PROVIDER,
  ]
})
export class A11yModule {}
