/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule, Provider} from '@angular/core';
import {PortalModule} from '@angular/cdk/portal';
import {Overlay} from './overlay';
import {ScrollDispatchModule, VIEWPORT_RULER_PROVIDER} from '@angular/cdk/scrolling';
import {
  ConnectedOverlayDirective,
  MD_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
  OverlayOrigin,
} from './overlay-directives';
import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {OVERLAY_CONTAINER_PROVIDER} from './overlay-container';
import {ScrollStrategyOptions} from './scroll/scroll-strategy-options';


export const OVERLAY_PROVIDERS: Provider[] = [
  Overlay,
  OverlayPositionBuilder,
  VIEWPORT_RULER_PROVIDER,
  OVERLAY_CONTAINER_PROVIDER,
  MD_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
];

@NgModule({
  imports: [PortalModule, ScrollDispatchModule],
  exports: [ConnectedOverlayDirective, OverlayOrigin, ScrollDispatchModule],
  declarations: [ConnectedOverlayDirective, OverlayOrigin],
  providers: [OVERLAY_PROVIDERS, ScrollStrategyOptions],
})
export class OverlayModule {}


export {Overlay} from './overlay';
export {OverlayContainer} from './overlay-container';
export {FullscreenOverlayContainer} from './fullscreen-overlay-container';
export {OverlayRef} from './overlay-ref';
export {OverlayState} from './overlay-state';
export {ConnectedOverlayDirective, OverlayOrigin} from './overlay-directives';
export {ViewportRuler} from '@angular/cdk/scrolling';
export {ComponentType} from '@angular/cdk/portal';

export * from './position/connected-position';
export * from './scroll/index';

// Export pre-defined position strategies and interface to build custom ones.
export {PositionStrategy} from './position/position-strategy';
export {GlobalPositionStrategy} from './position/global-position-strategy';
export {ConnectedPositionStrategy} from './position/connected-position-strategy';
export {VIEWPORT_RULER_PROVIDER} from '@angular/cdk/scrolling';
