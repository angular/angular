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
import {getImportSpecifier} from '../../utils/typescript/imports';

const ROUTER_PACKAGE = '@angular/router';
const PROVIDE_ROUTER = 'provideRouter';
const WITH_ROUTER_CONFIG = 'withRouterConfig';
const ROUTER_MODULE = 'RouterModule';
const FOR_ROOT = 'forRoot';
const PARAMS_INHERITANCE_STRATEGY = 'paramsInheritanceStrategy';

export interface RouterParamsInheritanceMigrationData {
  replacements: Replacement[];
}

/**
 * In v22, the default value of `paramsInheritanceStrategy` was changed from `'emptyOnly'` to
 * `'always'`. This migration preserves the pre-v22 behavior by explicitly setting
 * `paramsInheritanceStrategy: 'emptyOnly'` wherever router configuration is declared without it.
 *
 * The following patterns are migrated:
 * - `RouterModule.forRoot(routes)` -> `RouterModule.forRoot(routes, { paramsInheritanceStrategy: 'emptyOnly' })`
 * - `RouterModule.forRoot(routes, { ... })` -> adds property to existing options object
 * - `provideRouter(routes)` -> `provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' }))`
 * - `withRouterConfig({ ... })` -> adds property to existing options object
 */
export class RouterParamsInheritanceMigration extends TsurgeFunnelMigration<
  RouterParamsInheritanceMigrationData,
  RouterParamsInheritanceMigrationData
> {
  override async analyze(
    info: ProgramInfo,
  ): Promise<Serializable<RouterParamsInheritanceMigrationData>> {
    const replacements: Replacement[] = [];
    const importManager = new ImportManager();
    const printer = ts.createPrinter();

    for (const sourceFile of info.sourceFiles) {
      const hasProvideRouter =
        getImportSpecifier(sourceFile, ROUTER_PACKAGE, PROVIDE_ROUTER) !== null;
      const hasWithRouterConfig =
        getImportSpecifier(sourceFile, ROUTER_PACKAGE, WITH_ROUTER_CONFIG) !== null;
      const hasRouterModule =
        getImportSpecifier(sourceFile, ROUTER_PACKAGE, ROUTER_MODULE) !== null;

      if (!hasProvideRouter && !hasWithRouterConfig && !hasRouterModule) {
        continue;
      }

      ts.forEachChild(sourceFile, function visit(node: ts.Node) {
        ts.forEachChild(node, visit);

        if (!ts.isCallExpression(node)) return;

        // withRouterConfig({ ... })
        // Add paramsInheritanceStrategy: 'emptyOnly' when the property is absent.
        if (
          ts.isIdentifier(node.expression) &&
          node.expression.text === WITH_ROUTER_CONFIG &&
          node.arguments.length === 1 &&
          ts.isObjectLiteralExpression(node.arguments[0])
        ) {
          const optionsObj = node.arguments[0];
          if (!hasProperty(optionsObj, PARAMS_INHERITANCE_STRATEGY)) {
            insertPropertyIntoObject(optionsObj, sourceFile, info, replacements);
          }
          return;
        }

        // provideRouter(routes, ...features) without withRouterConfig
        // Add withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' }) as a
        // new feature argument.
        if (
          ts.isIdentifier(node.expression) &&
          node.expression.text === PROVIDE_ROUTER &&
          hasProvideRouter
        ) {
          const alreadyHasWithRouterConfig = node.arguments.some(
            (arg) =>
              ts.isCallExpression(arg) &&
              ts.isIdentifier(arg.expression) &&
              arg.expression.text === WITH_ROUTER_CONFIG,
          );

          if (!alreadyHasWithRouterConfig) {
            const withRouterConfigExpr = importManager.addImport({
              exportModuleSpecifier: ROUTER_PACKAGE,
              exportSymbolName: WITH_ROUTER_CONFIG,
              requestedFile: sourceFile,
            });
            const exprText = printer.printNode(
              ts.EmitHint.Unspecified,
              withRouterConfigExpr,
              sourceFile,
            );
            const insertPos = node.arguments.end;
            const toInsert =
              node.arguments.length > 0
                ? `, ${exprText}({ ${PARAMS_INHERITANCE_STRATEGY}: 'emptyOnly' })`
                : `${exprText}({ ${PARAMS_INHERITANCE_STRATEGY}: 'emptyOnly' })`;

            replacements.push(
              new Replacement(
                projectFile(sourceFile, info),
                new TextUpdate({position: insertPos, end: insertPos, toInsert}),
              ),
            );
          }
          return;
        }

        // RouterModule.forRoot(routes, options?)
        if (
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === ROUTER_MODULE &&
          node.expression.name.text === FOR_ROOT
        ) {
          if (node.arguments.length === 0) return;

          if (node.arguments.length === 1) {
            // No options argument – append a new one.
            const insertPos = node.arguments.end;
            replacements.push(
              new Replacement(
                projectFile(sourceFile, info),
                new TextUpdate({
                  position: insertPos,
                  end: insertPos,
                  toInsert: `, { ${PARAMS_INHERITANCE_STRATEGY}: 'emptyOnly' }`,
                }),
              ),
            );
          } else {
            // Options argument exists – only touch inline object literals so we
            // don't accidentally mutate values held in variables.
            const optionsArg = node.arguments[1];
            if (
              ts.isObjectLiteralExpression(optionsArg) &&
              !hasProperty(optionsArg, PARAMS_INHERITANCE_STRATEGY)
            ) {
              insertPropertyIntoObject(optionsArg, sourceFile, info, replacements);
            }
          }
        }
      });
    }

    applyImportManagerChanges(importManager, replacements, info.sourceFiles, info);
    return confirmAsSerializable({replacements});
  }

  override async combine(
    unitA: RouterParamsInheritanceMigrationData,
    unitB: RouterParamsInheritanceMigrationData,
  ): Promise<Serializable<RouterParamsInheritanceMigrationData>> {
    return confirmAsSerializable({
      replacements: [...unitA.replacements, ...unitB.replacements],
    });
  }

  override async globalMeta(
    combinedData: RouterParamsInheritanceMigrationData,
  ): Promise<Serializable<RouterParamsInheritanceMigrationData>> {
    return confirmAsSerializable(combinedData);
  }

  override async stats(
    globalMetadata: RouterParamsInheritanceMigrationData,
  ): Promise<Serializable<unknown>> {
    return confirmAsSerializable({});
  }

  override async migrate(
    globalData: RouterParamsInheritanceMigrationData,
  ): Promise<{replacements: Replacement[]}> {
    return {replacements: globalData.replacements};
  }
}

function hasProperty(obj: ts.ObjectLiteralExpression, name: string): boolean {
  return obj.properties.some(
    (p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === name,
  );
}

/**
 * Inserts `paramsInheritanceStrategy: 'emptyOnly'` into an existing object literal.
 *
 * - Empty object `{}` → `{ paramsInheritanceStrategy: 'emptyOnly' }`
 * - Non-empty object → appends after the last property
 */
function insertPropertyIntoObject(
  obj: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
  info: ProgramInfo,
  replacements: Replacement[],
): void {
  const propertyText = `${PARAMS_INHERITANCE_STRATEGY}: 'emptyOnly'`;

  if (obj.properties.length === 0) {
    const insertPos = obj.getStart() + 1; // position right after '{'
    replacements.push(
      new Replacement(
        projectFile(sourceFile, info),
        new TextUpdate({
          position: insertPos,
          end: insertPos,
          toInsert: ` ${propertyText} `,
        }),
      ),
    );
  } else {
    // Append after the last existing property.
    const lastProp = obj.properties[obj.properties.length - 1];
    replacements.push(
      new Replacement(
        projectFile(sourceFile, info),
        new TextUpdate({
          position: lastProp.getEnd(),
          end: lastProp.getEnd(),
          toInsert: `, ${propertyText}`,
        }),
      ),
    );
  }
}
