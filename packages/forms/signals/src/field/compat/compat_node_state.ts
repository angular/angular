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
import {CompatFieldNode, getControlEventsSignal, getControlStatusSignal} from './compat_field_node';
import {CompatFieldNodeOptions} from './compat_structure';

/**
 * A FieldNodeState class wrapping a FormControl and proxying it's state.
 */
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
    this.touched = getControlEventsSignal(options, (c) => c.touched);
    this.dirty = getControlEventsSignal(options, (c) => c.dirty);
    const controlDisabled = getControlStatusSignal(options, (c) => c.disabled);

    this.disabled = computed(() => {
      return controlDisabled() || this.disabledReasons().length > 0;
    });
  }

  override markAsDirty() {
    this.control().markAsDirty();
  }

  override markAsTouched() {
    this.control().markAsTouched();
  }

  override markAsPristine() {
    this.control().markAsPristine();
  }

  override markAsUntouched() {
    this.control().markAsUntouched();
  }
}
