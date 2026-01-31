/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';
import * as ts from 'typescript/lib/tsserverlibrary';
import {ApplyRefactoringResult} from '@angular/language-service/api';

import {Session} from '../session';
import {
  lspPositionToTsPosition,
  tsFileTextChangesToLspWorkspaceEdit,
  uriToFilePath,
} from '../utils';

const defaultFormatOptions: ts.FormatCodeSettings = {};

// A code action resolve data might either metadata for a refactor action
// from `onCodeAction` and `getApplicableEdits`, or is a code fix from Angular.
export type CodeActionResolveData =
  | {
      refactor?: undefined;
      fixId?: string;
      document: lsp.TextDocumentIdentifier;
    }
  | {
      refactor: true;
      name: string;
      document: lsp.TextDocumentIdentifier;
      range: ts.TextRange;
    };

export function onCodeAction(
  session: Session,
  params: lsp.CodeActionParams,
): lsp.CodeAction[] | null {
  session.debug(
    `onCodeAction: ${params.textDocument.uri} range=${params.range.start.line}:${params.range.start.character}-${params.range.end.line}:${params.range.end.character} diagnostics=${params.context.diagnostics.length}`,
  );
  const filePath = uriToFilePath(params.textDocument.uri);
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (!lsInfo) {
    session.debug(`onCodeAction: no language service for ${params.textDocument.uri}`);
    return null;
  }

  const refactorRange = {
    pos: lspPositionToTsPosition(lsInfo.scriptInfo, params.range.start),
    end: lspPositionToTsPosition(lsInfo.scriptInfo, params.range.end),
  };
  const applicableRefactors = lsInfo.languageService.getApplicableRefactors(
    filePath,
    refactorRange,
    session.defaultPreferences,
  );

  const codeActions: ts.CodeFixAction[] = [];
  for (const diagnostic of params.context.diagnostics) {
    const errorCode = diagnostic.code;
    if (typeof errorCode !== 'number') {
      continue;
    }
    const start = lspPositionToTsPosition(lsInfo.scriptInfo, diagnostic.range.start);
    const end = lspPositionToTsPosition(lsInfo.scriptInfo, diagnostic.range.end);
    const codeActionsForDiagnostic = lsInfo.languageService.getCodeFixesAtPosition(
      filePath,
      start,
      end,
      [errorCode],
      defaultFormatOptions,
      session.defaultPreferences,
    );
    codeActions.push(...codeActionsForDiagnostic);
  }

  const individualCodeFixes = codeActions.map<lsp.CodeAction>((codeAction) => {
    return {
      title: codeAction.description,
      kind: lsp.CodeActionKind.QuickFix,
      diagnostics: params.context.diagnostics,
      edit: tsFileTextChangesToLspWorkspaceEdit(codeAction.changes, (path: string) =>
        session.projectService.getScriptInfo(path),
      ),
    };
  });
  const codeFixesAll = getCodeFixesAll(codeActions, params.textDocument);
  return [
    ...individualCodeFixes,
    ...codeFixesAll,
    ...applicableRefactors.map(
      (r) =>
        ({
          title: r.description,
          kind: lsp.CodeActionKind.Refactor,
          data: {
            refactor: true,
            name: r.name,
            range: refactorRange,
            document: params.textDocument,
          } as CodeActionResolveData,
        }) as lsp.CodeAction,
    ),
  ];
}

export async function onCodeActionResolve(
  session: Session,
  param: lsp.CodeAction,
): Promise<lsp.CodeAction> {
  session.debug(`onCodeActionResolve: title=${param.title}`);
  const codeActionResolve = param.data as unknown as CodeActionResolveData;

  // This is a refactoring action; not a code fix.
  if (codeActionResolve.refactor === true) {
    const filePath = uriToFilePath(codeActionResolve.document.uri);
    const lsInfo = session.getLSAndScriptInfo(codeActionResolve.document);
    if (!lsInfo) {
      session.debug(
        `onCodeActionResolve: no language service for ${codeActionResolve.document.uri}`,
      );
      return param;
    }

    const progress = await session.connection.window.createWorkDoneProgress();
    progress.begin('Refactoring', 0);

    let edits: ApplyRefactoringResult | undefined = undefined;
    try {
      edits = await lsInfo.languageService.applyRefactoring(
        filePath,
        codeActionResolve.range,
        codeActionResolve.name,
        (percentage, updateMessage) => {
          progress.report(percentage, updateMessage);
        },
      );
    } catch (e: unknown) {
      console.error(e);
      session.connection.window.showErrorMessage(`Refactor failed with unexpected error: ${e}`);
    } finally {
      progress.done();
    }

    if (edits?.warningMessage !== undefined) {
      session.connection.window.showWarningMessage(edits.warningMessage);
    }
    if (edits?.errorMessage !== undefined) {
      session.connection.window.showErrorMessage(edits.errorMessage);
    }
    if (!edits) {
      return param;
    }

    return {
      ...param,
      edit: tsFileTextChangesToLspWorkspaceEdit(edits.edits, (path) =>
        session.projectService.getScriptInfo(path),
      ),
    };
  }

  /**
   * Now `@angular/language-service` only support quick fix, so the `onCodeAction` will return the
   * `edit` of the `lsp.CodeAction` for the diagnostics in the range that the user selects except
   * the fix all code actions.
   *
   * And the function `getCombinedCodeFix` only cares about the `fixId` and the `document`.
   * https://github.com/microsoft/vscode/blob/8ba9963c2edb08d54f2b7221137d6f1de79ecc09/extensions/typescript-language-features/src/languageFeatures/quickFix.ts#L258
   */
  const isCodeFixesAll = codeActionResolve.fixId !== undefined;
  if (!isCodeFixesAll) {
    return param;
  }
  const filePath = uriToFilePath(codeActionResolve.document.uri);
  const lsInfo = session.getLSAndScriptInfo(codeActionResolve.document);
  if (!lsInfo) {
    return param;
  }
  const fixesAllChanges = lsInfo.languageService.getCombinedCodeFix(
    {
      type: 'file',
      fileName: filePath,
    },
    codeActionResolve.fixId as {},
    defaultFormatOptions,
    session.defaultPreferences,
  );

  return {
    title: param.title,
    edit: tsFileTextChangesToLspWorkspaceEdit(fixesAllChanges.changes, (path) =>
      session.projectService.getScriptInfo(path),
    ),
  };
}

/**
 * Extract the fixAll action from `codeActions`
 *
 * When getting code fixes at the specified cursor position, the LS will return the code actions
 * that tell the editor how to fix it. For each code action, if the document includes multi
 * same-type errors, the `fixId` will append to it, because they are not `complete`. This function
 * will extract them, and they will be resolved lazily in the `onCodeActionResolve` function.
 *
 * Now the client can only resolve the `edit` property.
 * https://github.com/microsoft/vscode-languageserver-node/blob/f97bb73dbfb920af4bc8c13ecdcdc16359cdeda6/client/src/common/codeAction.ts#L45
 */
export function getCodeFixesAll(
  codeActions: readonly ts.CodeFixAction[],
  document: lsp.TextDocumentIdentifier,
): lsp.CodeAction[] {
  const seenFixId = new Set<string>();
  const lspCodeActions: lsp.CodeAction[] = [];
  for (const codeAction of codeActions) {
    const fixId = codeAction.fixId as string | undefined;
    if (fixId === undefined || codeAction.fixAllDescription === undefined || seenFixId.has(fixId)) {
      continue;
    }
    seenFixId.add(fixId);
    const codeActionResolveData: CodeActionResolveData = {
      fixId,
      document,
    };
    lspCodeActions.push({
      title: codeAction.fixAllDescription,
      kind: lsp.CodeActionKind.QuickFix,
      data: codeActionResolveData,
    });
  }
  return lspCodeActions;
}
