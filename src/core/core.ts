// RTL
export {Dir, LayoutDirection} from './rtl/dir';

// Portals
export {
  Portal,
  PortalHost,
  BasePortalHost,
  ComponentPortal,
  TemplatePortal
} from './portal/portal';
export {
  PortalHostDirective,
  TemplatePortalDirective,
  PORTAL_DIRECTIVES
} from './portal/portal-directives';
export {DomPortalHost} from './portal/dom-portal-host';

// Overlay
export {Overlay, OVERLAY_CONTAINER_TOKEN, OVERLAY_PROVIDERS} from './overlay/overlay';
export {OverlayRef} from './overlay/overlay-ref';
export {OverlayState} from './overlay/overlay-state';
export {
  ConnectedOverlayDirective,
  OverlayOrigin,
  OVERLAY_DIRECTIVES
} from './overlay/overlay-directives';

// Gestures
export {MdGestureConfig} from './gestures/MdGestureConfig';

// a11y
export {
  AriaLivePoliteness,
  MdLiveAnnouncer,
  LIVE_ANNOUNCER_ELEMENT_TOKEN
} from './a11y/live-announcer';
