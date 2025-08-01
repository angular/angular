/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldNodeState} from '../state';
import {computed, Signal} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {CompatFieldNode, getControlStatusSignal} from './compat_field_node';
import {CompatFieldNodeOptions} from './compat_structure';

export class CompatNodeState extends FieldNodeState {
  override readonly touched;
  override readonly dirty;
  override readonly disabled: Signal<boolean>;
  private readonly control: Signal<AbstractControl>;

  constructor(
    readonly compatNode: CompatFieldNode,
    options: CompatFieldNodeOptions,
  ) {
    super(compatNode);
    this.control = options.control;
    this.touched = getControlStatusSignal(options, (c) => c.touched);
    this.dirty = getControlStatusSignal(options, (c) => c.dirty);
    const controlDisabled = getControlStatusSignal(options, (c) => c.disabled);

    this.disabled = computed(() => {
      return controlDisabled() || this.disabledReasons().length > 0;
    });
  }

  override markAsDirty() {
    const control = this.control();
    control.markAsDirty();
    control.updateValueAndValidity();
  }

  override markAsTouched() {
    const control = this.control();
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  override markAsPristine() {
    const control = this.control();
    control.markAsPristine();
    control.updateValueAndValidity();
  }

  override markAsUntouched() {
    const control = this.control();
    control.markAsUntouched();
    control.updateValueAndValidity();
  }
}
