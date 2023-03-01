/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscProgram} from '@angular/compiler-cli';
import {PotentialImport} from '@angular/compiler-cli/private/migrations';
import {dirname, relative} from 'path';
import ts from 'typescript';

import {ImportManager} from '../../utils/import_manager';
import {closestNode} from '../../utils/typescript/nodes';

/** Mapping between a source file and the changes that have to be applied to it. */
export type ChangesByFile = ReadonlyMap<ts.SourceFile, PendingChange[]>;

/** Map used to look up nodes based on their positions in a source file. */
export type NodeLookup = Map<number, ts.Node[]>;

/** Utility to type a class declaration with a name. */
export type NamedClassDeclaration = ts.ClassDeclaration&{name: ts.Identifier};

/** Function that can be used to remap a generated import. */
export type ImportRemapper = (moduleName: string) => string;

/** Text span of an AST node. */
export type ReferenceSpan = [start: number, end: number];

/** Mapping between a file name and spans for node references inside of it. */
export type ReferencesByFile = Map<string, ReferenceSpan[]>;

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

  get(key: K): Set<V>|undefined {
    return this._nodes.get(key);
  }

  getEntries(): IterableIterator<[K, Set<V>]> {
    return this._nodes.entries();
  }
}

/** Resolves references to nodes. */
export class ReferenceResolver {
  private _languageService: ts.LanguageService|undefined;

  /**
   * If set, allows the language service to *only* read a specific file.
   * Used to speed up single-file lookups.
   */
  private _tempOnlyFile: string|null = null;

  constructor(
      private _program: NgtscProgram, private _host: ts.CompilerHost,
      private _rootFileNames: string[], private _basePath: string,
      private _excludedFiles?: RegExp) {}

  /** Finds all references to a node within the entire project. */
  findReferencesInProject(node: ts.Node): ReferencesByFile {
    const languageService = this._getLanguageService();
    const fileName = node.getSourceFile().fileName;
    const start = node.getStart();
    let referencedSymbols: ts.ReferencedSymbol[];

    // The language service can throw if it fails to read a file.
    // Silently continue since we're making the lookup on a best effort basis.
    try {
      referencedSymbols = languageService.findReferences(fileName, start) || [];
    } catch (e: any) {
      console.error('Failed reference lookup for node ' + node.getText(), e.message);
      referencedSymbols = [];
    }

    const results: ReferencesByFile = new Map();

    for (const symbol of referencedSymbols) {
      for (const ref of symbol.references) {
        if (!ref.isDefinition || symbol.definition.kind === ts.ScriptElementKind.alias) {
          if (!results.has(ref.fileName)) {
            results.set(ref.fileName, []);
          }

          results.get(ref.fileName)!.push(
              [ref.textSpan.start, ref.textSpan.start + ref.textSpan.length]);
        }
      }
    }

    return results;
  }

  /** Finds all references to a node within a single file. */
  findSameFileReferences(node: ts.Node, fileName: string): ReferenceSpan[] {
    // Even though we're only passing in a single file into `getDocumentHighlights`, the language
    // service ends up traversing the entire project. Prevent it from reading any files aside from
    // the one we're interested in by intercepting it at the compiler host level.
    // This is an order of magnitude faster on a large project.
    this._tempOnlyFile = fileName;

    const nodeStart = node.getStart();
    const results: ReferenceSpan[] = [];
    let highlights: ts.DocumentHighlights[]|undefined;

    // The language service can throw if it fails to read a file.
    // Silently continue since we're making the lookup on a best effort basis.
    try {
      highlights =
          this._getLanguageService().getDocumentHighlights(fileName, nodeStart, [fileName]);
    } catch (e: any) {
      console.error('Failed reference lookup for node ' + node.getText(), e.message);
    }

    if (highlights) {
      for (const file of highlights) {
        // We are pretty much guaranteed to only have one match from the current file since it is
        // the only one being passed in `getDocumentHighlight`, but we check here just in case.
        if (file.fileName === fileName) {
          for (const {textSpan: {start, length}, kind} of file.highlightSpans) {
            if (kind !== ts.HighlightSpanKind.none) {
              results.push([start, start + length]);
            }
          }
        }
      }
    }

    // Restore full project access to the language service.
    this._tempOnlyFile = null;
    return results;
  }

  /** Used by the language service  */
  private _readFile(path: string) {
    if ((this._tempOnlyFile !== null && path !== this._tempOnlyFile) ||
        this._excludedFiles?.test(path)) {
      return '';
    }
    return this._host.readFile(path);
  }

  /** Gets a language service that can be used to perform lookups. */
  private _getLanguageService(): ts.LanguageService {
    if (!this._languageService) {
      const rootFileNames = this._rootFileNames.slice();

      this._program.getTsProgram().getSourceFiles().forEach(({fileName}) => {
        if (!this._excludedFiles?.test(fileName) && !rootFileNames.includes(fileName)) {
          rootFileNames.push(fileName);
        }
      });

      this._languageService = ts.createLanguageService(
          {
            getCompilationSettings: () => this._program.getTsProgram().getCompilerOptions(),
            getScriptFileNames: () => rootFileNames,
            // The files won't change so we can return the same version.
            getScriptVersion: () => '0',
            getScriptSnapshot: (path: string) => {
              const content = this._readFile(path);
              return content ? ts.ScriptSnapshot.fromString(content) : undefined;
            },
            getCurrentDirectory: () => this._basePath,
            getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
            readFile: path => this._readFile(path),
            fileExists: (path: string) => this._host.fileExists(path)
          },
          ts.createDocumentRegistry(), ts.LanguageServiceMode.PartialSemantic);
    }

    return this._languageService;
  }
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
    lookup: NodeLookup, offsets: ReferenceSpan[], results: Set<ts.Node>): Set<ts.Node> {
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

/** Function used to remap the generated `imports` for a component to known shorter aliases. */
export function knownInternalAliasRemapper(imports: PotentialImport[]) {
  return imports.map(
      current => current.moduleSpecifier === '@angular/common' && current.symbolName === 'NgForOf' ?
          {...current, symbolName: 'NgFor'} :
          current);
}

/**
 * Gets the closest node that matches a predicate, including the node that the search started from.
 * @param node Node from which to start the search.
 * @param predicate Predicate that the result needs to pass.
 */
export function closestOrSelf<T extends ts.Node>(
    node: ts.Node, predicate: (n: ts.Node) => n is T): T|null {
  return predicate(node) ? node : closestNode(node, predicate);
}

/**
 * Checks whether a node is referring to a specific class declaration.
 * @param node Node that is being checked.
 * @param className Name of the class that the node might be referring to.
 * @param moduleName Name of the Angular module that should contain the class.
 * @param typeChecker
 */
export function isClassReferenceInAngularModule(
    node: ts.Node, className: string|RegExp, moduleName: string,
    typeChecker: ts.TypeChecker): boolean {
  const symbol = typeChecker.getTypeAtLocation(node).getSymbol();
  const externalName = `@angular/${moduleName}`;
  const internalName = `angular2/rc/packages/${moduleName}`;

  return !!symbol?.declarations?.some(decl => {
    const closestClass = closestOrSelf(decl, ts.isClassDeclaration);
    const closestClassFileName = closestClass?.getSourceFile().fileName;

    if (!closestClass || !closestClassFileName || !closestClass.name ||
        !ts.isIdentifier(closestClass.name) ||
        (!closestClassFileName.includes(externalName) &&
         !closestClassFileName.includes(internalName))) {
      return false;
    }

    return typeof className === 'string' ? closestClass.name.text === className :
                                           className.test(closestClass.name.text);
  });
}
