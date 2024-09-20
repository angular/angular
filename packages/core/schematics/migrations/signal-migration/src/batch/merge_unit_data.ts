/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InputIncompatibilityReason} from '../input_detection/incompatibility';
import {GraphNode, topologicalSort} from '../utils/inheritance_sort';
import {CompilationUnitData, IncompatibilityType} from './unit_data';

type InputData = {key: string; info: CompilationUnitData['knownInputs'][string]};

/** Merges a list of compilation units into a combined unit. */
export function mergeCompilationUnitData(
  metadataFiles: CompilationUnitData[],
): CompilationUnitData {
  const result: CompilationUnitData = {
    knownInputs: {},
  };

  const idToGraphNode = new Map<string, GraphNode<InputData>>();
  const inheritanceGraph: GraphNode<InputData>[] = [];

  for (const file of metadataFiles) {
    for (const [key, info] of Object.entries(file.knownInputs)) {
      const existing = result.knownInputs[key];
      if (existing === undefined) {
        result.knownInputs[key] = info;
        const node: GraphNode<InputData> = {
          incoming: new Set(),
          outgoing: new Set(),
          data: {info, key},
        };
        inheritanceGraph.push(node);
        idToGraphNode.set(key, node);
        continue;
      }

      if (existing.isIncompatible === null && info.isIncompatible) {
        // input might not be incompatible in one target, but others might invalidate it.
        // merge the incompatibility state.
        existing.isIncompatible = info.isIncompatible;
      }
      if (existing.extendsFrom === null && info.extendsFrom !== null) {
        existing.extendsFrom = info.extendsFrom;
      }
      if (!existing.seenAsSourceInput && info.seenAsSourceInput) {
        existing.seenAsSourceInput = true;
      }
    }
  }

  for (const [key, info] of Object.entries(result.knownInputs)) {
    if (info.extendsFrom !== null) {
      const from = idToGraphNode.get(key)!;
      const target = idToGraphNode.get(info.extendsFrom)!;
      from.outgoing.add(target);
      target.incoming.add(from);
    }
  }

  // Sort topologically and iterate super classes first, so that we can trivially
  // propagate incompatibility statuses (and other checks) without having to check
  // in both directions (derived classes, or base classes). This simplifies the
  // propagation.
  for (const node of topologicalSort(inheritanceGraph).reverse()) {
    for (const parent of node.outgoing) {
      // If parent is incompatible and not migrated, then this input
      // cannot be migrated either.
      if (parent.data.info.isIncompatible !== null) {
        node.data.info.isIncompatible = {
          kind: IncompatibilityType.VIA_INPUT,
          reason: InputIncompatibilityReason.ParentIsIncompatible,
        };
        break;
      }
    }
  }

  for (const info of Object.values(result.knownInputs)) {
    // We never saw a source file for this input, globally. Mark it as incompatible,
    // so that all references and inheritance checks can propagate accordingly.
    if (!info.seenAsSourceInput) {
      info.isIncompatible = {
        kind: IncompatibilityType.VIA_INPUT,
        reason: InputIncompatibilityReason.OutsideOfMigrationScope,
      };
    }
  }

  return result;
}
