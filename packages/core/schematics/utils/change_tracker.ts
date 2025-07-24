/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ImportManager} from '@angular/compiler-cli/private/migrations';

/** Function that can be used to remap a generated import. */
export type ImportRemapper = (moduleName: string, inFile: string) => string;

/** Mapping between a source file and the changes that have to be applied to it. */
export type ChangesByFile = ReadonlyMap<ts.SourceFile, PendingChange[]>;

/** Change that needs to be applied to a file. */
export interface PendingChange {
  /** Index at which to start changing the file. */
  start: number;
  /**
   * Amount of text that should be removed after the `start`.
   * No text will be removed if omitted.
   */
  removeLength?: number;
  /** New text that should be inserted. */
  text: string;
}

/** Supported quotes for generated imports. */
const enum QuoteKind {
  SINGLE,
  DOUBLE,
}

/** Tracks changes that have to be made for specific files. */
export class ChangeTracker {
  private readonly _changes = new Map<ts.SourceFile, PendingChange[]>();
  private readonly _importManager: ImportManager;
  private readonly _quotesCache = new WeakMap<ts.SourceFile, QuoteKind>();

  constructor(
    private _printer: ts.Printer,
    private _importRemapper?: ImportRemapper,
  ) {
    this._importManager = new ImportManager({
      shouldUseSingleQuotes: (file) => this._getQuoteKind(file) === QuoteKind.SINGLE,
    });
  }

  /**
   * Tracks the insertion of some text.
   * @param sourceFile File in which the text is being inserted.
   * @param start Index at which the text is insert.
   * @param text Text to be inserted.
   */
  insertText(sourceFile: ts.SourceFile, index: number, text: string): void {
    this._trackChange(sourceFile, {start: index, text});
  }

  /**
   * Replaces text within a file.
   * @param sourceFile File in which to replace the text.
   * @param start Index from which to replace the text.
   * @param removeLength Length of the text being replaced.
   * @param text Text to be inserted instead of the old one.
   */
  replaceText(sourceFile: ts.SourceFile, start: number, removeLength: number, text: string): void {
    this._trackChange(sourceFile, {start, removeLength, text});
  }

  /**
   * Replaces the text of an AST node with a new one.
   * @param oldNode Node to be replaced.
   * @param newNode New node to be inserted.
   * @param emitHint Hint when formatting the text of the new node.
   * @param sourceFileWhenPrinting File to use when printing out the new node. This is important
   * when copying nodes from one file to another, because TypeScript might not output literal nodes
   * without it.
   */
  replaceNode(
    oldNode: ts.Node,
    newNode: ts.Node,
    emitHint = ts.EmitHint.Unspecified,
    sourceFileWhenPrinting?: ts.SourceFile,
  ): void {
    const sourceFile = oldNode.getSourceFile();
    this.replaceText(
      sourceFile,
      oldNode.getStart(),
      oldNode.getWidth(),
      this._printer.printNode(emitHint, newNode, sourceFileWhenPrinting || sourceFile),
    );
  }

  /**
   * Removes the text of an AST node from a file.
   * @param node Node whose text should be removed.
   * @param useFullOffsets Whether to remove the node using its full offset (e.g. `getFullStart`
   * rather than `fullStart`). This has the advantage of removing any comments that may be tied
   * to the node, but can lead to too much code being deleted.
   */
  removeNode(node: ts.Node, useFullOffsets = false): void {
    this._trackChange(node.getSourceFile(), {
      start: useFullOffsets ? node.getFullStart() : node.getStart(),
      removeLength: useFullOffsets ? node.getFullWidth() : node.getWidth(),
      text: '',
    });
  }

  /**
   * Adds an import to a file.
   * @param sourceFile File to which to add the import.
   * @param symbolName Symbol being imported.
   * @param moduleName Module from which the symbol is imported.
   * @param alias Alias to use for the import.
   */
  addImport(
    sourceFile: ts.SourceFile,
    symbolName: string,
    moduleName: string,
    alias?: string,
  ): ts.Expression {
    if (this._importRemapper) {
      moduleName = this._importRemapper(moduleName, sourceFile.fileName);
    }

    // It's common for paths to be manipulated with Node's `path` utilties which
    // can yield a path with back slashes. Normalize them since outputting such
    // paths will also cause TS to escape the forward slashes.
    moduleName = normalizePath(moduleName);

    if (!this._changes.has(sourceFile)) {
      this._changes.set(sourceFile, []);
    }

    return this._importManager.addImport({
      requestedFile: sourceFile,
      exportSymbolName: symbolName,
      exportModuleSpecifier: moduleName,
      unsafeAliasOverride: alias,
    });
  }

  /**
   * Removes an import from a file.
   * @param sourceFile File from which to remove the import.
   * @param symbolName Original name of the symbol to be removed. Used even if the import is aliased.
   * @param moduleName Module from which the symbol is imported.
   */
  removeImport(sourceFile: ts.SourceFile, symbolName: string, moduleName: string): void {
    // It's common for paths to be manipulated with Node's `path` utilties which
    // can yield a path with back slashes. Normalize them since outputting such
    // paths will also cause TS to escape the forward slashes.
    moduleName = normalizePath(moduleName);

    if (!this._changes.has(sourceFile)) {
      this._changes.set(sourceFile, []);
    }

    this._importManager.removeImport(sourceFile, symbolName, moduleName);
  }

  /**
   * Gets the changes that should be applied to all the files in the migration.
   * The changes are sorted in the order in which they should be applied.
   */
  recordChanges(): ChangesByFile {
    this._recordImports();
    return this._changes;
  }

  /**
   * Clear the tracked changes
   */
  clearChanges(): void {
    this._changes.clear();
  }

  /**
   * Adds a change to a `ChangesByFile` map.
   * @param file File that the change is associated with.
   * @param change Change to be added.
   */
  private _trackChange(file: ts.SourceFile, change: PendingChange): void {
    const changes = this._changes.get(file);

    if (changes) {
      // Insert the changes in reverse so that they're applied in reverse order.
      // This ensures that the offsets of subsequent changes aren't affected by
      // previous changes changing the file's text.
      const insertIndex = changes.findIndex((current) => current.start <= change.start);

      if (insertIndex === -1) {
        changes.push(change);
      } else {
        changes.splice(insertIndex, 0, change);
      }
    } else {
      this._changes.set(file, [change]);
    }
  }

  /** Determines what kind of quotes to use for a specific file. */
  private _getQuoteKind(sourceFile: ts.SourceFile): QuoteKind {
    if (this._quotesCache.has(sourceFile)) {
      return this._quotesCache.get(sourceFile)!;
    }

    let kind = QuoteKind.SINGLE;

    for (const statement of sourceFile.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
        kind = statement.moduleSpecifier.getText()[0] === '"' ? QuoteKind.DOUBLE : QuoteKind.SINGLE;
        this._quotesCache.set(sourceFile, kind);
        break;
      }
    }

    return kind;
  }

  /** Records the pending import changes from the import manager. */
  private _recordImports(): void {
    const {newImports, updatedImports, deletedImports} = this._importManager.finalize();

    for (const [original, replacement] of updatedImports) {
      this.replaceNode(original, replacement);
    }

    for (const node of deletedImports) {
      this.removeNode(node);
    }

    for (const [sourceFile] of this._changes) {
      const importsToAdd = newImports.get(sourceFile.fileName);

      if (!importsToAdd) {
        continue;
      }

      const importLines: string[] = [];
      let lastImport: ts.ImportDeclaration | null = null;

      for (const statement of sourceFile.statements) {
        if (ts.isImportDeclaration(statement)) {
          lastImport = statement;
        }
      }

      for (const decl of importsToAdd) {
        importLines.push(this._printer.printNode(ts.EmitHint.Unspecified, decl, sourceFile));
      }

      this.insertText(
        sourceFile,
        lastImport ? lastImport.getEnd() : 0,
        (lastImport ? '\n' : '') + importLines.join('\n'),
      );
    }
  }
}

/** Normalizes a path to use posix separators. */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}
