/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {findFirstMatchingNode} from '@angular/compiler-cli/src/ngtsc/typecheck/src/comments';
import * as e from '@angular/compiler/src/expression_parser/ast';  // e for expression AST
import ts from 'typescript';
import tss from 'typescript/lib/tsserverlibrary';

import {getTargetAtPosition, getTcbNodesOfTemplateAtPosition, TargetNodeKind} from '../template_target';
import {getTemplateInfoAtPosition} from '../utils';

import {CodeActionMeta, convertFileTextChangeInTcb, FixIdForCodeFixesAll} from './utils';

const errorCodes: number[] = [
  2551,  // https://github.com/microsoft/TypeScript/blob/8e6e87fea6463e153822e88431720f846c3b8dfa/src/compiler/diagnosticMessages.json#L2493
  2339,  // https://github.com/microsoft/TypeScript/blob/8e6e87fea6463e153822e88431720f846c3b8dfa/src/compiler/diagnosticMessages.json#L1717
];

/**
 * This code action will fix the missing member of a type. For example, add the missing member to
 * the type or try to get the spelling suggestion for the name from the type.
 */
export const missingMemberMeta: CodeActionMeta = {
  errorCodes,
  getCodeActions: function(
      {templateInfo, start, compiler, formatOptions, preferences, errorCode, tsLs}) {
    const tcbNodesInfo = getTcbNodesOfTemplateAtPosition(templateInfo, start, compiler);
    if (tcbNodesInfo === null) {
      return [];
    }

    const codeActions: ts.CodeFixAction[] = [];
    const tcb = tcbNodesInfo.componentTcbNode;
    for (const tcbNode of tcbNodesInfo.nodes) {
      const tsLsCodeActions = tsLs.getCodeFixesAtPosition(
          tcb.getSourceFile().fileName, tcbNode.getStart(), tcbNode.getEnd(), [errorCode],
          formatOptions, preferences);
      codeActions.push(...tsLsCodeActions);
    }
    return codeActions.map(codeAction => {
      return {
        fixName: codeAction.fixName,
        fixId: codeAction.fixId,
        fixAllDescription: codeAction.fixAllDescription,
        description: codeAction.description,
        changes: convertFileTextChangeInTcb(codeAction.changes, compiler),
        commands: codeAction.commands,
      };
    });
  },
  fixIds: [FixIdForCodeFixesAll.FIX_SPELLING, FixIdForCodeFixesAll.FIX_MISSING_MEMBER],
  getAllCodeActions: function(
      {tsLs, scope, fixId, formatOptions, preferences, compiler, diagnostics}) {
    const changes: tss.FileTextChanges[] = [];
    const seen: Set<tss.ClassDeclaration> = new Set();
    for (const diag of diagnostics) {
      if (!errorCodes.includes(diag.code)) {
        continue;
      }

      const fileName = diag.file?.fileName;
      if (fileName === undefined) {
        continue;
      }
      if (diag.start === undefined) {
        continue;
      }
      const componentClass = getTemplateInfoAtPosition(fileName, diag.start, compiler)?.component;
      if (componentClass === undefined) {
        continue;
      }
      if (seen.has(componentClass)) {
        continue;
      }
      seen.add(componentClass);

      const tcb = compiler.getTemplateTypeChecker().getTypeCheckBlock(componentClass);
      if (tcb === null) {
        continue;
      }

      const combinedCodeActions = tsLs.getCombinedCodeFix(
          {
            type: scope.type,
            fileName: tcb.getSourceFile().fileName,
          },
          fixId, formatOptions, preferences);
      changes.push(...combinedCodeActions.changes);
    }
    return {
      changes: convertFileTextChangeInTcb(changes, compiler),
    };
  }
};
