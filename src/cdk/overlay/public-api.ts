/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './overlay-config';
export * from './position/connected-position';
export * from './scroll/index';
export * from './overlay-module';
export * from './dispatchers/index';
export {Overlay} from './overlay';
export {OverlayContainer} from './overlay-container';
export {CdkOverlayOrigin, CdkConnectedOverlay} from './overlay-directives';
export {FullscreenOverlayContainer} from './fullscreen-overlay-container';
export {OverlayRef, OverlaySizeConfig} from './overlay-ref';
export {ViewportRuler} from '@angular/cdk/scrolling';
export {ComponentType} from '@angular/cdk/portal';
export {OverlayPositionBuilder} from './position/overlay-position-builder';

// Export pre-defined position strategies and interface to build custom ones.
export {PositionStrategy} from './position/position-strategy';
export {GlobalPositionStrategy} from './position/global-position-strategy';
export {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin,
} from './position/flexible-connected-position-strategy';
