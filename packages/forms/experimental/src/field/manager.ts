/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {APP_ID, effect, inject, Injector, untracked} from '@angular/core';
import type {FieldNodeStructure} from './structure';

/**
 * Manages the collection of fields associated with a given `form`.
 *
 * Fields are created implicitly, through reactivity, and may create "owned" entities like effects
 * or resources. When a field is no longer connected to the form, these owned entities should be
 * destroyed, which is the job of the `FormFieldManager`.
 */
export class FormFieldManager {
  readonly rootName: string;
  constructor(
    readonly injector: Injector,
    rootName: string | undefined,
  ) {
    this.rootName = rootName ?? `${this.injector.get(APP_ID)}.form${nextFormId++}`;
  }

  /**
   * Contains all child field structures that have been created as part of the current form.
   * New child structures are automatically added when they are created.
   * Structures are destroyed and removed when they are no longer reachable from the root.
   */
  readonly structures = new Set<FieldNodeStructure>();

  /**
   * Creates an effect that runs when the form's structure changes and checks for structures that
   * have become unreachable to clean up.
   *
   * For example, consider a form wrapped around the following model: `signal([0, 1, 2])`.
   * This form would have 4 nodes as part of its structure tree.
   * One structure for the root array, and one structure for each element of the array.
   * Now imagine the data is updated: `model.set([0])`. In this case the structure for the first
   * element can still be reached from the root, but the structures for the second and third
   * elements are now orphaned and not connected to the root. Thus they will be destroyed.
   *
   * @param root The root field structure.
   */
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

  /**
   * Collects all structures reachable from the given structure into the given set.
   *
   * @param structure The root structure
   * @param liveStructures The set of reachable structures to populate
   */
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

let nextFormId = 0;
