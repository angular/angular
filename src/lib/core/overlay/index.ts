/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {Overlay, OVERLAY_PROVIDERS} from './overlay';
export {OverlayContainer} from './overlay-container';
export {FullscreenOverlayContainer} from './fullscreen-overlay-container';
export {OverlayRef} from './overlay-ref';
export {OverlayState} from './overlay-state';
export {ConnectedOverlayDirective, OverlayOrigin, OverlayModule} from './overlay-directives';
export {ViewportRuler} from './position/viewport-ruler';

export * from './position/connected-position';
export * from './scroll/index';

// Export pre-defined position strategies and interface to build custom ones.
export {PositionStrategy} from './position/position-strategy';
export {GlobalPositionStrategy} from './position/global-position-strategy';
export {ConnectedPositionStrategy} from './position/connected-position-strategy';
