/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics';
import tss from 'typescript';

import {CodeActionMeta, FixIdForCodeFixesAll} from './utils';
import {findFirstMatchingNode} from '../utils/ts_utils';

/**
 * Fix for [unused standalone imports](https://angular.io/extended-diagnostics/NG8113)
 */
export const fixUnusedStandaloneImportsMeta: CodeActionMeta = {
  errorCodes: [ngErrorCode(ErrorCode.UNUSED_STANDALONE_IMPORTS)],
  getCodeActions: ({start, fileName, compiler}) => {
    const file = compiler.programDriver.getProgram().getSourceFile(fileName) || null;

    if (file === null) {
      return [];
    }

    const node = findFirstMatchingNode(file, {
      filter: (n): n is tss.Identifier =>
        tss.isIdentifier(n) && start >= n.getStart() && start <= n.getEnd(),
    });
    const parent = node?.parent || null;

    if (node === null || parent === null) {
      return [];
    }

    if (isFullyUnusedArray(node, parent)) {
      return [
        {
          fixName: FixIdForCodeFixesAll.FIX_UNUSED_STANDALONE_IMPORTS,
          fixId: FixIdForCodeFixesAll.FIX_UNUSED_STANDALONE_IMPORTS,
          fixAllDescription: `Remove all unused imports`,
          description: `Remove all unused imports`,
          changes: [
            {
              fileName,
              textChanges: [
                {
                  span: {
                    start: parent.initializer.getStart(),
                    length: parent.initializer.getWidth(),
                  },
                  newText: '[]',
                },
              ],
            },
          ],
        },
      ];
    } else if (tss.isArrayLiteralExpression(parent)) {
      const newArray = tss.factory.updateArrayLiteralExpression(
        parent,
        parent.elements.filter((el) => el !== node),
      );

      return [
        {
          fixName: FixIdForCodeFixesAll.FIX_UNUSED_STANDALONE_IMPORTS,
          fixId: FixIdForCodeFixesAll.FIX_UNUSED_STANDALONE_IMPORTS,
          fixAllDescription: `Remove all unused imports`,
          description: `Remove unused import ${node.text}`,
          changes: [
            {
              fileName,
              textChanges: [
                {
                  span: {
                    start: parent.getStart(),
                    length: parent.getWidth(),
                  },
                  newText: tss.createPrinter().printNode(tss.EmitHint.Unspecified, newArray, file),
                },
              ],
            },
          ],
        },
      ];
    }

    return [];
  },
  fixIds: [FixIdForCodeFixesAll.FIX_UNUSED_STANDALONE_IMPORTS],
  getAllCodeActions: ({diagnostics}) => {
    const arrayUpdates = new Map<tss.ArrayLiteralExpression, Set<tss.Expression>>();
    const arraysToClear = new Set<tss.ArrayLiteralExpression>();
    const changes: tss.FileTextChanges[] = [];

    for (const diag of diagnostics) {
      const {start, length, file} = diag;
      if (file === undefined || start === undefined || length == undefined) {
        continue;
      }

      const node = findFirstMatchingNode(file, {
        filter: (n): n is tss.Expression => n.getStart() === start && n.getWidth() === length,
      });
      const parent = node?.parent || null;

      if (node === null || parent === null) {
        continue;
      }

      // If the diagnostic is reported on the name of the `imports` array initializer, it means
      // that all imports are unused so we can clear the entire array. Otherwise if it's reported
      // on a single element, we only have to remove that element.
      if (isFullyUnusedArray(node, parent)) {
        arraysToClear.add(parent.initializer);
      } else if (tss.isArrayLiteralExpression(parent)) {
        if (!arrayUpdates.has(parent)) {
          arrayUpdates.set(parent, new Set());
        }
        arrayUpdates.get(parent)!.add(node);
      }
    }

    for (const array of arraysToClear) {
      changes.push({
        fileName: array.getSourceFile().fileName,
        textChanges: [
          {
            span: {start: array.getStart(), length: array.getWidth()},
            newText: '[]',
          },
        ],
      });
    }

    for (const [array, toRemove] of arrayUpdates) {
      if (arraysToClear.has(array)) {
        continue;
      }

      const file = array.getSourceFile();
      const newArray = tss.factory.updateArrayLiteralExpression(
        array,
        array.elements.filter((el) => !toRemove.has(el)),
      );

      changes.push({
        fileName: file.fileName,
        textChanges: [
          {
            span: {start: array.getStart(), length: array.getWidth()},
            newText: tss.createPrinter().printNode(tss.EmitHint.Unspecified, newArray, file),
          },
        ],
      });
    }

    return {changes};
  },
};

/** Checks whether a diagnostic was reported on a node where all imports are unused. */
function isFullyUnusedArray(
  node: tss.Node,
  parent: tss.Node,
): parent is tss.PropertyAssignment & {initializer: tss.ArrayLiteralExpression} {
  return (
    tss.isPropertyAssignment(parent) &&
    parent.name === node &&
    tss.isArrayLiteralExpression(parent.initializer)
  );
}
