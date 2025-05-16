/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {
  confirmAsSerializable,
  MigrationStats,
  ProgramInfo,
  projectFile,
  ProjectFileID,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {ErrorCode, FileSystem, ngErrorCode} from '@angular/compiler-cli';
import {DiagnosticCategoryLabel, NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {ImportManager} from '@angular/compiler-cli/private/migrations';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';

/** Data produced by the migration for each compilation unit. */
export interface CompilationUnitData {
  /** Text changes that should be performed. */
  replacements: Replacement[];

  /** Identifiers that have been removed from each file. */
  removedIdentifiers: NodeID[];

  /** Total number of files that were changed. */
  changedFiles: number;
}

/** Tracks the places from which to remove unused imports. */
interface RemovalLocations {
  /** Arrays whose entire contents should be cleared. */
  fullRemovals: Set<ts.ArrayLiteralExpression>;

  /** Arrays where only some elements need to be removed. */
  partialRemovals: Map<ts.ArrayLiteralExpression, Set<ts.Expression>>;

  /** Text of all identifiers that have been removed. */
  allRemovedIdentifiers: Set<ts.Identifier>;
}

/** Tracks how identifiers are used across a single file. */
interface UsageAnalysis {
  /**
   * Data about the symbols imported into the file. The key here is the module from which each
   * symbol is imported. Each module contains a map between a local symbol name within the file
   * and its original name.
   */
  importedSymbols: Map<string, Map<string, string>>;

  /** Number of times each identifier string is seen within a file. */
  identifierCounts: Map<string, number>;
}

/** ID of a node based on its location. */
type NodeID = string & {__nodeID: true};

/** Migration that cleans up unused imports from a project. */
export class UnusedImportsMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  private printer = ts.createPrinter();

  override createProgram(tsconfigAbsPath: string, fs: FileSystem): ProgramInfo {
    return super.createProgram(tsconfigAbsPath, fs, {
      extendedDiagnostics: {
        checks: {
          // Ensure that the diagnostic is enabled.
          unusedStandaloneImports: DiagnosticCategoryLabel.Warning,
        },
      },
    });
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const nodePositions = new Map<ts.SourceFile, Set<string>>();
    const replacements: Replacement[] = [];
    const removedIdentifiers: NodeID[] = [];
    let changedFiles = 0;

    info.ngCompiler?.getDiagnostics().forEach((diag) => {
      if (
        diag.file !== undefined &&
        diag.start !== undefined &&
        diag.length !== undefined &&
        diag.code === ngErrorCode(ErrorCode.UNUSED_STANDALONE_IMPORTS)
      ) {
        // Skip files that aren't owned by this compilation unit.
        if (!info.sourceFiles.includes(diag.file)) {
          return;
        }

        if (!nodePositions.has(diag.file)) {
          nodePositions.set(diag.file, new Set());
        }
        nodePositions.get(diag.file)!.add(this.getNodeID(diag.start, diag.length));
      }
    });

    nodePositions.forEach((locations, sourceFile) => {
      const resolvedLocations = this.resolveRemovalLocations(sourceFile, locations);
      const usageAnalysis = this.analyzeUsages(sourceFile, resolvedLocations);

      if (resolvedLocations.allRemovedIdentifiers.size > 0) {
        changedFiles++;
        resolvedLocations.allRemovedIdentifiers.forEach((identifier) => {
          removedIdentifiers.push(this.getNodeID(identifier.getStart(), identifier.getWidth()));
        });
      }
      this.generateReplacements(sourceFile, resolvedLocations, usageAnalysis, info, replacements);
    });

    return confirmAsSerializable({replacements, removedIdentifiers, changedFiles});
  }

  override async migrate(globalData: CompilationUnitData) {
    return confirmAsSerializable(globalData);
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const combinedReplacements: Replacement[] = [];
    const combinedRemovedIdentifiers: NodeID[] = [];
    const seenReplacements = new Set<string>();
    const seenIdentifiers = new Set<NodeID>();
    const changedFileIds = new Set<ProjectFileID>();

    [unitA, unitB].forEach((unit) => {
      for (const replacement of unit.replacements) {
        const key = this.getReplacementID(replacement);
        changedFileIds.add(replacement.projectFile.id);
        if (!seenReplacements.has(key)) {
          seenReplacements.add(key);
          combinedReplacements.push(replacement);
        }
      }

      for (const identifier of unit.removedIdentifiers) {
        if (!seenIdentifiers.has(identifier)) {
          seenIdentifiers.add(identifier);
          combinedRemovedIdentifiers.push(identifier);
        }
      }
    });

    return confirmAsSerializable({
      replacements: combinedReplacements,
      removedIdentifiers: combinedRemovedIdentifiers,
      changedFiles: changedFileIds.size,
    });
  }

  override async globalMeta(
    combinedData: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable(combinedData);
  }

  override async stats(globalMetadata: CompilationUnitData): Promise<MigrationStats> {
    return {
      counters: {
        removedImports: globalMetadata.removedIdentifiers.length,
        changedFiles: globalMetadata.changedFiles,
      },
    };
  }

  /** Gets an ID that can be used to look up a node based on its location. */
  private getNodeID(start: number, length: number): NodeID {
    return `${start}/${length}` as NodeID;
  }

  /** Gets a unique ID for a replacement. */
  private getReplacementID(replacement: Replacement): string {
    const {position, end, toInsert} = replacement.update.data;
    return replacement.projectFile.id + '/' + position + '/' + end + '/' + toInsert;
  }

  /**
   * Resolves a set of node locations to the actual AST nodes that need to be migrated.
   * @param sourceFile File in which to resolve the locations.
   * @param locations Location keys that should be resolved.
   */
  private resolveRemovalLocations(
    sourceFile: ts.SourceFile,
    locations: Set<string>,
  ): RemovalLocations {
    const result: RemovalLocations = {
      fullRemovals: new Set(),
      partialRemovals: new Map(),
      allRemovedIdentifiers: new Set(),
    };

    const walk = (node: ts.Node) => {
      if (!ts.isIdentifier(node)) {
        node.forEachChild(walk);
        return;
      }

      // The TS typings don't reflect that the parent can be undefined.
      const parent = node.parent as ts.Node | undefined;

      if (!parent) {
        return;
      }

      if (locations.has(this.getNodeID(node.getStart(), node.getWidth()))) {
        // When the entire array needs to be cleared, the diagnostic is
        // reported on the property assignment, rather than an array element.
        if (
          ts.isPropertyAssignment(parent) &&
          parent.name === node &&
          ts.isArrayLiteralExpression(parent.initializer)
        ) {
          result.fullRemovals.add(parent.initializer);
          parent.initializer.elements.forEach((element) => {
            if (ts.isIdentifier(element)) {
              result.allRemovedIdentifiers.add(element);
            }
          });
        } else if (ts.isArrayLiteralExpression(parent)) {
          if (!result.partialRemovals.has(parent)) {
            result.partialRemovals.set(parent, new Set());
          }
          result.partialRemovals.get(parent)!.add(node);
          result.allRemovedIdentifiers.add(node);
        }
      }
    };

    walk(sourceFile);

    return result;
  }

  /**
   * Analyzes how identifiers are used across a file.
   * @param sourceFile File to be analyzed.
   * @param locations Locations that will be changed as a part of this migration.
   */
  private analyzeUsages(sourceFile: ts.SourceFile, locations: RemovalLocations): UsageAnalysis {
    const {partialRemovals, fullRemovals} = locations;
    const result: UsageAnalysis = {
      importedSymbols: new Map(),
      identifierCounts: new Map(),
    };

    const walk = (node: ts.Node) => {
      if (
        ts.isIdentifier(node) &&
        node.parent &&
        // Don't track individual identifiers marked for removal.
        (!ts.isArrayLiteralExpression(node.parent) ||
          !partialRemovals.has(node.parent) ||
          !partialRemovals.get(node.parent)!.has(node))
      ) {
        result.identifierCounts.set(node.text, (result.identifierCounts.get(node.text) ?? 0) + 1);
      }

      // Don't track identifiers in array literals that are about to be removed.
      if (ts.isArrayLiteralExpression(node) && fullRemovals.has(node)) {
        return;
      }

      if (ts.isImportDeclaration(node)) {
        const namedBindings = node.importClause?.namedBindings;
        const moduleName = ts.isStringLiteral(node.moduleSpecifier)
          ? node.moduleSpecifier.text
          : null;

        if (namedBindings && ts.isNamedImports(namedBindings) && moduleName !== null) {
          namedBindings.elements.forEach((imp) => {
            if (!result.importedSymbols.has(moduleName)) {
              result.importedSymbols.set(moduleName, new Map());
            }
            const symbolName = (imp.propertyName || imp.name).text;
            const localName = imp.name.text;
            result.importedSymbols.get(moduleName)!.set(localName, symbolName);
          });
        }

        // Don't track identifiers in imports.
        return;
      }

      // Track identifiers in all other node kinds.
      node.forEachChild(walk);
    };

    walk(sourceFile);

    return result;
  }

  /**
   * Generates text replacements based on the data produced by the migration.
   * @param sourceFile File being migrated.
   * @param removalLocations Data about nodes being removed.
   * @param usages Data about identifier usage.
   * @param info Information about the current program.
   * @param replacements Array tracking all text replacements.
   */
  private generateReplacements(
    sourceFile: ts.SourceFile,
    removalLocations: RemovalLocations,
    usages: UsageAnalysis,
    info: ProgramInfo,
    replacements: Replacement[],
  ): void {
    const {fullRemovals, partialRemovals, allRemovedIdentifiers} = removalLocations;
    const {importedSymbols, identifierCounts} = usages;
    const importManager = new ImportManager();

    // Replace full arrays with empty ones. This allows preserves more of the user's formatting.
    fullRemovals.forEach((node) => {
      replacements.push(
        new Replacement(
          projectFile(sourceFile, info),
          new TextUpdate({
            position: node.getStart(),
            end: node.getEnd(),
            toInsert: '[]',
          }),
        ),
      );
    });

    // Filter out the unused identifiers from an array.
    partialRemovals.forEach((toRemove, node) => {
      const newNode = ts.factory.updateArrayLiteralExpression(
        node,
        node.elements.filter((el) => !toRemove.has(el)),
      );

      replacements.push(
        new Replacement(
          projectFile(sourceFile, info),
          new TextUpdate({
            position: node.getStart(),
            end: node.getEnd(),
            toInsert: this.printer.printNode(ts.EmitHint.Unspecified, newNode, sourceFile),
          }),
        ),
      );
    });

    // Attempt to clean up unused import declarations. Note that this isn't foolproof, because we
    // do the matching based on identifier text, rather than going through the type checker which
    // can be expensive. This should be enough for the vast majority of cases in this schematic
    // since we're dealing exclusively with directive/pipe class names which tend to be very
    // specific. In the worst case we may end up not removing an import declaration which would
    // still be valid code that the user can clean up themselves.
    importedSymbols.forEach((names, moduleName) => {
      names.forEach((symbolName, localName) => {
        // Note that in the `identifierCounts` lookup both zero and undefined
        // are valid and mean that the identifiers isn't being used anymore.
        if (!identifierCounts.get(localName)) {
          for (const identifier of allRemovedIdentifiers) {
            if (identifier.text === localName) {
              importManager.removeImport(sourceFile, symbolName, moduleName);
              break;
            }
          }
        }
      });
    });

    applyImportManagerChanges(importManager, replacements, [sourceFile], info);
  }
}
