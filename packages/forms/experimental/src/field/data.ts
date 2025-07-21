/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, runInInjectionContext, untracked} from '@angular/core';
import {Property} from '../api/metadata';
import {FieldNode} from './node';

/**
 * Tracks property factories associated with a `FieldNode`.
 */
export class FieldPropertyState {
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
      maps.push(...child.dataState.dataMaps());
    }
    return maps;
  });

  get<D>(key: Property<D>): D | undefined {
    return this.propertyMap.get(key) as D | undefined;
  }
}
