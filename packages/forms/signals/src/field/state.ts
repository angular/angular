/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal, Signal, WritableSignal} from '@angular/core';
import type {FormField} from '../directive/form_field';
import type {Debouncer, DisabledReason} from '../api/types';
import {DEBOUNCER} from './debounce';
import type {FieldNode} from './node';
import {shallowArrayEquals} from '../util/array';
import {shortCircuitTrue} from './util';
import {formDebugObj} from '../util/debug';

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
  private readonly selfTouched: WritableSignal<boolean>;

  /**
   * Indicates whether this field has been dirtied directly by the user (as opposed to indirectly by
   * dirtying a child field).
   *
   * A field is considered directly dirtied if a user changed the value of the field at least once.
   */
  private readonly selfDirty: WritableSignal<boolean>;

  /** The {@link FormField} directives that bind this field to a UI control. */
  readonly formFieldBindings: WritableSignal<readonly FormField<unknown>[]>;

  /**
   * Whether this field is considered dirty.
   *
   * A field is considered dirty if one of the following is true:
   *  - It was directly dirtied and is interactive
   *  - One of its children is considered dirty
   */
  readonly dirty: Signal<boolean>;

  /**
   * Whether this field is considered touched.
   *
   * A field is considered touched if one of the following is true:
   *  - It was directly touched and is interactive
   *  - One of its children is considered touched
   */
  readonly touched: Signal<boolean>;

  /**
   * The reasons for this field's disablement. This includes disabled reasons for any parent field
   * that may have been disabled, indirectly causing this field to be disabled as well.
   * The `field` property of the `DisabledReason` can be used to determine which field ultimately
   * caused the disablement.
   */
  readonly disabledReasons: Signal<readonly DisabledReason[]>;

  /**
   * Whether this field is considered disabled.
   *
   * A field is considered disabled if one of the following is true:
   * - The schema contains logic that directly disabled it
   * - Its parent field is considered disabled
   */
  readonly disabled: Signal<boolean>;

  /**
   * Whether this field is considered readonly.
   *
   * A field is considered readonly if one of the following is true:
   * - The schema contains logic that directly made it readonly
   * - Its parent field is considered readonly
   */
  readonly readonly: Signal<boolean>;

  /**
   * Whether this field is considered hidden.
   *
   * A field is considered hidden if one of the following is true:
   * - The schema contains logic that directly hides it
   * - Its parent field is considered hidden
   */
  readonly hidden: Signal<boolean>;

  readonly name: Signal<string>;

  /**
   * An optional {@link Debouncer} factory for this field.
   */
  readonly debouncer: Signal<((signal: AbortSignal) => Promise<void> | void) | undefined>;

  /** Whether this field is considered non-interactive.
   *
   * A field is considered non-interactive if one of the following is true:
   * - It is hidden
   * - It is disabled
   * - It is readonly
   */
  private readonly isNonInteractive: Signal<boolean>;

  constructor(node: FieldNode) {
    this.selfTouched = signal(
      false,
      ngDevMode ? formDebugObj(node.debugName, 'selfTouched') : undefined,
    );

    this.selfDirty = signal(
      false,
      ngDevMode ? formDebugObj(node.debugName, 'selfDirty') : undefined,
    );

    this.formFieldBindings = signal<readonly FormField<unknown>[]>(
      [],
      ngDevMode ? formDebugObj(node.debugName, 'formFieldBindings') : undefined,
    );

    this.dirty = computed(
      () => {
        const selfDirtyValue = this.selfDirty() && !this.isNonInteractive();
        return node.structure.reduceChildren(
          selfDirtyValue,
          (child, value) => value || child.nodeState.dirty(),
          shortCircuitTrue,
        );
      },
      ngDevMode ? formDebugObj(node.debugName, 'dirty') : undefined,
    );

    this.touched = computed(
      () => {
        const selfTouchedValue = this.selfTouched() && !this.isNonInteractive();
        return node.structure.reduceChildren(
          selfTouchedValue,
          (child, value) => value || child.nodeState.touched(),
          shortCircuitTrue,
        );
      },
      ngDevMode ? formDebugObj(node.debugName, 'touched') : undefined,
    );

    this.disabledReasons = computed(
      () => [
        ...(node.structure.parent?.nodeState.disabledReasons() ?? []),
        ...node.logicNode.logic.disabledReasons.compute(node.context),
      ],
      {
        equal: shallowArrayEquals,
        ...(ngDevMode ? formDebugObj(node.debugName, 'disabledReasons') : undefined),
      },
    );

    this.disabled = computed(
      () => !!this.disabledReasons().length,
      ngDevMode ? formDebugObj(node.debugName, 'disabled') : undefined,
    );

    this.readonly = computed(
      () =>
        (node.structure.parent?.nodeState.readonly() ||
          node.logicNode.logic.readonly.compute(node.context)) ??
        false,
      ngDevMode ? formDebugObj(node.debugName, 'readonly') : undefined,
    );

    this.hidden = computed(
      () =>
        (node.structure.parent?.nodeState.hidden() ||
          node.logicNode.logic.hidden.compute(node.context)) ??
        false,
      ngDevMode ? formDebugObj(node.debugName, 'hidden') : undefined,
    );

    this.name = computed(
      () => {
        const parent = node.structure.parent;
        if (!parent) {
          return node.structure.fieldManager.rootName;
        }

        return `${parent.name()}.${node.structure.keyInParent()}`;
      },
      ngDevMode ? formDebugObj(node.debugName, 'name') : undefined,
    );

    this.debouncer = computed(
      () => {
        if (node.logicNode.logic.hasMetadata(DEBOUNCER)) {
          const debouncerLogic = node.logicNode.logic.getMetadata(DEBOUNCER);
          const debouncer = debouncerLogic.compute(node.context);

          // Even if this field has a `debounce()` rule, it could be applied conditionally and currently
          // inactive, in which case `compute()` will return undefined.
          if (debouncer) {
            return (signal) => debouncer(node.context, signal);
          }
        }

        // Fallback to the parent's debouncer, if any. If there is no debouncer configured all the way
        // up to the root field, this simply returns `undefined` indicating that the operation should
        // not be debounced.
        return node.structure.parent?.nodeState.debouncer?.();
      },
      ngDevMode ? formDebugObj(node.debugName, 'debouncer') : undefined,
    );

    this.isNonInteractive = computed(
      () => this.hidden() || this.disabled() || this.readonly(),
      ngDevMode ? formDebugObj(node.debugName, 'isNonInteractive') : undefined,
    );
  }

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
}
