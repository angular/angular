/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  confirmAsSerializable,
  ProgramInfo,
  projectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import ts from 'typescript';

export interface CompilationUnitData {
  replacements: Replacement[];
}

/** Migration that replaces invocations on EventEmitters with invocations on Subject on NgZone instances */
export class NgZoneEventEmitterMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const replacements: Replacement[] = [];

    for (const sourceFile of info.sourceFiles) {
      const typeChecker = info.program.getTypeChecker();
      sourceFile.forEachChild(function walk(node) {
        if (ts.isCallExpression(node)) {
          const expression = node.expression;

          if (ts.isPropertyAccessExpression(expression) && expression.name.text === 'emit') {
            const target = expression.expression;
            const targetType = typeChecker.getTypeAtLocation(target);
            const targetSymbol = targetType.getSymbol();

            if (targetSymbol && targetSymbol?.name === 'EventEmitter') {
              const ngZoneType = typeChecker.getTypeAtLocation(
                (target as ts.PropertyAccessExpression).expression,
              );
              if (isNgZoneOrSubclass(ngZoneType, typeChecker)) {
                replacements.push({
                  projectFile: projectFile(sourceFile, info),
                  update: new TextUpdate({
                    position: expression.name.getStart(),
                    end: expression.name.getEnd(),
                    toInsert: `next`,
                  }),
                });
              }
            }
          }
        }
        node.forEachChild(walk);
      });
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

function isNgZoneOrSubclass(type: ts.Type, typeChecker: ts.TypeChecker): boolean {
  if (type.symbol?.name === 'NgZone') {
    return true;
  }

  if (type.symbol) {
    const baseTypes = typeChecker.getDeclaredTypeOfSymbol(type.symbol)?.getBaseTypes() ?? [];
    for (const baseType of baseTypes) {
      if (isNgZoneOrSubclass(baseType, typeChecker)) {
        return true;
      }
    }
  }

  return false;
}
