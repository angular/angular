export {Overlay, OVERLAY_PROVIDERS} from './overlay';
export {OverlayContainer} from './overlay-container';
export {FullscreenOverlayContainer} from './fullscreen-overlay-container';
export {OverlayRef} from './overlay-ref';
export {OverlayState} from './overlay-state';
export {ConnectedOverlayDirective, OverlayOrigin, OverlayModule} from './overlay-directives';
export {ScrollDispatcher} from './scroll/scroll-dispatcher';

export * from './position/connected-position';

// Export pre-defined position strategies and interface to build custom ones.
export {PositionStrategy} from './position/position-strategy';
export {GlobalPositionStrategy} from './position/global-position-strategy';
export {ConnectedPositionStrategy} from './position/connected-position-strategy';

// Export pre-defined scroll strategies and interface to build custom ones.
export {ScrollStrategy} from './scroll/scroll-strategy';
export {RepositionScrollStrategy} from './scroll/reposition-scroll-strategy';
export {CloseScrollStrategy} from './scroll/close-scroll-strategy';
export {NoopScrollStrategy} from './scroll/noop-scroll-strategy';
