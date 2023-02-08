/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscProgram} from '@angular/compiler-cli';
import {dirname, relative} from 'path';
import ts from 'typescript';

import {ImportManager} from '../../utils/import_manager';

/** Mapping between a source file and the changes that have to be applied to it. */
export type ChangesByFile = ReadonlyMap<ts.SourceFile, PendingChange[]>;

/** Map used to look up nodes based on their positions in a source file. */
export type NodeLookup = Map<number, ts.Node[]>;

/** Utility to type a class declaration with a name. */
export type NamedClassDeclaration = ts.ClassDeclaration&{name: ts.Identifier};

/** Function that can be used to remap a generated import. */
export type ImportRemapper = (moduleName: string) => string;

/** Change that needs to be applied to a file. */
interface PendingChange {
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

/** Tracks changes that have to be made for specific files. */
export class ChangeTracker {
  private readonly _changes = new Map<ts.SourceFile, PendingChange[]>();
  private readonly _importManager = new ImportManager(
      currentFile => ({
        addNewImport: (start, text) => this.insertText(currentFile, start, text),
        updateExistingImport: (namedBindings, text) =>
            this.replaceText(currentFile, namedBindings.getStart(), namedBindings.getWidth(), text),
      }),
      this._printer);

  constructor(private _printer: ts.Printer, private _importRemapper?: ImportRemapper) {}

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
      oldNode: ts.Node, newNode: ts.Node, emitHint = ts.EmitHint.Unspecified,
      sourceFileWhenPrinting?: ts.SourceFile): void {
    const sourceFile = oldNode.getSourceFile();
    this.replaceText(
        sourceFile, oldNode.getStart(), oldNode.getWidth(),
        this._printer.printNode(emitHint, newNode, sourceFileWhenPrinting || sourceFile));
  }

  /**
   * Removes the text of an AST node from a file.
   * @param node Node whose text should be removed.
   */
  removeNode(node: ts.Node): void {
    this._trackChange(
        node.getSourceFile(), {start: node.getStart(), removeLength: node.getWidth(), text: ''});
  }

  /**
   * Adds an import to a file.
   * @param sourceFile File to which to add the import.
   * @param symbolName Symbol being imported.
   * @param moduleName Module from which the symbol is imported.
   */
  addImport(
      sourceFile: ts.SourceFile, symbolName: string, moduleName: string,
      alias: string|null = null): ts.Expression {
    if (this._importRemapper) {
      moduleName = this._importRemapper(moduleName);
    }

    // It's common for paths to be manipulated with Node's `path` utilties which
    // can yield a path with back slashes. Normalize them since outputting such
    // paths will also cause TS to escape the forward slashes.
    moduleName = normalizePath(moduleName);

    return this._importManager.addImportToSourceFile(sourceFile, symbolName, moduleName, alias);
  }

  /**
   * Gets the changes that should be applied to all the files in the migration.
   * The changes are sorted in the order in which they should be applied.
   */
  recordChanges(): ChangesByFile {
    this._importManager.recordChanges();
    return this._changes;
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
      const insertIndex = changes.findIndex(current => current.start <= change.start);

      if (insertIndex === -1) {
        changes.push(change);
      } else {
        changes.splice(insertIndex, 0, change);
      }
    } else {
      this._changes.set(file, [change]);
    }
  }
}

/** Utility class used to track a one-to-many relationship where all the items are unique. */
export class UniqueItemTracker<K, V> {
  private _nodes = new Map<K, Set<V>>();

  track(key: K, item: V) {
    const set = this._nodes.get(key);

    if (set) {
      set.add(item);
    } else {
      this._nodes.set(key, new Set([item]));
    }
  }

  getEntries(): IterableIterator<[K, Set<V>]> {
    return this._nodes.entries();
  }
}


/**
 * Creates a TypeScript language service.
 * @param program Program used to analyze the project.
 * @param host Compiler host used to interact with the file system.
 * @param rootFileNames Root files of the project.
 * @param basePath Root path of the project.
 */
export function createLanguageService(
    program: NgtscProgram, host: ts.CompilerHost, rootFileNames: string[],
    basePath: string): ts.LanguageService {
  return ts.createLanguageService({
    getCompilationSettings: () => program.getTsProgram().getCompilerOptions(),
    getScriptFileNames: () => rootFileNames,
    getScriptVersion: () => '0',  // The files won't change so we can return the same version.
    getScriptSnapshot: (fileName: string) => {
      const content = host.readFile(fileName);
      return content ? ts.ScriptSnapshot.fromString(content) : undefined;
    },
    getCurrentDirectory: () => basePath,
    getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
    readFile: (path: string) => host.readFile(path),
    fileExists: (path: string) => host.fileExists(path)
  });
}

/** Creates a NodeLookup object from a source file. */
export function getNodeLookup(sourceFile: ts.SourceFile): NodeLookup {
  const lookup: NodeLookup = new Map();

  sourceFile.forEachChild(function walk(node) {
    const nodesAtStart = lookup.get(node.getStart());

    if (nodesAtStart) {
      nodesAtStart.push(node);
    } else {
      lookup.set(node.getStart(), [node]);
    }

    node.forEachChild(walk);
  });

  return lookup;
}

/**
 * Converts node offsets to the nodes they correspond to.
 * @param lookup Data structure used to look up nodes at particular positions.
 * @param offsets Offsets of the nodes.
 * @param results Set in which to store the results.
 */
export function offsetsToNodes(
    lookup: NodeLookup, offsets: [start: number, end: number][],
    results: Set<ts.Node>): Set<ts.Node> {
  for (const [start, end] of offsets) {
    const match = lookup.get(start)?.find(node => node.getEnd() === end);

    if (match) {
      results.add(match);
    }
  }

  return results;
}

/**
 * Finds the class declaration that is being referred to by a node.
 * @param reference Node referring to a class declaration.
 * @param typeChecker
 */
export function findClassDeclaration(
    reference: ts.Node, typeChecker: ts.TypeChecker): ts.ClassDeclaration|null {
  return typeChecker.getTypeAtLocation(reference).getSymbol()?.declarations?.find(
             ts.isClassDeclaration) ||
      null;
}

/** Finds a property with a specific name in an object literal expression. */
export function findLiteralProperty(literal: ts.ObjectLiteralExpression, name: string) {
  return literal.properties.find(
      prop => prop.name && ts.isIdentifier(prop.name) && prop.name.text === name);
}

/** Gets a relative path between two files that can be used inside a TypeScript import. */
export function getRelativeImportPath(fromFile: string, toFile: string): string {
  let path = relative(dirname(fromFile), toFile).replace(/\.ts$/, '');

  // `relative` returns paths inside the same directory without `./`
  if (!path.startsWith('.')) {
    path = './' + path;
  }

  // Using the Node utilities can yield paths with forward slashes on Windows.
  return normalizePath(path);
}

/** Normalizes a path to use posix separators. */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}
