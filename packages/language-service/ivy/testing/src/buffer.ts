/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';

import {Project} from './project';
import {extractCursorInfo} from './util';

/**
 * A file that is currently open in the `ts.Project`, with a cursor position.
 */
export class OpenBuffer {
  private _cursor: number = 0;

  constructor(
      private project: Project, private projectFileName: string,
      private scriptInfo: ts.server.ScriptInfo) {}

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
      throw new Error(`Snippet ${snippet} not found in ${this.projectFileName}`);
    }
    this._cursor = snippetIndex + cursor;
  }

  /**
   * Execute the `getDefinitionAndBoundSpan` operation in the Language Service at the cursor
   * location in this buffer.
   */
  getDefinitionAndBoundSpan(): ts.DefinitionInfoAndBoundSpan|undefined {
    return this.project.ngLS.getDefinitionAndBoundSpan(this.scriptInfo.fileName, this._cursor);
  }
}
