/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, runInInjectionContext, Signal, untracked} from '@angular/core';
import {AggregateProperty, Property} from '../api/property';
import {FieldNode} from './node';
import {cast} from './util';

/**
 * Tracks custom properties associated with a `FieldNode`.
 */
export class FieldPropertyState {
  private readonly aggregatePropertyMap = new Map<
    AggregateProperty<unknown, unknown>,
    Signal<unknown>
  >();
  private readonly propertyMap = new Map<Property<unknown>, unknown>();

  constructor(private readonly node: FieldNode) {
    // Instantiate data dependencies.
    if (!this.node.logicNode.logic.hasData()) {
      return;
    }
    untracked(() =>
      runInInjectionContext(this.node.structure.injector, () => {
        for (const [key, factory] of this.node.logicNode.logic.getPropertyFactoryEntries()) {
          this.propertyMap.set(key, factory(this.node.context));
        }
      }),
    );
  }

  private readonly dataMaps = computed(() => {
    const maps = [this.propertyMap];
    for (const child of this.node.structure.childrenMap()?.values() ?? []) {
      maps.push(...child.propertyState.dataMaps());
    }
    return maps;
  });

  get<T>(prop: Property<T> | AggregateProperty<T, unknown>): T | undefined | Signal<T> {
    if (prop instanceof Property) {
      return this.propertyMap.get(prop) as T | undefined;
    }
    cast<AggregateProperty<unknown, unknown>>(prop);
    if (!this.aggregatePropertyMap.has(prop)) {
      const logic = this.node.logicNode.logic.getAggregateProperty(prop);
      const result = computed(() => logic.compute(this.node.context));
      this.aggregatePropertyMap.set(prop, result);
    }
    return this.aggregatePropertyMap.get(prop)! as Signal<T>;
  }
}
