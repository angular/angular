/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollDispatchModule, VIEWPORT_RULER_PROVIDER} from '@angular/cdk/scrolling';
import {NgModule, Provider} from '@angular/core';
import {Overlay} from './overlay';
import {OVERLAY_CONTAINER_PROVIDER} from './overlay-container';
import {
  CdkConnectedOverlay,
  CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
  CdkOverlayOrigin,
} from './overlay-directives';
import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {OVERLAY_KEYBOARD_DISPATCHER_PROVIDER} from './keyboard/overlay-keyboard-dispatcher';
import {ScrollStrategyOptions} from './scroll/scroll-strategy-options';

export const OVERLAY_PROVIDERS: Provider[] = [
  Overlay,
  OverlayPositionBuilder,
  OVERLAY_KEYBOARD_DISPATCHER_PROVIDER,
  VIEWPORT_RULER_PROVIDER,
  OVERLAY_CONTAINER_PROVIDER,
  CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
];

@NgModule({
  imports: [BidiModule, PortalModule, ScrollDispatchModule],
  exports: [CdkConnectedOverlay, CdkOverlayOrigin, ScrollDispatchModule],
  declarations: [CdkConnectedOverlay, CdkOverlayOrigin],
  providers: [OVERLAY_PROVIDERS, ScrollStrategyOptions],
})
export class OverlayModule {}
