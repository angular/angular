/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';

import {Session} from '../session';
import {filePathToUri, tsTextSpanToLspRange} from '../utils';

import {isInAngularProject} from './template_info';

export function onCodeLens(session: Session, params: lsp.CodeLensParams): lsp.CodeLens[] | null {
  if (
    !params.textDocument.uri.endsWith('.html') ||
    !isInAngularProject(session, {textDocument: params.textDocument})
  ) {
    return null;
  }
  const position = lsp.Position.create(0, 0);
  const topOfDocument = lsp.Range.create(position, position);

  const codeLens: lsp.CodeLens = {
    range: topOfDocument,
    data: params.textDocument,
  };

  return [codeLens];
}

export function onCodeLensResolve(session: Session, params: lsp.CodeLens): lsp.CodeLens {
  const components = getComponentsWithTemplateFile(session, {textDocument: params.data});
  if (components === null || components.length === 0) {
    // While the command is supposed to be optional, vscode will show `!!MISSING: command!!` that
    // fails if you click on it when a command is not provided. Instead, throwing an error will
    // make vscode show the text "no commands" (and it's not a link).
    // It is documented that code lens resolution can throw an error:
    // https://microsoft.github.io/language-server-protocol/specification#codeLens_resolve
    throw new Error(
      'Could not determine component for ' + (params.data as lsp.TextDocumentIdentifier).uri,
    );
  }
  params.command = {
    command: 'angular.goToComponentWithTemplateFile',
    title:
      components.length > 1
        ? `Used as templateUrl in ${components.length} components`
        : 'Go to component',
  };
  return params;
}

export function getComponentsWithTemplateFile(
  session: Session,
  params: any,
): lsp.Location[] | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {languageService, scriptInfo} = lsInfo;
  const documentSpans = languageService.getComponentLocationsForTemplate(scriptInfo.fileName);
  const results: lsp.Location[] = [];
  for (const documentSpan of documentSpans) {
    const scriptInfo = session.projectService.getScriptInfo(documentSpan.fileName);
    if (scriptInfo === undefined) {
      continue;
    }
    const range = tsTextSpanToLspRange(scriptInfo, documentSpan.textSpan);
    results.push(lsp.Location.create(filePathToUri(documentSpan.fileName), range));
  }
  return results;
}
