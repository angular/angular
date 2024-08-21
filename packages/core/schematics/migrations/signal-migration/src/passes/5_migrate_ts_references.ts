/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {MigrationResult} from '../result';
import {analyzeControlFlow} from '../flow_analysis';
import {Replacement, TextUpdate} from '../../../../utils/tsurge/replacement';
import {InputUniqueKey} from '../utils/input_id';
import {isTsInputReference} from '../utils/input_reference';
import {traverseAccess} from '../utils/traverse_access';
import {KnownInputs} from '../input_detection/known_inputs';
import {UniqueNamesGenerator} from '../utils/unique_names';
import {absoluteFromSourceFile} from '../../../../../../compiler-cli/src/ngtsc/file_system';

/**
 * Phase that migrates TypeScript input references to be signal compatible.
 *
 * The phase takes care of control flow analysis and generates temporary variables
 * where needed to ensure narrowing continues to work. E.g.
 *
 * ```
 * someMethod() {
 *   if (this.input) {
 *     this.input.charAt(0);
 *   }
 * }
 * ```
 *
 * will be transformed into:
 *
 * ```
 * someMethod() {
 *   const input_1 = this.input();
 *   if (input_1) {
 *     input_1.charAt(0);
 *   }
 * }
 * ```
 */
export function pass5__migrateTypeScriptReferences(
  result: MigrationResult,
  checker: ts.TypeChecker,
  knownInputs: KnownInputs,
) {
  const tsReferences = new Map<InputUniqueKey, {accesses: ts.Identifier[]}>();
  const seenIdentifiers = new WeakSet<ts.Identifier>();
  const nameGenerator = new UniqueNamesGenerator();

  for (const reference of result.references) {
    // This pass only deals with TS references.
    if (!isTsInputReference(reference)) {
      continue;
    }
    // Skip references to incompatible inputs.
    if (knownInputs.get(reference.target)!.isIncompatible()) {
      continue;
    }
    // Never attempt to migrate write references.
    // Those usually invalidate the target input most of the time, but in
    // best-effort mode they are not.
    if (reference.from.isWrite) {
      continue;
    }
    // Skip duplicate references. E.g. in batching.
    if (seenIdentifiers.has(reference.from.node)) {
      continue;
    }
    seenIdentifiers.add(reference.from.node);

    if (!tsReferences.has(reference.target.key)) {
      tsReferences.set(reference.target.key, {
        accesses: [],
      });
    }
    tsReferences.get(reference.target.key)!.accesses.push(reference.from.node);
  }

  // TODO: Consider checking/properly handling optional chaining and narrowing.

  for (const reference of tsReferences.values()) {
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
            absoluteFromSourceFile(sf),
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
            absoluteFromSourceFile(sf),
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
          absoluteFromSourceFile(sf),
          new TextUpdate({
            position: previous.getStart(),
            end: previous.getStart(),
            toInsert: `const ${fieldName} = ${replaceNode.getText()}();\n${' '.repeat(leadingSpace.character)}`,
          }),
        ),
      );

      result.replacements.push(
        new Replacement(
          absoluteFromSourceFile(sf),
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
