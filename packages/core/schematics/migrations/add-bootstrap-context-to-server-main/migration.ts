/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ImportManager} from '@angular/compiler-cli/private/migrations';
import ts from 'typescript';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {
  confirmAsSerializable,
  ProgramInfo,
  Replacement,
  Serializable,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {TextUpdate} from '../../utils/tsurge/replacement';
import {projectFile} from '../../utils/tsurge/project_paths';

export interface CompilationUnitData {
  replacements: Replacement[];
}

function findArrowFunction(node: ts.Node): ts.ArrowFunction | undefined {
  let current: ts.Node | undefined = node;
  while (current) {
    if (ts.isArrowFunction(current)) {
      return current;
    }
    current = current.parent;
  }
  return undefined;
}

export class AddBootstrapContextToServerMainMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const replacements: Replacement[] = [];
    let importManager: ImportManager | null = null;

    for (const sourceFile of info.sourceFiles) {
      if (!sourceFile.fileName.endsWith('main.server.ts')) {
        continue;
      }

      const bootstrapAppCalls: ts.CallExpression[] = [];
      ts.forEachChild(sourceFile, function findCalls(node) {
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'bootstrapApplication' &&
          node.arguments.length < 3
        ) {
          bootstrapAppCalls.push(node);
        }
        ts.forEachChild(node, findCalls);
      });

      if (bootstrapAppCalls.length === 0) {
        continue;
      }

      for (const node of bootstrapAppCalls) {
        const end = node.arguments[node.arguments.length - 1].getEnd();
        replacements.push(
          new Replacement(
            projectFile(sourceFile, info),
            new TextUpdate({
              position: end,
              end: end,
              toInsert: ', context',
            }),
          ),
        );

        const arrowFunction = findArrowFunction(node);
        if (arrowFunction && arrowFunction.parameters.length === 0) {
          replacements.push(
            new Replacement(
              projectFile(sourceFile, info),
              new TextUpdate({
                position: arrowFunction.parameters.end,
                end: arrowFunction.parameters.end,
                toInsert: 'context: BootstrapContext',
              }),
            ),
          );
        }
      }

      importManager ??= new ImportManager({
        generateUniqueIdentifier: () => null,
        shouldUseSingleQuotes: () => true,
      });

      importManager.addImport({
        exportSymbolName: 'BootstrapContext',
        exportModuleSpecifier: '@angular/platform-browser',
        requestedFile: sourceFile,
      });
    }

    if (importManager !== null) {
      applyImportManagerChanges(importManager, replacements, info.sourceFiles, info);
    }

    return confirmAsSerializable({replacements});
  }

  override async migrate(globalData: CompilationUnitData) {
    return confirmAsSerializable(globalData);
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const seen = new Set<string>();
    const combined: Replacement[] = [];

    [unitA.replacements, unitB.replacements].forEach((replacements) => {
      replacements.forEach((current) => {
        const {position, end, toInsert} = current.update.data;
        const key = current.projectFile.id + '/' + position + '/' + end + '/' + toInsert;

        if (!seen.has(key)) {
          seen.add(key);
          combined.push(current);
        }
      });
    });

    return confirmAsSerializable({replacements: combined});
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
