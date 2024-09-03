/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {InputUniqueKey} from '../../utils/input_id';
import {analyzeControlFlow} from '../../flow_analysis';
import {MigrationResult} from '../../result';
import {projectRelativePath, Replacement, TextUpdate} from '../../../../../utils/tsurge';
import {AbsoluteFsPath} from '../../../../../../../compiler-cli';
import {traverseAccess} from '../../utils/traverse_access';
import {UniqueNamesGenerator} from '../../utils/unique_names';

export interface NarrowableTsReference {
  accesses: ts.Identifier[];
}

export function migrateStandardTsReference(
  tsReferencesWithNarrowing: Map<InputUniqueKey, NarrowableTsReference>,
  checker: ts.TypeChecker,
  result: MigrationResult,
  nameGenerator: UniqueNamesGenerator,
  projectDirAbsPath: AbsoluteFsPath,
) {
  // TODO: Consider checking/properly handling optional chaining and narrowing.
  for (const reference of tsReferencesWithNarrowing.values()) {
    const controlFlowResult = analyzeControlFlow(reference.accesses, checker);
    const idToSharedField = new Map<number, string>();

    for (const {id, originalNode, recommendedNode} of controlFlowResult) {
      const sf = originalNode.getSourceFile();

      // Original node is preserved. No narrowing, and hence not shared.
      // Unwrap the signal directly.
      if (recommendedNode === 'preserve') {
        // Append `()` to unwrap the signal.
        result.replacements.push(
          new Replacement(
            projectRelativePath(sf, projectDirAbsPath),
            new TextUpdate({
              position: originalNode.getEnd(),
              end: originalNode.getEnd(),
              toInsert: '()',
            }),
          ),
        );
        continue;
      }

      // This reference is shared with a previous reference. Replace the access
      // with the temporary variable.
      if (typeof recommendedNode === 'number') {
        const replaceNode = traverseAccess(originalNode);
        result.replacements.push(
          new Replacement(
            projectRelativePath(sf, projectDirAbsPath),
            new TextUpdate({
              position: replaceNode.getStart(),
              end: replaceNode.getEnd(),
              // Extract the shared field name.
              toInsert: idToSharedField.get(recommendedNode)!,
            }),
          ),
        );
        continue;
      }

      // Otherwise, we are creating a "shared reference" at the given node and
      // block.

      // Iterate up the original node, until we hit the "recommended block" level.
      // We then use the previous child as anchor for inserting. This allows us
      // to insert right before the first reference in the container, at the proper
      // block level— instead of always inserting at the beginning of the container.
      let parent = originalNode.parent;
      let previous: ts.Node = originalNode;
      while (parent !== recommendedNode) {
        previous = parent;
        parent = parent.parent;
      }

      const leadingSpace = ts.getLineAndCharacterOfPosition(sf, previous.getStart());

      const replaceNode = traverseAccess(originalNode);
      const fieldName = nameGenerator.generate(originalNode.text, previous);

      idToSharedField.set(id, fieldName);

      result.replacements.push(
        new Replacement(
          projectRelativePath(sf, projectDirAbsPath),
          new TextUpdate({
            position: previous.getStart(),
            end: previous.getStart(),
            toInsert: `const ${fieldName} = ${replaceNode.getText()}();\n${' '.repeat(leadingSpace.character)}`,
          }),
        ),
      );

      result.replacements.push(
        new Replacement(
          projectRelativePath(sf, projectDirAbsPath),
          new TextUpdate({
            position: replaceNode.getStart(),
            end: replaceNode.getEnd(),
            toInsert: fieldName,
          }),
        ),
      );
    }
  }
}
