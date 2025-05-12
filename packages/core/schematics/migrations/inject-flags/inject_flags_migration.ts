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
  ProgramInfo,
  ProjectFile,
  projectFile,
  ProjectFileID,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {ImportManager} from '@angular/compiler-cli/private/migrations';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {getImportSpecifier} from '../../utils/typescript/imports';

export interface CompilationUnitData {
  /** Tracks information about `InjectFlags` binary expressions and how they should be replaced. */
  locations: Record<NodeID, ReplacementLocation>;

  /** Tracks files and their import removal replacements, */
  importRemovals: Record<ProjectFileID, Replacement[]>;
}

/** Information about a single `InjectFlags` expression. */
interface ReplacementLocation {
  /** File in which the expression is defined. */
  file: ProjectFile;

  /** `InjectFlags` used in the expression. */
  flags: string[];

  /** Start of the expression. */
  position: number;

  /** End of the expression. */
  end: number;
}

/** Mapping between `InjectFlag` enum members to their object literal equvalients. */
const FLAGS_TO_FIELDS: Record<string, string> = {
  'Default': 'default',
  'Host': 'host',
  'Optional': 'optional',
  'Self': 'self',
  'SkipSelf': 'skipSelf',
};

/** ID of a node based on its location. */
type NodeID = string & {__nodeID: true};

/** Migration that replaces `InjectFlags` usages with object literals. */
export class InjectFlagsMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const locations: Record<NodeID, ReplacementLocation> = {};
    const importRemovals: Record<ProjectFileID, Replacement[]> = {};

    for (const sourceFile of info.sourceFiles) {
      const specifier = getImportSpecifier(sourceFile, '@angular/core', 'InjectFlags');

      if (specifier === null) {
        continue;
      }

      const file = projectFile(sourceFile, info);
      const importManager = new ImportManager();
      const importReplacements: Replacement[] = [];

      // Always remove the `InjectFlags` since it has been removed from Angular.
      // Note that it be better to do this inside of `migrate`, but we don't have AST access there.
      importManager.removeImport(sourceFile, 'InjectFlags', '@angular/core');
      applyImportManagerChanges(importManager, importReplacements, [sourceFile], info);
      importRemovals[file.id] = importReplacements;

      sourceFile.forEachChild(function walk(node) {
        if (
          // Note: we don't use the type checker for matching here, because
          // the `InjectFlags` will be removed which can break the lookup.
          ts.isPropertyAccessExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === specifier.name.text &&
          FLAGS_TO_FIELDS.hasOwnProperty(node.name.text)
        ) {
          const root = getInjectFlagsRootExpression(node);

          if (root !== null) {
            const flagName = FLAGS_TO_FIELDS[node.name.text];
            const id = getNodeID(file, root);
            locations[id] ??= {file, flags: [], position: root.getStart(), end: root.getEnd()};

            // The flags can't be a set here, because they need to be serializable.
            if (!locations[id].flags.includes(flagName)) {
              locations[id].flags.push(flagName);
            }
          }
        } else {
          node.forEachChild(walk);
        }
      });
    }

    return confirmAsSerializable({locations, importRemovals});
  }

  override async migrate(globalData: CompilationUnitData) {
    const replacements: Replacement[] = [];

    for (const removals of Object.values(globalData.importRemovals)) {
      replacements.push(...removals);
    }

    for (const {file, position, end, flags} of Object.values(globalData.locations)) {
      // Declare a property for each flag, except for `default` which does not have a flag.
      const properties = flags.filter((flag) => flag !== 'default').map((flag) => `${flag}: true`);
      const toInsert = properties.length ? `{ ${properties.join(', ')} }` : '{}';
      replacements.push(new Replacement(file, new TextUpdate({position, end, toInsert})));
    }

    return confirmAsSerializable({replacements});
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable({
      locations: {
        ...unitA.locations,
        ...unitB.locations,
      },
      importRemovals: {
        ...unitA.importRemovals,
        ...unitB.importRemovals,
      },
    });
  }

  override async globalMeta(
    combinedData: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable(combinedData);
  }

  override async stats() {
    return confirmAsSerializable({});
  }
}

/** Gets an ID that can be used to look up a node based on its location. */
function getNodeID(file: ProjectFile, node: ts.Node): NodeID {
  return `${file.id}/${node.getStart()}/${node.getWidth()}` as NodeID;
}

/**
 * Gets the root expression of an `InjectFlags` usage. For example given `InjectFlags.Optional`.
 * in `InjectFlags.Host | InjectFlags.Optional | InjectFlags.SkipSelf`, the function will return
 * the top-level binary expression.
 * @param start Node from which to start searching.
 */
function getInjectFlagsRootExpression(start: ts.Expression): ts.Expression | null {
  let current = start as ts.Node | undefined;
  let parent = current?.parent;

  while (parent && (ts.isBinaryExpression(parent) || ts.isParenthesizedExpression(parent))) {
    current = parent;
    parent = current.parent;
  }

  // Only allow allow expressions that are call parameters, variable initializer or parameter
  // initializers which are the only officially supported usages of `InjectFlags`.
  if (
    current &&
    parent &&
    ((ts.isCallExpression(parent) && parent.arguments.includes(current as ts.Expression)) ||
      (ts.isVariableDeclaration(parent) && parent.initializer === current) ||
      (ts.isParameter(parent) && parent.initializer === current))
  ) {
    return current as ts.Expression;
  }

  return null;
}
