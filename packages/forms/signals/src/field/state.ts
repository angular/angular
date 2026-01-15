/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal, Signal} from '@angular/core';
import type {FormField} from '../directive/form_field_directive';
import type {Debouncer, DisabledReason} from '../api/types';
import {DEBOUNCER} from './debounce';
import type {FieldNode} from './node';
import {shortCircuitTrue} from './util';

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
    this.selfTouched.set(true);
  }

  /**
   * Marks this specific field as dirty.
   */
  markAsDirty(): void {
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

  /** The {@link FormField} directives that bind this field to a UI control. */
  readonly formFieldBindings = signal<readonly FormField<unknown>[]>([]);

  constructor(private readonly node: FieldNode) {}

  /**
   * Whether this field is considered dirty.
   *
   * A field is considered dirty if one of the following is true:
   *  - It was directly dirtied and is interactive
   *  - One of its children is considered dirty
   */
  readonly dirty: Signal<boolean> = computed(() => {
    const selfDirtyValue = this.selfDirty() && !this.isNonInteractive();
    return this.node.structure.reduceChildren(
      selfDirtyValue,
      (child, value) => value || child.nodeState.dirty(),
      shortCircuitTrue,
    );
  });

  /**
   * Whether this field is considered touched.
   *
   * A field is considered touched if one of the following is true:
   *  - It was directly touched and is interactive
   *  - One of its children is considered touched
   */
  readonly touched: Signal<boolean> = computed(() => {
    const selfTouchedValue = this.selfTouched() && !this.isNonInteractive();
    return this.node.structure.reduceChildren(
      selfTouchedValue,
      (child, value) => value || child.nodeState.touched(),
      shortCircuitTrue,
    );
  });

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

  /**
   * An optional {@link Debouncer} factory for this field.
   */
  readonly debouncer: Signal<((signal: AbortSignal) => Promise<void> | void) | undefined> =
    computed(() => {
      if (this.node.logicNode.logic.hasMetadata(DEBOUNCER)) {
        const debouncerLogic = this.node.logicNode.logic.getMetadata(DEBOUNCER);
        const debouncer = debouncerLogic.compute(this.node.context);

        // Even if this field has a `debounce()` rule, it could be applied conditionally and currently
        // inactive, in which case `compute()` will return undefined.
        if (debouncer) {
          return (signal) => debouncer(this.node.context, signal);
        }
      }

      // Fallback to the parent's debouncer, if any. If there is no debouncer configured all the way
      // up to the root field, this simply returns `undefined` indicating that the operation should
      // not be debounced.
      return this.node.structure.parent?.nodeState.debouncer?.();
    });

  /** Whether this field is considered non-interactive.
   *
   * A field is considered non-interactive if one of the following is true:
   * - It is hidden
   * - It is disabled
   * - It is readonly
   */
  private readonly isNonInteractive = computed(
    () => this.hidden() || this.disabled() || this.readonly(),
  );
}
