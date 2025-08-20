/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, runInInjectionContext, Signal, untracked} from '@angular/core';
import {AggregateProperty, Property} from '../api/property';
import type {FieldNode} from './node';
import {cast} from './util';

/**
 * Tracks custom properties associated with a `FieldNode`.
 */
export class FieldPropertyState {
  /** A map of all `Property` and `AggregateProperty` that have been defined for this field. */
  private readonly properties = new Map<
    Property<unknown> | AggregateProperty<unknown, unknown>,
    unknown
  >();

  constructor(private readonly node: FieldNode) {
    // Field nodes (and thus their property state) are created in a linkedSignal in order to mirror
    // the structure of the model data. We need to run the property factories untracked so that they
    // do not cause recomputation of the linkedSignal.
    untracked(() =>
      // Property factories are run in the form's injection context so they can create resources
      // and inject DI dependencies.
      runInInjectionContext(this.node.structure.injector, () => {
        for (const [key, factory] of this.node.logicNode.logic.getPropertyFactoryEntries()) {
          this.properties.set(key, factory(this.node.context));
        }
      }),
    );
  }

  /** Gets the value of a `Property` or `AggregateProperty` for the field. */
  get<T>(prop: Property<T> | AggregateProperty<T, unknown>): T | undefined | Signal<T> {
    if (prop instanceof Property) {
      return this.properties.get(prop) as T | undefined;
    }
    // Aggregate properties come with an initial value, and are considered to exist for every field.
    // If no logic explicitly contributes values for the property, it is just considered to be the
    // initial value. Therefore if the user asks for an aggregate property for a field,
    // we just create its computed on the fly.
    cast<AggregateProperty<unknown, unknown>>(prop);
    if (!this.properties.has(prop)) {
      const logic = this.node.logicNode.logic.getAggregateProperty(prop);
      const result = computed(() => logic.compute(this.node.context));
      this.properties.set(prop, result);
    }
    return this.properties.get(prop)! as Signal<T>;
  }

  /**
   * Checks whether the current property state has the given property.
   * @param prop
   * @returns
   */
  has(prop: Property<unknown> | AggregateProperty<unknown, unknown>): boolean {
    if (prop instanceof AggregateProperty) {
      // For aggregate properties, they get added to the map lazily, on first access, so we can't
      // rely on checking presence in the properties map. Instead we check if there is any logic for
      // the given property.
      return this.node.logicNode.logic.hasAggregateProperty(prop);
    } else {
      // Non-aggregate proeprties get added to our properties map on construction, so we can just
      // refer to their presence in the map.
      return this.properties.has(prop);
    }
  }
}
