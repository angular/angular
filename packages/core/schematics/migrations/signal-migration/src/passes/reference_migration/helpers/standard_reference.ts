/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {analyzeControlFlow} from '../../../flow_analysis';
import {ProgramInfo, projectFile, Replacement, TextUpdate} from '../../../../../../utils/tsurge';
import {traverseAccess} from '../../../utils/traverse_access';
import {UniqueNamesGenerator} from '../../../utils/unique_names';
import {createNewBlockToInsertVariable} from '../helpers/create_block_arrow_function';

export interface NarrowableTsReferences {
  accesses: ts.Identifier[];
}

export function migrateStandardTsReference(
  tsReferencesWithNarrowing: Map<unknown, NarrowableTsReferences>,
  checker: ts.TypeChecker,
  info: ProgramInfo,
  replacements: Replacement[],
) {
  const nameGenerator = new UniqueNamesGenerator(['Value', 'Val', 'Input']);

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
        replacements.push(
          new Replacement(
            projectFile(sf, info),
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
        replacements.push(
          new Replacement(
            projectFile(sf, info),
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
      let referenceNodeInBlock: ts.Node = originalNode;
      while (parent !== recommendedNode) {
        referenceNodeInBlock = parent;
        parent = parent.parent;
      }

      const replaceNode = traverseAccess(originalNode);
      const fieldName = nameGenerator.generate(originalNode.text, referenceNodeInBlock);
      const filePath = projectFile(sf, info);
      const temporaryVariableStr = `const ${fieldName} = ${replaceNode.getText()}();`;

      idToSharedField.set(id, fieldName);

      // If the common ancestor block of all shared references is an arrow function
      // without a block, convert the arrow function to a block and insert the temporary
      // variable at the beginning.
      if (ts.isArrowFunction(parent) && !ts.isBlock(parent.body)) {
        replacements.push(
          ...createNewBlockToInsertVariable(parent, filePath, temporaryVariableStr),
        );
      } else {
        const leadingSpace = ts.getLineAndCharacterOfPosition(sf, referenceNodeInBlock.getStart());

        replacements.push(
          new Replacement(
            filePath,
            new TextUpdate({
              position: referenceNodeInBlock.getStart(),
              end: referenceNodeInBlock.getStart(),
              toInsert: `${temporaryVariableStr}\n${' '.repeat(leadingSpace.character)}`,
            }),
          ),
        );
      }

      replacements.push(
        new Replacement(
          projectFile(sf, info),
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
