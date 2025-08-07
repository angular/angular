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
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {getImportSpecifier} from '../../utils/typescript/imports';
import {isReferenceToImport} from '../../utils/typescript/symbol';

export interface CompilationUnitData {
  locations: Location[];
}

/** Information about the `getCurrentNavigation` identifier in `Router.getCurrentNavigation`. */
interface Location {
  /** File in which the expression is defined. */
  file: ProjectFile;

  /** Start of the `getCurrentNavigation` identifier. */
  position: number;
}

/** Name of the method being replaced. */
const METHOD_NAME = 'lastSuccessfulNavigation';

/** Migration that replaces `Router.lastSuccessfulNavigation` usages with `Router.lastSuccessfulNavigation()`. */
export class RouterLastSuccessfulNavigationMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const locations: Location[] = [];

    for (const sourceFile of info.sourceFiles) {
      const routerSpecifier = getImportSpecifier(sourceFile, '@angular/router', 'Router');

      if (routerSpecifier === null) {
        continue;
      }

      const typeChecker = info.program.getTypeChecker();
      sourceFile.forEachChild(function walk(node) {
        if (
          ts.isPropertyAccessExpression(node) &&
          node.name.text === METHOD_NAME &&
          isRouterType(typeChecker, node.expression, routerSpecifier)
        ) {
          locations.push({file: projectFile(sourceFile, info), position: node.name.getStart()});
        } else {
          node.forEachChild(walk);
        }
      });
    }

    return confirmAsSerializable({locations});
  }

  override async migrate(globalData: CompilationUnitData) {
    const replacements = globalData.locations.map(({file, position}) => {
      return new Replacement(
        file,
        new TextUpdate({
          position: position,
          end: position + METHOD_NAME.length,
          toInsert: 'lastSuccessfulNavigation()',
        }),
      );
    });

    return confirmAsSerializable({replacements});
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const seen = new Set<string>();
    const locations: Location[] = [];
    const combined = [...unitA.locations, ...unitB.locations];

    for (const location of combined) {
      const key = `${location.file.id}#${location.position}`;
      if (!seen.has(key)) {
        seen.add(key);
        locations.push(location);
      }
    }

    return confirmAsSerializable({locations});
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

/**
 * Checks if the given symbol represents a Router type.
 */
function isRouterType(
  typeChecker: ts.TypeChecker,
  expression: ts.Expression,
  routerSpecifier: ts.ImportSpecifier,
): boolean {
  const expressionType = typeChecker.getTypeAtLocation(expression);
  const expressionSymbol = expressionType.getSymbol();
  if (!expressionSymbol) {
    return false;
  }

  const declarations = expressionSymbol.getDeclarations() ?? [];

  for (const declaration of declarations) {
    if (isReferenceToImport(typeChecker, declaration, routerSpecifier)) {
      return true;
    }
  }

  return declarations.some((decl) => decl === routerSpecifier);
}
