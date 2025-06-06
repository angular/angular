/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, runInInjectionContext, untracked} from '@angular/core';
import {DataKey} from '../api/data';
import {FieldNode} from './node';

/**
 * Tracks `data` associated with a `FieldNode`.
 */
export class FieldDataState {
  private readonly dataMap = new Map<DataKey<unknown>, unknown>();

  constructor(private readonly node: FieldNode) {
    // Instantiate data dependencies.
    if (this.node.logic.dataFactories.size === 0) {
      return;
    }
    untracked(() =>
      runInInjectionContext(this.node.structure.injector, () => {
        for (const [key, factory] of this.node.logic.dataFactories) {
          this.dataMap.set(key, factory(this.node.context));
        }
      }),
    );
  }

  private readonly dataMaps = computed(() => {
    const maps = [this.dataMap];
    for (const child of this.node.structure.childrenMap()?.values() ?? []) {
      maps.push(...child.dataState.dataMaps());
    }
    return maps;
  });

  get<D>(key: DataKey<D>): D | undefined {
    return this.dataMap.get(key) as D | undefined;
  }
}
