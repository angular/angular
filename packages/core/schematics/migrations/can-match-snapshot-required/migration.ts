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
  projectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';

export interface UnitAnalysisMetadata {
  replacements: Replacement[];
}

export class CanMatchSnapshotRequiredMigration extends TsurgeFunnelMigration<
  UnitAnalysisMetadata,
  UnitAnalysisMetadata
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<UnitAnalysisMetadata>> {
    const replacements: Replacement[] = [];
    const {sourceFiles, program} = info;
    const typeChecker = program.getTypeChecker();

    for (const sourceFile of sourceFiles) {
      const walk = (node: ts.Node): void => {
        ts.forEachChild(node, walk);

        if (ts.isCallExpression(node)) {
          let shouldMigrate = false;

          // 1. Method calls objective: obj.canMatch(a, b)
          if (
            ts.isPropertyAccessExpression(node.expression) &&
            node.expression.name.text === 'canMatch'
          ) {
            const type = typeChecker.getTypeAtLocation(node.expression.expression);
            const classSymbol = type.getSymbol();
            if (classSymbol && classSymbol.declarations) {
              const decl = classSymbol.declarations[0];
              if (ts.isClassDeclaration(decl)) {
                if (implementsInterface(decl, 'CanMatch')) {
                  shouldMigrate = true;
                }
              }
            }
          }

          // 2. Function calls objective: canMatch(a, b)
          if (ts.isIdentifier(node.expression) && node.expression.text === 'canMatch') {
            const type = typeChecker.getTypeAtLocation(node.expression);
            const typeStr = typeChecker.typeToString(type);
            if (typeStr.includes('CanMatchFn')) {
              shouldMigrate = true;
            }
          }

          if (shouldMigrate && node.arguments.length === 2) {
            const lastArg = node.arguments[1];
            replacements.push(
              new Replacement(
                projectFile(sourceFile, info),
                new TextUpdate({
                  position: lastArg.getEnd(),
                  end: lastArg.getEnd(),
                  toInsert: ', {} as any /* added by migration */',
                }),
              ),
            );
          }
        }
      };

      ts.forEachChild(sourceFile, walk);
    }

    return confirmAsSerializable({replacements});
  }

  override async combine(
    unitA: UnitAnalysisMetadata,
    unitB: UnitAnalysisMetadata,
  ): Promise<Serializable<UnitAnalysisMetadata>> {
    return confirmAsSerializable({
      replacements: [...unitA.replacements, ...unitB.replacements],
    });
  }

  override async globalMeta(
    combinedData: UnitAnalysisMetadata,
  ): Promise<Serializable<UnitAnalysisMetadata>> {
    return confirmAsSerializable(combinedData);
  }

  override async stats(globalMetadata: UnitAnalysisMetadata): Promise<Serializable<unknown>> {
    return confirmAsSerializable({});
  }

  override async migrate(globalData: UnitAnalysisMetadata): Promise<{replacements: Replacement[]}> {
    return {replacements: globalData.replacements};
  }
}

function implementsInterface(decl: ts.ClassDeclaration, interfaceName: string): boolean {
  if (!decl.heritageClauses) return false;

  for (const clause of decl.heritageClauses) {
    if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
      for (const expr of clause.types) {
        if (ts.isIdentifier(expr.expression) && expr.expression.text === interfaceName) {
          return true;
        }
      }
    }
  }

  return false;
}
