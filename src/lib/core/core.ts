import {NgModule} from '@angular/core';
import {MdLineModule} from './line/line';
import {RtlModule} from './rtl/dir';
import {ObserveContentModule} from './observe-content/observe-content';
import {MdOptionModule} from './option/option';
import {PortalModule} from './portal/portal-directives';
import {OverlayModule} from './overlay/overlay-directives';
import {A11yModule} from './a11y/index';
import {MdSelectionModule} from './selection/index';
import {MdRippleModule} from './ripple/index';


// RTL
export {Dir, LayoutDirection, RtlModule} from './rtl/dir';

// Mutation Observer
export {ObserveContentModule, ObserveContent} from './observe-content/observe-content';

export {MdOptionModule, MdOption, MdOptionSelectionChange} from './option/option';

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

// Platform
export * from './platform/index';

// Overlay
export * from './overlay/index';

// Gestures
export {GestureConfig} from './gestures/gesture-config';
// Explicitly specify the interfaces which should be re-exported, because if everything
// is re-exported, module bundlers may run into issues with treeshaking.
export {HammerInput, HammerManager} from './gestures/gesture-annotations';

// Ripple
export * from './ripple/index';

// a11y
export {
  AriaLivePoliteness,
  LiveAnnouncer,
  LIVE_ANNOUNCER_ELEMENT_TOKEN,
  LIVE_ANNOUNCER_PROVIDER,
} from './a11y/live-announcer';

// Selection
export * from './selection/selection';

export * from './a11y/focus-trap';
export {InteractivityChecker} from './a11y/interactivity-checker';
export {isFakeMousedownFromScreenReader} from './a11y/fake-mousedown';

export {A11yModule} from './a11y/index';

export {
  UniqueSelectionDispatcher,
  UniqueSelectionDispatcherListener,
  UNIQUE_SELECTION_DISPATCHER_PROVIDER,
} from './coordination/unique-selection-dispatcher';

export {MdLineModule, MdLine, MdLineSetter} from './line/line';

// Style
export * from './style/index';

// Misc
export {ComponentType} from './overlay/generic-component-type';

// Keybindings
export * from './keyboard/keycodes';

export * from './compatibility/compatibility';

// Animation
export * from './animation/animation';

// Selection
export * from './selection/index';

// Coercion
export {coerceBooleanProperty} from './coercion/boolean-property';
export {coerceNumberProperty} from './coercion/number-property';

// Compatibility
export {CompatibilityModule, NoConflictStyleCompatibilityMode} from './compatibility/compatibility';

// Common material module
export {MdCommonModule} from './common-behaviors/common-module';

// Datetime
export * from './datetime/index';

@NgModule({
  imports: [
    MdLineModule,
    RtlModule,
    MdRippleModule,
    ObserveContentModule,
    PortalModule,
    OverlayModule,
    A11yModule,
    MdOptionModule,
    MdSelectionModule,
  ],
  exports: [
    MdLineModule,
    RtlModule,
    MdRippleModule,
    ObserveContentModule,
    PortalModule,
    OverlayModule,
    A11yModule,
    MdOptionModule,
    MdSelectionModule,
  ],
})
export class MdCoreModule {}
