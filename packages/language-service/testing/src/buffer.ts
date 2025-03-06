/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {LanguageService} from '../../src/language_service';

/**
 * A file that is currently open in the `ts.Project`, with a cursor position.
 */
export class OpenBuffer {
  private _cursor: number = 0;

  constructor(
    private ngLS: LanguageService,
    private project: ts.server.Project,
    private projectFileName: string,
    private scriptInfo: ts.server.ScriptInfo,
  ) {}

  get cursor(): number {
    return this._cursor;
  }

  get contents(): string {
    const snapshot = this.scriptInfo.getSnapshot();
    return snapshot.getText(0, snapshot.getLength());
  }

  set contents(newContents: string) {
    const snapshot = this.scriptInfo.getSnapshot();
    this.scriptInfo.editContent(0, snapshot.getLength(), newContents);

    // As of TypeScript 5.2 we need to trigger graph update manually in order to satisfy the
    // following assertion:
    // https://github.com/microsoft/TypeScript/commit/baf872cba4eb3fbc5e5914385ce534902ae13639#diff-fad6af6557c1406192e30af30e0113a5eb327d60f9e2588bdce6667d619ebd04R1503
    this.project.updateGraph();
    // If the cursor goes beyond the new length of the buffer, clamp it to the end of the buffer.
    if (this._cursor > newContents.length) {
      this._cursor = newContents.length;
    }
  }

  /**
   * Find a snippet of text within the given buffer and position the cursor within it.
   *
   * @param snippetWithCursor a snippet of text which contains the '¦' symbol, representing where
   *     the cursor should be placed within the snippet when located in the larger buffer.
   */
  moveCursorToText(snippetWithCursor: string): void {
    const {text: snippet, cursor} = extractCursorInfo(snippetWithCursor);
    const snippetIndex = this.contents.indexOf(snippet);
    if (snippetIndex === -1) {
      throw new Error(`Snippet '${snippet}' not found in ${this.projectFileName}`);
    }
    if (this.contents.indexOf(snippet, snippetIndex + 1) !== -1) {
      throw new Error(`Snippet '${snippet}' is not unique within ${this.projectFileName}`);
    }
    this._cursor = snippetIndex + cursor;
  }

  /**
   * Execute the `getDefinitionAndBoundSpan` operation in the Language Service at the cursor
   * location in this buffer.
   */
  getDefinitionAndBoundSpan(): ts.DefinitionInfoAndBoundSpan | undefined {
    return this.ngLS.getDefinitionAndBoundSpan(this.scriptInfo.fileName, this._cursor);
  }

  getEncodedSemanticClassifications(
    span?: ts.TextSpan,
    format?: ts.SemanticClassificationFormat,
  ): ts.Classifications {
    return this.ngLS.getEncodedSemanticClassifications(
      this.scriptInfo.fileName,
      span ?? {start: 0, length: this.scriptInfo.getSnapshot().getLength()},
      format ?? ts.SemanticClassificationFormat.TwentyTwenty,
    );
  }

  getCompletionsAtPosition(
    options?: ts.GetCompletionsAtPositionOptions,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    return this.ngLS.getCompletionsAtPosition(this.scriptInfo.fileName, this._cursor, options);
  }

  getCompletionEntryDetails(
    entryName: string,
    formatOptions?: ts.FormatCodeOptions | ts.FormatCodeSettings,
    preferences?: ts.UserPreferences,
    data?: ts.CompletionEntryData,
  ): ts.CompletionEntryDetails | undefined {
    return this.ngLS.getCompletionEntryDetails(
      this.scriptInfo.fileName,
      this._cursor,
      entryName,
      formatOptions,
      preferences,
      data,
    );
  }

  getTcb() {
    return this.ngLS.getTcb(this.scriptInfo.fileName, this._cursor);
  }

  getOutliningSpans() {
    return this.ngLS.getOutliningSpans(this.scriptInfo.fileName);
  }

  getTemplateLocationForComponent() {
    return this.ngLS.getTemplateLocationForComponent(this.scriptInfo.fileName, this._cursor);
  }

  getQuickInfoAtPosition() {
    return this.ngLS.getQuickInfoAtPosition(this.scriptInfo.fileName, this._cursor);
  }

  getTypeDefinitionAtPosition() {
    return this.ngLS.getTypeDefinitionAtPosition(this.scriptInfo.fileName, this._cursor);
  }

  getReferencesAtPosition() {
    return this.ngLS.getReferencesAtPosition(this.scriptInfo.fileName, this._cursor);
  }

  findRenameLocations() {
    return this.ngLS.findRenameLocations(this.scriptInfo.fileName, this._cursor);
  }

  getRenameInfo() {
    return this.ngLS.getRenameInfo(this.scriptInfo.fileName, this._cursor);
  }

  getSignatureHelpItems() {
    return this.ngLS.getSignatureHelpItems(this.scriptInfo.fileName, this._cursor);
  }
}

/**
 * Given a text snippet which contains exactly one cursor symbol ('¦'), extract both the offset of
 * that cursor within the text as well as the text snippet without the cursor.
 */
function extractCursorInfo(textWithCursor: string): {cursor: number; text: string} {
  const cursor = textWithCursor.indexOf('¦');
  if (cursor === -1 || textWithCursor.indexOf('¦', cursor + 1) !== -1) {
    throw new Error(`Expected to find exactly one cursor symbol '¦'`);
  }

  return {
    cursor,
    text: textWithCursor.slice(0, cursor) + textWithCursor.slice(cursor + 1),
  };
}
