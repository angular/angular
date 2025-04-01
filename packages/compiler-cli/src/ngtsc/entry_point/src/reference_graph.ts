/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DeclarationNode} from '../../reflection';

export class ReferenceGraph<T = DeclarationNode> {
  private references = new Map<T, Set<T>>();

  add(from: T, to: T): void {
    if (!this.references.has(from)) {
      this.references.set(from, new Set());
    }
    this.references.get(from)!.add(to);
  }

  transitiveReferencesOf(target: T): Set<T> {
    const set = new Set<T>();
    this.collectTransitiveReferences(set, target);
    return set;
  }

  pathFrom(source: T, target: T): T[] | null {
    return this.collectPathFrom(source, target, new Set());
  }

  private collectPathFrom(source: T, target: T, seen: Set<T>): T[] | null {
    if (source === target) {
      // Looking for a path from the target to itself - that path is just the target. This is the
      // "base case" of the search.
      return [target];
    } else if (seen.has(source)) {
      // The search has already looked through this source before.
      return null;
    }
    // Consider outgoing edges from `source`.
    seen.add(source);

    if (!this.references.has(source)) {
      // There are no outgoing edges from `source`.
      return null;
    } else {
      // Look through the outgoing edges of `source`.
      // TODO(alxhub): use proper iteration when the legacy build is removed. (#27762)
      let candidatePath: T[] | null = null;
      this.references.get(source)!.forEach((edge) => {
        // Early exit if a path has already been found.
        if (candidatePath !== null) {
          return;
        }
        // Look for a path from this outgoing edge to `target`.
        const partialPath = this.collectPathFrom(edge, target, seen);
        if (partialPath !== null) {
          // A path exists from `edge` to `target`. Insert `source` at the beginning.
          candidatePath = [source, ...partialPath];
        }
      });

      return candidatePath;
    }
  }

  private collectTransitiveReferences(set: Set<T>, decl: T): void {
    if (this.references.has(decl)) {
      // TODO(alxhub): use proper iteration when the legacy build is removed. (#27762)
      this.references.get(decl)!.forEach((ref) => {
        if (!set.has(ref)) {
          set.add(ref);
          this.collectTransitiveReferences(set, ref);
        }
      });
    }
  }
}
