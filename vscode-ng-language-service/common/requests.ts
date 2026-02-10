/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as lsp from 'vscode-languageserver-protocol';

export const GetComponentsWithTemplateFile = new lsp.RequestType<
  GetComponentsWithTemplateFileParams,
  lsp.Location[],
  /* error */ void
>('angular/getComponentsWithTemplateFile');

export interface GetComponentsWithTemplateFileParams {
  textDocument: lsp.TextDocumentIdentifier;
}

export const GetTemplateLocationForComponent = new lsp.RequestType<
  GetTemplateLocationForComponentParams,
  lsp.Location,
  /* error */ void
>('angular/getTemplateLocationForComponent');

export interface GetTemplateLocationForComponentParams {
  textDocument: lsp.TextDocumentIdentifier;
  position: lsp.Position;
}

export interface GetTcbParams {
  textDocument: lsp.TextDocumentIdentifier;
  position: lsp.Position;
}

export const GetTcbRequest = new lsp.RequestType<
  GetTcbParams,
  GetTcbResponse | null,
  /* error */ void
>('angular/getTcb');

export interface GetTcbResponse {
  uri: lsp.DocumentUri;
  content: string;
  selections: lsp.Range[];
}

export const IsInAngularProject = new lsp.RequestType<
  IsInAngularProjectParams,
  boolean | null,
  /* error */ void
>('angular/isAngularCoreInOwningProject');

export interface IsInAngularProjectParams {
  textDocument: lsp.TextDocumentIdentifier;
}
