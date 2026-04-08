/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ImportManager} from '@angular/compiler-cli/private/migrations';
import ts from 'typescript';
import {
  confirmAsSerializable,
  ProgramInfo,
  projectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';

export interface IncrementalHydrationMigrationData {
  replacements: Replacement[];
}

export class IncrementalHydrationMigration extends TsurgeFunnelMigration<
  IncrementalHydrationMigrationData,
  IncrementalHydrationMigrationData
> {
  override async analyze(
    info: ProgramInfo,
  ): Promise<Serializable<IncrementalHydrationMigrationData>> {
    const {sourceFiles, program} = info;
    const typeChecker = program.getTypeChecker();
    const replacements: Replacement[] = [];
    const importManager = new ImportManager();
    const printer = ts.createPrinter();

    for (const sf of sourceFiles) {
      ts.forEachChild(sf, function visit(node: ts.Node) {
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'provideClientHydration'
        ) {
          let hasIncremental = false;
          let incrementalArgNode: ts.CallExpression | null = null;

          for (const arg of node.arguments) {
            if (
              ts.isCallExpression(arg) &&
              ts.isIdentifier(arg.expression) &&
              arg.expression.text === 'withIncrementalHydration'
            ) {
              hasIncremental = true;
              incrementalArgNode = arg;
              break;
            }
          }

          if (!hasIncremental) {
            // Add withNoIncrementalHydration()
            const withNoIncrementalExpr = importManager.addImport({
              exportModuleSpecifier: '@angular/platform-browser',
              exportSymbolName: 'withNoIncrementalHydration',
              requestedFile: sf,
            });

            const exprText = printer.printNode(ts.EmitHint.Unspecified, withNoIncrementalExpr, sf);

            const insertPos = node.arguments.end;
            const toInsert = node.arguments.length > 0 ? `, ${exprText}()` : `${exprText}()`;

            replacements.push(
              new Replacement(
                projectFile(sf, info),
                new TextUpdate({
                  position: insertPos,
                  end: insertPos,
                  toInsert: toInsert,
                }),
              ),
            );
          }
        }
        ts.forEachChild(node, visit);
      });
    }

    applyImportManagerChanges(importManager, replacements, sourceFiles, info);

    return confirmAsSerializable({
      replacements,
    });
  }

  override async combine(
    unitA: IncrementalHydrationMigrationData,
    unitB: IncrementalHydrationMigrationData,
  ): Promise<Serializable<IncrementalHydrationMigrationData>> {
    return confirmAsSerializable({
      replacements: [...unitA.replacements, ...unitB.replacements],
    });
  }

  override async globalMeta(
    combinedData: IncrementalHydrationMigrationData,
  ): Promise<Serializable<IncrementalHydrationMigrationData>> {
    return confirmAsSerializable(combinedData);
  }

  override async stats(
    globalMetadata: IncrementalHydrationMigrationData,
  ): Promise<Serializable<unknown>> {
    return confirmAsSerializable({});
  }

  override async migrate(
    globalData: IncrementalHydrationMigrationData,
  ): Promise<{replacements: Replacement[]}> {
    return {replacements: globalData.replacements};
  }
}
