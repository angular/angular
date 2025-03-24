/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TmplAstBoundEvent} from '@angular/compiler';
import {ErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics';
import tss from 'typescript';

import {getTargetAtPosition, TargetNodeKind} from '../template_target';
import {getTypeCheckInfoAtPosition, TypeCheckInfo} from '../utils';

import {CodeActionMeta, FixIdForCodeFixesAll} from './utils';

/**
 * fix [invalid banana-in-box](https://angular.io/extended-diagnostics/NG8101)
 */
export const fixInvalidBananaInBoxMeta: CodeActionMeta = {
  errorCodes: [ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX)],
  getCodeActions({start, fileName, typeCheckInfo}) {
    const boundEvent =
      typeCheckInfo === null ? null : getTheBoundEventAtPosition(typeCheckInfo, start);
    if (boundEvent === null) {
      return [];
    }
    const textChanges = convertBoundEventToTsTextChange(boundEvent);
    return [
      {
        fixName: FixIdForCodeFixesAll.FIX_INVALID_BANANA_IN_BOX,
        fixId: FixIdForCodeFixesAll.FIX_INVALID_BANANA_IN_BOX,
        fixAllDescription: 'fix all invalid banana-in-box',
        description: `fix invalid banana-in-box for '${boundEvent.sourceSpan.toString()}'`,
        changes: [
          {
            fileName,
            textChanges,
          },
        ],
      },
    ];
  },
  fixIds: [FixIdForCodeFixesAll.FIX_INVALID_BANANA_IN_BOX],
  getAllCodeActions({diagnostics, compiler}) {
    const fileNameToTextChangesMap = new Map<string, tss.TextChange[]>();
    for (const diag of diagnostics) {
      const fileName = diag.file?.fileName;
      if (fileName === undefined) {
        continue;
      }
      const start = diag.start;
      if (start === undefined) {
        continue;
      }
      const typeCheckInfo = getTypeCheckInfoAtPosition(fileName, start, compiler);
      if (typeCheckInfo === undefined) {
        continue;
      }

      /**
       * This diagnostic has detected a likely mistake that puts the square brackets inside the
       * parens (the BoundEvent `([thing])`) when it should be the other way around `[(thing)]` so
       * this function is trying to find the bound event in order to flip the syntax.
       */
      const boundEvent = getTheBoundEventAtPosition(typeCheckInfo, start);
      if (boundEvent === null) {
        continue;
      }

      if (!fileNameToTextChangesMap.has(fileName)) {
        fileNameToTextChangesMap.set(fileName, []);
      }
      const fileTextChanges = fileNameToTextChangesMap.get(fileName)!;
      const textChanges = convertBoundEventToTsTextChange(boundEvent);
      fileTextChanges.push(...textChanges);
    }

    const fileTextChanges: tss.FileTextChanges[] = [];
    for (const [fileName, textChanges] of fileNameToTextChangesMap) {
      fileTextChanges.push({
        fileName,
        textChanges,
      });
    }
    return {
      changes: fileTextChanges,
    };
  },
};

function getTheBoundEventAtPosition(
  typeCheckInfo: TypeCheckInfo,
  start: number,
): TmplAstBoundEvent | null {
  // It's safe to get the bound event at the position `start + 1` because the `start` is at the
  // start of the diagnostic, and the node outside the attribute key and value spans are skipped by
  // the function `getTargetAtPosition`.
  // https://github.com/angular/vscode-ng-language-service/blob/8553115972ca40a55602747667c3d11d6f47a6f8/server/src/session.ts#L220
  // https://github.com/angular/angular/blob/4e10a7494130b9bb4772ee8f76b66675867b2145/packages/language-service/src/template_target.ts#L347-L356
  const positionDetail = getTargetAtPosition(typeCheckInfo.nodes, start + 1);
  if (positionDetail === null) {
    return null;
  }

  if (
    positionDetail.context.kind !== TargetNodeKind.AttributeInKeyContext ||
    !(positionDetail.context.node instanceof TmplAstBoundEvent)
  ) {
    return null;
  }

  return positionDetail.context.node;
}

/**
 * Flip the invalid "box in a banana" `([thing])` to the correct "banana in a box" `[(thing)]`.
 */
function convertBoundEventToTsTextChange(node: TmplAstBoundEvent): readonly tss.TextChange[] {
  const name = node.name;
  const boundSyntax = node.sourceSpan.toString();
  const expectedBoundSyntax = boundSyntax.replace(`(${name})`, `[(${name.slice(1, -1)})]`);

  return [
    {
      span: {
        start: node.sourceSpan.start.offset,
        length: boundSyntax.length,
      },
      newText: expectedBoundSyntax,
    },
  ];
}
