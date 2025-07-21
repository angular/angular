/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal} from '@angular/core';
import type {AggregateProperty} from '../api/metadata';
import type {FieldNode} from './node';
import {cast} from './util';

/**
 * Tracks aggregate properties associated with a `FieldNode`.
 */
export class FieldAggregatePropertyState {
  private readonly propertyMap = new Map<AggregateProperty<unknown, unknown>, Signal<unknown>>();

  constructor(private readonly node: FieldNode) {}

  get<M>(key: AggregateProperty<M, unknown>): Signal<M> {
    cast<AggregateProperty<unknown, unknown>>(key);
    if (!this.propertyMap.has(key)) {
      const logic = this.node.logicNode.logic.getAggregateProperty(key);
      const result = computed(() => logic.compute(this.node.context));
      this.propertyMap.set(key, result);
    }
    return this.propertyMap.get(key)! as Signal<M>;
  }
}
