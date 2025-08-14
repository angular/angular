/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {analyzeControlFlow, ControlFlowAnalysisNode} from '../../../flow_analysis';
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

  // Handle multiple usages of the same input in a single method to prevent 'this' removal
  const methodInputUsageCount = new Map<string, number>();
  const methodInputUsages = new Map<string, ts.Identifier[]>();

  // TODO: Consider checking/properly handling optional chaining and narrowing.
  for (const reference of tsReferencesWithNarrowing.values()) {
    const controlFlowResult = analyzeControlFlow(reference.accesses, checker);
    const idToSharedField = new Map<number, string>();

    const isSharePartnerRef = (val: ControlFlowAnalysisNode['recommendedNode']) => {
      return val !== 'preserve' && typeof val !== 'number';
    };

    // Ensure we generate shared fields before reference entries.
    // This allows us to safely make use of `idToSharedField` whenever we come
    // across a referenced pointing to a share partner.
    controlFlowResult.sort((a, b) => {
      const aPriority = isSharePartnerRef(a.recommendedNode) ? 1 : 0;
      const bPriority = isSharePartnerRef(b.recommendedNode) ? 1 : 0;
      return bPriority - aPriority;
    });

    for (const {id, originalNode, recommendedNode} of controlFlowResult) {
      const sf = originalNode.getSourceFile();

      // Original node is preserved. No narrowing, and hence not shared.
      // Unwrap the signal directly.
      if (recommendedNode === 'preserve') {
        // Check for multiple usages of the same input in this method
        const inputName = originalNode.text;
        const methodKey = `${sf.fileName}:${inputName}`;
        
        if (!methodInputUsageCount.has(methodKey)) {
          methodInputUsageCount.set(methodKey, 0);
          methodInputUsages.set(methodKey, []);
        }
        
        const currentCount = methodInputUsageCount.get(methodKey)!;
        methodInputUsageCount.set(methodKey, currentCount + 1);
        methodInputUsages.get(methodKey)!.push(originalNode);
        
        // If multiple usages, create a local const variable
        if (currentCount > 0) {
          // Find the method containing this node
          let methodNode = originalNode.parent;
          while (methodNode && !ts.isMethodDeclaration(methodNode)) {
            methodNode = methodNode.parent;
          }
          
          if (methodNode && ts.isMethodDeclaration(methodNode)) {
            // Insert const declaration at the beginning of the method body
            const methodBody = methodNode.body;
            if (methodBody && ts.isBlock(methodBody)) {
              const firstStatement = methodBody.statements[0];
              if (firstStatement) {
                replacements.push(
                  new Replacement(
                    projectFile(sf, info),
                    new TextUpdate({
                      position: firstStatement.getStart(),
                      end: firstStatement.getStart(),
                      toInsert: `const ${inputName} = this.${inputName}();\n${' '.repeat(ts.getLineAndCharacterOfPosition(sf, firstStatement.getStart()).character)}`,
                    }),
                  ),
                );
              }
            }
          }
          
          // Replace this usage with the local variable
          replacements.push(
            new Replacement(
              projectFile(sf, info),
              new TextUpdate({
                position: originalNode.getStart(),
                end: originalNode.getEnd(),
                toInsert: inputName,
              }),
            ),
          );
        } else {
          // Single usage → change to this.inputName()
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
        }
        continue;
      }

      // This reference is shared with a previous reference. Replace the access
      // with the temporary variable.
      if (typeof recommendedNode === 'number') {
        // Extract the shared field name.
        const toInsert = idToSharedField.get(recommendedNode);
        const replaceNode = traverseAccess(originalNode);

        if (!toInsert) throw new Error('no shared variable yet available');
        replacements.push(
          new Replacement(
            projectFile(sf, info),
            new TextUpdate({
              position: replaceNode.getStart(),
              end: replaceNode.getEnd(),
              toInsert: toInsert!,
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
      const filePath = projectFile(sf, info);
      const initializer = `${replaceNode.getText()}()`;
      const fieldName = nameGenerator.generate(originalNode.text, referenceNodeInBlock);

      let sharedValueAccessExpr: string;
      let temporaryVariableStr: string;
      if (ts.isClassLike(recommendedNode)) {
        sharedValueAccessExpr = `this.${fieldName}`;
        temporaryVariableStr = `private readonly ${fieldName} = ${initializer};`;
      } else {
        sharedValueAccessExpr = fieldName;
        temporaryVariableStr = `const ${fieldName} = ${initializer};`;
      }

      idToSharedField.set(id, sharedValueAccessExpr);

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
            toInsert: sharedValueAccessExpr,
          }),
        ),
      );
    }
  }
}
