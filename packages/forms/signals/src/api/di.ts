/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type Provider} from '@angular/core';
import {SIGNAL_FORMS_CONFIG} from '../field/di';
import type {FormField} from '../directive/form_field_directive';
import type {FieldStateSnapshot} from './types';

/**
 * A readonly snapshot of a form field.
 *
 * @category control
 * @experimental 21.0.0
 */
export type FormFieldSnapshot = Pick<FormField<unknown>, 'element' | 'errors' | 'parseErrors'> & {
  readonly state: FieldStateSnapshot<unknown>;
};

/**
 * Configuration options for signal forms.
 *
 * @experimental 21.0.1
 */
export interface SignalFormsConfig {
  /** A map of CSS class names to predicate functions that determine when to apply them. */
  classes?: {[className: string]: (state: FormFieldSnapshot) => boolean};
}

/**
 * Provides configuration options for signal forms.
 *
 * @experimental 21.0.1
 */
export function provideSignalFormsConfig(config: SignalFormsConfig): Provider[] {
  return [{provide: SIGNAL_FORMS_CONFIG, useValue: config}];
}
