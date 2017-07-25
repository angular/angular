/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FocusTrapDirective, FocusTrapDeprecatedDirective, FocusTrapFactory} from './focus-trap';
import {LIVE_ANNOUNCER_PROVIDER} from './live-announcer';
import {InteractivityChecker} from './interactivity-checker';
import {CommonModule} from '@angular/common';
import {PlatformModule} from '@angular/cdk/platform';

@NgModule({
  imports: [CommonModule, PlatformModule],
  declarations: [FocusTrapDirective, FocusTrapDeprecatedDirective],
  exports: [FocusTrapDirective, FocusTrapDeprecatedDirective],
  providers: [InteractivityChecker, FocusTrapFactory, LIVE_ANNOUNCER_PROVIDER]
})
export class A11yModule {}

export * from './live-announcer';
export * from './fake-mousedown';
export * from './focus-trap';
export * from './interactivity-checker';
export * from './list-key-manager';
export * from './activedescendant-key-manager';
export * from './focus-key-manager';
