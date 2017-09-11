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

@NgModule({
  imports: [CommonModule, PlatformModule],
  declarations: [FocusTrapDirective, FocusTrapDeprecatedDirective],
  exports: [FocusTrapDirective, FocusTrapDeprecatedDirective],
  providers: [
    InteractivityChecker,
    FocusTrapFactory,
    AriaDescriber,
    LIVE_ANNOUNCER_PROVIDER,
    ARIA_DESCRIBER_PROVIDER
  ]
})
export class A11yModule {}

export * from './activedescendant-key-manager';
export * from './aria-describer';
export * from './fake-mousedown';
export * from './focus-key-manager';
export * from './focus-trap';
export * from './interactivity-checker';
export * from './list-key-manager';
export * from './live-announcer';
