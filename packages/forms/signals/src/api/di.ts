/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type Provider} from '@angular/core';
import type {FormFieldBinding} from '../api/types';
import {SIGNAL_FORMS_CONFIG} from '../field/di';

/**
 * Configuration options for signal forms.
 *
 * @see [Automatic status classes](guide/forms/signals/migration#automatic-status-classes)
 *
 * @publicApi 22.0
 */
export interface SignalFormsConfig {
  /** A map of CSS class names to predicate functions that determine when to apply them. */
  classes?: {
    [className: string]: (formField: FormFieldBinding) => boolean;
  };

  /**
   * When `true`, validation runs for all disabled fields globally, regardless of whether
   * individual `disabled()` rules have `validate` set. Can be overridden per form via
   * `FormOptions.validateDisabledFields`.
   *
   * Defaults to `false`.
   */
  validateDisabledFields?: boolean;

  /**
   * When `true`, validation runs for all readonly fields globally, regardless of whether
   * individual `readonly()` rules have `validate` set. Can be overridden per form via
   * `FormOptions.validateReadonlyFields`.
   *
   * Defaults to `false`.
   */
  validateReadonlyFields?: boolean;

  /**
   * When `true`, validation runs for all hidden fields globally, regardless of whether
   * individual `hidden()` rules have `validate` set. Can be overridden per form via
   * `FormOptions.validateHiddenFields`.
   *
   * Defaults to `false`.
   */
  validateHiddenFields?: boolean;
}

/**
 * Provides configuration options for signal forms.
 *
 * @see [Automatic status classes](guide/forms/signals/migration#automatic-status-classes)
 *
 * @publicApi 22.0
 */
export function provideSignalFormsConfig(config: SignalFormsConfig): Provider[] {
  return [{provide: SIGNAL_FORMS_CONFIG, useValue: config}];
}
