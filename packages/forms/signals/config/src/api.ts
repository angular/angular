/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type Injector, type Provider, type Signal} from '@angular/core';
import {SIGNAL_FORMS_CONFIG} from './di';

/**
 * The subset of field state APIs used by signal forms CSS class configuration.
 *
 * @publicApi 22.1
 */
export interface SignalFormsClassBindingState {
  /** Whether the bound field has been touched. */
  touched(): boolean;

  /** Whether the bound field is dirty. */
  dirty(): boolean;

  /** Whether the bound field is valid. */
  valid(): boolean;

  /** Whether the bound field is invalid. */
  invalid(): boolean;

  /** Whether the bound field has pending validation. */
  pending(): boolean;
}

/**
 * Represents a binding between a field and a UI control for signal forms configuration.
 *
 * @publicApi 22.1
 */
export interface SignalFormsClassBinding {
  /** The HTML element on which the binding is applied. */
  readonly element: HTMLElement;

  /** The node injector for the element hosting this field binding. */
  readonly injector: Injector;

  /** The subset of field state available to configuration callbacks. */
  readonly state: Signal<SignalFormsClassBindingState>;

  /** Focuses this field binding. */
  focus(options?: FocusOptions): void;
}

/**
 * Configuration options for signal forms.
 *
 * @publicApi 22.1
 */
export interface SignalFormsConfig {
  /** A map of CSS class names to predicate functions that determine when to apply them. */
  classes?: {
    [className: string]: (formField: SignalFormsClassBinding) => boolean;
  };
}

/**
 * Provides configuration options for signal forms.
 *
 * @publicApi 22.1
 */
export function provideSignalFormsConfig(config: SignalFormsConfig): Provider[] {
  return [{provide: SIGNAL_FORMS_CONFIG, useValue: config}];
}
