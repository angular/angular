import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdLineModule} from './line/line';
import {RtlModule} from './rtl/dir';
import {ObserveContentModule} from './observe-content/observe-content';
import {MdRippleModule} from './ripple/ripple';
import {PortalModule} from './portal/portal-directives';
import {OverlayModule} from './overlay/overlay-directives';
import {A11yModule, A11Y_PROVIDERS} from './a11y/index';
import {OVERLAY_PROVIDERS} from './overlay/overlay';


// RTL
export {Dir, LayoutDirection, RtlModule} from './rtl/dir';

// Mutation Observer
export {ObserveContentModule, ObserveContent} from './observe-content/observe-content';

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
  PortalModule,
} from './portal/portal-directives';
export {DomPortalHost} from './portal/dom-portal-host';

// Projection
export * from './projection/projection';

// Platform
export * from './platform/index';

/** @deprecated */
export {Platform as MdPlatform} from './platform/platform';

// Overlay
export {Overlay, OVERLAY_PROVIDERS} from './overlay/overlay';
export {OverlayContainer} from './overlay/overlay-container';
export {OverlayRef} from './overlay/overlay-ref';
export {OverlayState} from './overlay/overlay-state';
export {
  ConnectedOverlayDirective,
  OverlayOrigin,
  OverlayModule,
} from './overlay/overlay-directives';
export * from './overlay/position/connected-position-strategy';
export * from './overlay/position/connected-position';
export {ScrollDispatcher} from './overlay/scroll/scroll-dispatcher';

// Gestures
export {GestureConfig} from './gestures/gesture-config';
// Explicitly specify the interfaces which should be re-exported, because if everything
// is re-exported, module bundlers may run into issues with treeshaking.
export {HammerInput, HammerManager} from './gestures/gesture-annotations';

// Ripple
export {MdRipple, MdRippleModule} from './ripple/ripple';

// a11y
export {
  AriaLivePoliteness,
  LiveAnnouncer,
  LIVE_ANNOUNCER_ELEMENT_TOKEN,
} from './a11y/live-announcer';

/** @deprecated */
export {LiveAnnouncer as MdLiveAnnouncer} from './a11y/live-announcer';

export {FocusTrap} from './a11y/focus-trap';
export {InteractivityChecker} from './a11y/interactivity-checker';
export {isFakeMousedownFromScreenReader} from './a11y/fake-mousedown';

export {A11yModule} from './a11y/index';

export {
  UniqueSelectionDispatcher,
  UniqueSelectionDispatcherListener
} from './coordination/unique-selection-dispatcher';

/** @deprecated */
export {
  UniqueSelectionDispatcher as MdUniqueSelectionDispatcher
} from './coordination/unique-selection-dispatcher';

export {MdLineModule, MdLine, MdLineSetter} from './line/line';

// Style
export {applyCssTransform} from './style/apply-transform';

// Error
export {MdError} from './errors/error';

// Misc
export {ComponentType} from './overlay/generic-component-type';

// Keybindings
export * from './keyboard/keycodes';

export * from './compatibility/default-mode';

// Animation
export * from './animation/animation';

// Coercion
export {coerceBooleanProperty} from './coercion/boolean-property';
export {coerceNumberProperty} from './coercion/number-property';

// Compatibility
export {DefaultStyleCompatibilityModeModule} from './compatibility/default-mode';
export {NoConflictStyleCompatibilityMode} from './compatibility/no-conflict-mode';


@NgModule({
  imports: [
    MdLineModule,
    RtlModule,
    MdRippleModule,
    ObserveContentModule,
    PortalModule,
    OverlayModule,
    A11yModule,
  ],
  exports: [
    MdLineModule,
    RtlModule,
    MdRippleModule,
    ObserveContentModule,
    PortalModule,
    OverlayModule,
    A11yModule,
  ],
})
export class MdCoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdCoreModule,
      providers: [A11Y_PROVIDERS, OVERLAY_PROVIDERS],
    };
  }
}
