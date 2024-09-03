/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
  getCodeActions: () => [],
  fixIds: [FixIdForCodeFixesAll.FIX_UNUSED_STANDALONE_IMPORTS],
  getAllCodeActions: ({diagnostics}) => {
    const changes: tss.FileTextChanges[] = [];

    for (const diag of diagnostics) {
      const {start, length, file, relatedInformation} = diag;
      if (file === undefined || start === undefined || length == undefined) {
        continue;
      }

      const node = findFirstMatchingNode(file, {
        filter: (current): current is tss.ArrayLiteralExpression =>
          current.getStart() === start &&
          current.getWidth() === length &&
          tss.isArrayLiteralExpression(current),
      });

      if (node === null) {
        continue;
      }

      let newText: string;

      // If `relatedInformation` is empty, it means that all the imports are unused.
      // Replace the array with an empty array.
      if (relatedInformation === undefined || relatedInformation.length === 0) {
        newText = '[]';
      } else {
        // Otherwise each `relatedInformation` entry points to an unused import that should be
        // filtered out. We make a set of ranges corresponding to nodes which will be deleted and
        // remove all nodes that belong to the set.
        const excludeRanges = new Set(
          relatedInformation.map((info) => `${info.start}-${info.length}`),
        );
        const newArray = tss.factory.updateArrayLiteralExpression(
          node,
          node.elements.filter((el) => !excludeRanges.has(`${el.getStart()}-${el.getWidth()}`)),
        );

        newText = tss.createPrinter().printNode(tss.EmitHint.Unspecified, newArray, file);
      }

      changes.push({
        fileName: file.fileName,
        textChanges: [
          {
            span: {start, length},
            newText,
          },
        ],
      });
    }

    return {changes};
  },
};
