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
export {Overlay} from './overlay';
export {OverlayContainer} from './overlay-container';
export {CdkOverlayOrigin, CdkConnectedOverlay} from './overlay-directives';
export {FullscreenOverlayContainer} from './fullscreen-overlay-container';
export {OverlayRef} from './overlay-ref';
export {ViewportRuler} from '@angular/cdk/scrolling';
export {ComponentType} from '@angular/cdk/portal';
export {OverlayKeyboardDispatcher} from './keyboard/overlay-keyboard-dispatcher';

// Export pre-defined position strategies and interface to build custom ones.
export {PositionStrategy} from './position/position-strategy';
export {GlobalPositionStrategy} from './position/global-position-strategy';
export {ConnectedPositionStrategy} from './position/connected-position-strategy';
export {VIEWPORT_RULER_PROVIDER} from '@angular/cdk/scrolling';

/** @deprecated Use CdkConnectedOverlay */
export {CdkConnectedOverlay as ConnectedOverlayDirective} from './overlay-directives';

/** @deprecated Use CdkOverlayOrigin */
export {CdkOverlayOrigin as OverlayOrigin} from './overlay-directives';
