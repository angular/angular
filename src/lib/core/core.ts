/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {A11yModule} from '@angular/cdk/a11y';
import {BidiModule} from '@angular/cdk/bidi';
import {ObserversModule} from '@angular/cdk/observers';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {MdLineModule} from './line/line';
import {MdOptionModule} from './option/index';
import {MdPseudoCheckboxModule} from './selection/index';
import {MdRippleModule} from './ripple/index';

// Re-exports of the CDK to avoid breaking changes.
export {
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion';

export {
  ObserversModule,
  ObserveContent,
} from '@angular/cdk/observers';

export {
  SelectionModel
} from '@angular/cdk/collections';

// RTL
export {Dir, Direction, Directionality, BidiModule} from './bidi/index';

export * from './option/index';

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
export * from '@angular/cdk/platform';

// Overlay
export * from '@angular/cdk/overlay';

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
  InteractivityChecker,
  FocusTrap,
  FocusTrapFactory,
  FocusTrapDeprecatedDirective,
  FocusTrapDirective,
  isFakeMousedownFromScreenReader,
  A11yModule,
} from '@angular/cdk/a11y';

export {
  UniqueSelectionDispatcher,
  UniqueSelectionDispatcherListener,
  UNIQUE_SELECTION_DISPATCHER_PROVIDER,
} from './coordination/unique-selection-dispatcher';

export {MdLineModule, MdLine, MdLineSetter} from './line/line';

// Style
export * from './style/index';

// Keybindings
export * from './keyboard/keycodes';

export * from './compatibility/compatibility';

// Animation
export * from './animation/animation';

// Selection
export * from './selection/index';

// Compatibility
export {CompatibilityModule, NoConflictStyleCompatibilityMode} from './compatibility/compatibility';

// Common material module
export {MdCommonModule, MATERIAL_SANITY_CHECKS} from './common-behaviors/common-module';

// Datetime
export * from './datetime/index';

// Placeholder
export {
  FloatPlaceholderType,
  PlaceholderOptions,
  MD_PLACEHOLDER_GLOBAL_OPTIONS
} from './placeholder/placeholder-options';

// Error
export {
  ErrorStateMatcher,
  ErrorOptions,
  MD_ERROR_GLOBAL_OPTIONS,
  defaultErrorStateMatcher,
  showOnDirtyErrorStateMatcher
} from './error/error-options';

/** @deprecated */
@NgModule({
  imports: [
    MdLineModule,
    BidiModule,
    MdRippleModule,
    ObserversModule,
    PortalModule,
    OverlayModule,
    A11yModule,
    MdOptionModule,
    MdPseudoCheckboxModule,
  ],
  exports: [
    MdLineModule,
    BidiModule,
    MdRippleModule,
    ObserversModule,
    PortalModule,
    OverlayModule,
    A11yModule,
    MdOptionModule,
    MdPseudoCheckboxModule,
  ],
})
export class MdCoreModule {}
