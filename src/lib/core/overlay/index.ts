/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule, Provider} from '@angular/core';
import {Overlay} from './overlay';
import {ScrollDispatchModule} from './scroll/index';
import {PortalModule} from '../portal/portal-directives';
import {ConnectedOverlayDirective, OverlayOrigin} from './overlay-directives';
import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {VIEWPORT_RULER_PROVIDER} from './position/viewport-ruler';
import {OVERLAY_CONTAINER_PROVIDER} from './overlay-container';


export const OVERLAY_PROVIDERS: Provider[] = [
  Overlay,
  OverlayPositionBuilder,
  VIEWPORT_RULER_PROVIDER,
  OVERLAY_CONTAINER_PROVIDER,
];

@NgModule({
  imports: [PortalModule, ScrollDispatchModule],
  exports: [ConnectedOverlayDirective, OverlayOrigin, ScrollDispatchModule],
  declarations: [ConnectedOverlayDirective, OverlayOrigin],
  providers: [OVERLAY_PROVIDERS],
})
export class OverlayModule {}


export {Overlay} from './overlay';
export {OverlayContainer} from './overlay-container';
export {FullscreenOverlayContainer} from './fullscreen-overlay-container';
export {OverlayRef} from './overlay-ref';
export {OverlayState} from './overlay-state';
export {ConnectedOverlayDirective, OverlayOrigin} from './overlay-directives';
export {ViewportRuler} from './position/viewport-ruler';

export * from './position/connected-position';
export * from './scroll/index';

// Export pre-defined position strategies and interface to build custom ones.
export {PositionStrategy} from './position/position-strategy';
export {GlobalPositionStrategy} from './position/global-position-strategy';
export {ConnectedPositionStrategy} from './position/connected-position-strategy';
