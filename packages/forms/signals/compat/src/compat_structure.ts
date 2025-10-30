/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal, signal, WritableSignal} from '@angular/core';
import {FormFieldManager} from '../../src/field/manager';
import {FieldNode, ParentFieldNode} from '../../src/field/node';
import {
  ChildFieldNodeOptions,
  FieldNodeOptions,
  FieldNodeStructure,
  RootFieldNodeOptions,
} from '../../src/field/structure';

import {toSignal} from '@angular/core/rxjs-interop';
import {AbstractControl} from '@angular/forms';
import {extractControlPropToSignal} from './compat_field_node';
import {takeUntil} from 'rxjs/operators';

/**
 * Child Field Node options also exposing control property.
 */
export interface CompatChildFieldNodeOptions extends ChildFieldNodeOptions {
  control: Signal<AbstractControl>;
}

/**
 * Root Field Node options also exposing control property.
 */
export interface CompatRootFieldNodeOptions extends RootFieldNodeOptions {
  control: Signal<AbstractControl>;
}

/**
 * Field Node options also exposing control property.
 */
export type CompatFieldNodeOptions = CompatRootFieldNodeOptions | CompatChildFieldNodeOptions;

/**
 * A helper function allowing to get parent if it exists.
 */
function getParentFromOptions(options: FieldNodeOptions) {
  if (options.kind === 'root') {
    return undefined;
  }

  return options.parent;
}

/**
 * A helper function allowing to get fieldManager regardless of the option type.
 */
function getFieldManagerFromOptions(options: FieldNodeOptions) {
  if (options.kind === 'root') {
    return options.fieldManager;
  }

  return options.parent.structure.root.structure.fieldManager;
}

/**
 * A helper function that takes CompatFieldNodeOptions, and produce a writable signal synced to the
 * value of contained AbstractControl.
 *
 * This uses toSignal, which requires an injector.
 *
 * @param options
 */
function getControlValueSignal<T>(options: CompatFieldNodeOptions) {
  const value = extractControlPropToSignal<T>(options, (control, destroy$) => {
    return toSignal(control.valueChanges.pipe(takeUntil(destroy$)), {
      initialValue: control.value,
    });
  }) as WritableSignal<T>;

  value.set = (value: T) => {
    options.control().setValue(value);
  };

  value.update = (fn: (current: T) => T) => {
    value.set(fn(value()));
  };

  return value;
}

/**
 * Compat version of FieldNodeStructure,
 * - It has no children
 * - It wraps FormControl and proxies it's value.
 */
export class CompatStructure extends FieldNodeStructure {
  override value: WritableSignal<unknown>;
  override keyInParent: Signal<string> = (() => {
    throw new Error('Compat nodes do not use keyInParent.');
  }) as unknown as Signal<string>;
  override root: FieldNode;
  override pathKeys: Signal<readonly PropertyKey[]>;
  override readonly children = signal([]);
  override readonly childrenMap = signal(undefined);
  override readonly parent: ParentFieldNode | undefined;
  override readonly fieldManager: FormFieldManager;

  constructor(node: FieldNode, options: CompatFieldNodeOptions) {
    super(options.logic);
    this.value = getControlValueSignal(options);
    this.parent = getParentFromOptions(options);
    this.root = this.parent?.structure.root ?? node;
    this.fieldManager = getFieldManagerFromOptions(options);
    this.pathKeys = computed(() =>
      this.parent ? [...this.parent.structure.pathKeys(), this.keyInParent()] : [],
    );
  }

  override getChild(): FieldNode | undefined {
    return undefined;
  }
}
