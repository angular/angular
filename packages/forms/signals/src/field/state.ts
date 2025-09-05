/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal, Signal} from '@angular/core';
import type {Control} from '../api/control_directive';
import type {DisabledReason} from '../api/types';
import type {FieldNode} from './node';
import {reduceChildren, shortCircuitTrue} from './util';

/**
 * The non-validation and non-submit state associated with a `FieldNode`, such as touched and dirty
 * status, as well as derived logical state.
 */
export class FieldNodeState {
  /**
   * Indicates whether this field has been touched directly by the user (as opposed to indirectly by
   * touching a child field).
   *
   * A field is considered directly touched when a user stops editing it for the first time (i.e. on blur)
   */
  private readonly selfTouched = signal(false);

  /**
   * Indicates whether this field has been dirtied directly by the user (as opposed to indirectly by
   * dirtying a child field).
   *
   * A field is considered directly dirtied if a user changed the value of the field at least once.
   */
  private readonly selfDirty = signal(false);

  /**
   * Marks this specific field as touched.
   */
  markAsTouched(): void {
    // TODO: should this be noop for fields that are hidden/disabled/readonly
    this.selfTouched.set(true);
  }

  /**
   * Marks this specific field as dirty.
   */
  markAsDirty(): void {
    // TODO: should this be noop for fields that are hidden/disabled/readonly
    this.selfDirty.set(true);
  }

  /**
   * Marks this specific field as not dirty.
   */
  markAsPristine(): void {
    this.selfDirty.set(false);
  }

  /**
   * Marks this specific field as not touched.
   */
  markAsUntouched(): void {
    this.selfTouched.set(false);
  }

  /** The UI controls the field is currently bound to. */
  readonly controls = signal<readonly Control<unknown>[]>([]);

  constructor(private readonly node: FieldNode) {}

  /**
   * Whether this field is considered dirty.
   *
   * A field is considered dirty if one of the following is true:
   *  - It was directly dirtied
   *  - One of its children is considered dirty
   */
  readonly dirty: Signal<boolean> = computed(() => {
    return reduceChildren(
      this.node,
      this.selfDirty(),
      (child, value) => value || child.nodeState.dirty(),
      shortCircuitTrue,
    );
  });

  /**
   * Whether this field is considered touched.
   *
   * A field is considered touched if one of the following is true:
   *  - It was directly touched
   *  - One of its children is considered touched
   */
  readonly touched: Signal<boolean> = computed(() =>
    reduceChildren(
      this.node,
      this.selfTouched(),
      (child, value) => value || child.nodeState.touched(),
      shortCircuitTrue,
    ),
  );

  /**
   * The reasons for this field's disablement. This includes disabled reasons for any parent field
   * that may have been disabled, indirectly causing this field to be disabled as well.
   * The `field` property of the `DisabledReason` can be used to determine which field ultimately
   * caused the disablement.
   */
  readonly disabledReasons: Signal<readonly DisabledReason[]> = computed(() => [
    ...(this.node.structure.parent?.nodeState.disabledReasons() ?? []),
    ...this.node.logicNode.logic.disabledReasons.compute(this.node.context),
  ]);

  /**
   * Whether this field is considered disabled.
   *
   * A field is considered disabled if one of the following is true:
   * - The schema contains logic that directly disabled it
   * - Its parent field is considered disabled
   */
  readonly disabled: Signal<boolean> = computed(() => !!this.disabledReasons().length);

  /**
   * Whether this field is considered readonly.
   *
   * A field is considered readonly if one of the following is true:
   * - The schema contains logic that directly made it readonly
   * - Its parent field is considered readonly
   */
  readonly readonly: Signal<boolean> = computed(
    () =>
      (this.node.structure.parent?.nodeState.readonly() ||
        this.node.logicNode.logic.readonly.compute(this.node.context)) ??
      false,
  );

  /**
   * Whether this field is considered hidden.
   *
   * A field is considered hidden if one of the following is true:
   * - The schema contains logic that directly hides it
   * - Its parent field is considered hidden
   */
  readonly hidden: Signal<boolean> = computed(
    () =>
      (this.node.structure.parent?.nodeState.hidden() ||
        this.node.logicNode.logic.hidden.compute(this.node.context)) ??
      false,
  );

  readonly name: Signal<string> = computed(() => {
    const parent = this.node.structure.parent;
    if (!parent) {
      return this.node.structure.fieldManager.rootName;
    }

    return `${parent.name()}.${this.node.structure.keyInParent()}`;
  });
}
