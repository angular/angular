/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, signal, Signal} from '@angular/core';
import type {DisabledReason} from '../api/types';
import type {FieldNode} from './node';
import {reduceChildren, shortCircuitTrue} from './util';

/**
 * State associated with a `FieldNode`, such as touched and dirty status, as well as derived logical
 * state.
 */
export class FieldNodeState {
  /**
   * Field is considered touched when a user stops editing it for the first time (is our case on blur)
   */
  readonly selfTouched = signal(false);
  /**
   * Field is considered dirty if a user changed the value of the field at least once.
   */
  readonly selfDirty = signal(false);

  constructor(private readonly node: FieldNode) {}

  /**
   * A field is dirty if the user changed the value of the field, or any of
   * its children through UI.
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
   * This field considers itself touched if one of the following are true:
   *  - it was directly touched
   *  - one of its children is considered touched
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
   * The reasons for this field's disablement.
   */
  readonly disabledReasons: Signal<readonly DisabledReason[]> = computed(() => [
    ...(this.node.structure.parent?.nodeState.disabledReasons() ?? []),
    ...this.node.logicNode.logic.disabledReasons.compute(this.node.context),
  ]);

  /**
   * Whether this field is considered disabled.
   *
   * This field considers itself disabled if its parent is disabled or its own logic considers it
   * disabled.
   */
  readonly disabled: Signal<boolean> = computed(() => !!this.disabledReasons().length);

  /**
   * Whether this field is considered readonly.
   *
   * This field considers itself readonly if its parent is readonly or its own logic considers it
   * readonly.
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
   * This field considers itself hidden if its parent is hidden or its own logic considers it
   * hidden.
   */
  readonly hidden: Signal<boolean> = computed(
    () =>
      (this.node.structure.parent?.nodeState.hidden() ||
        this.node.logicNode.logic.hidden.compute(this.node.context)) ??
      false,
  );
}
