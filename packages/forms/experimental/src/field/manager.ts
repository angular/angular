/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {effect, Injector, untracked} from '@angular/core';
import type {FieldNodeStructure} from './structure';

/**
 * Manages the collection of fields associated with a given `form`.
 *
 * Fields are created implicitly, through reactivity, and may create "owned" entities like effects
 * or resources. When a field is no longer connected to the form, these owned entities should be
 * destroyed, which is the job of the `FormFieldManager`.
 */
export class FormFieldManager {
  constructor(readonly injector: Injector) {}

  readonly structures = new Set<FieldNodeStructure>();

  createFieldManagementEffect(root: FieldNodeStructure): void {
    effect(
      () => {
        const liveStructures = new Set<FieldNodeStructure>();
        this.markStructuresLive(root, liveStructures);

        // Destroy all nodes that are no longer live.
        for (const structure of this.structures) {
          if (!liveStructures.has(structure)) {
            this.structures.delete(structure);
            untracked(() => structure.destroy());
          }
        }
      },
      {injector: this.injector},
    );
  }

  private markStructuresLive(
    structure: FieldNodeStructure,
    liveStructures: Set<FieldNodeStructure>,
  ): void {
    liveStructures.add(structure);
    for (const child of structure.children()) {
      this.markStructuresLive(child.structure, liveStructures);
    }
  }
}
