/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {relative} from 'path';
import ts from 'typescript';

import {loadEsmModule} from '../../utils/load_esm';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';
import {getImportSpecifier} from '../../utils/typescript/imports';

import {ComponentTemplatesResolver} from './component-templates-resolver';
import {getEventEmitterTypeParam, withCompilerModule} from './util';

export default function(): Rule {
  return async (tree: Tree, ctx: SchematicContext) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate argument-less (void) EventEmitter declarations.');
    }

    let compilerModule;
    try {
      // Load ESM `@angular/compiler` using the TypeScript dynamic import workaround.
      // Once TypeScript provides support for keeping the dynamic import this workaround can be
      // changed to a direct dynamic import.
      compilerModule = await loadEsmModule<typeof import('@angular/compiler')>('@angular/compiler');
    } catch (e) {
      throw new SchematicsException(
          `Unable to load the '@angular/compiler' package. Details: ${(e as Error).message}`);
    }

    const failures: string[] = [];
    for (const tsconfigPath of allPaths) {
      const thisFailures =
          runVoidEventEmitterMigration(tree, tsconfigPath, basePath, compilerModule);
      failures.push(...thisFailures);
    }

    if (failures.length) {
      ctx.logger.info('Could not migrate all event emitters automatically. Please');
      ctx.logger.info('manually migrate the following instances:');
      failures.forEach(message => ctx.logger.warn(`⮑   ${message}`));
    }
  };
}

function runVoidEventEmitterMigration(
    tree: Tree, tsconfigPath: string, basePath: string,
    compilerModule: typeof import('@angular/compiler')): string[] {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const failures: string[] = [];
  const typeChecker = program.getTypeChecker();
  const printer = ts.createPrinter();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  sourceFiles.forEach(sourceFile => {
    const eventEmitterImportSpecifier =
        getImportSpecifier(sourceFile, '@angular/core', 'EventEmitter');

    // If there are no imports for the `EventEmitter`, we can exit early.
    if (!eventEmitterImportSpecifier) {
      return;
    }

    const componentTemplatesResolver = new ComponentTemplatesResolver(typeChecker, tree, basePath);

    const emitterUsages =
        withCompilerModule(compilerModule)
            .findEventEmitterReferences(
                sourceFile, typeChecker, eventEmitterImportSpecifier, componentTemplatesResolver);

    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    let hasUpdates = false;

    for (let [declaration, calls] of emitterUsages.entries()) {
      const typeParam = getEventEmitterTypeParam(declaration);

      if (typeParam === 'void') {
        continue;
      }

      const voidCalls = calls.filter(emitterCall => !emitterCall.hasArguments);
      const nonVoidCalls = calls.filter(emitterCall => emitterCall.hasArguments);

      // in case of typed or mixed usage, display a warning for each void call instead of
      // auto-migrating
      if (typeParam === 'typed' || nonVoidCalls.length > 0) {
        for (let voidCall of voidCalls) {
          const method = voidCall.methodName;
          const {line, character} = voidCall.pos;
          const relativeFilePath = relative(basePath, voidCall.filePath);
          failures.push(`${relativeFilePath}@${line + 1}:${character + 1}: .${
              method}() call requires an argument`);
        }
        continue;
      }

      // findEventEmitterReferences() only tracked declarations initialized with a NewExpression
      const newExpr = declaration.initializer as ts.NewExpression;

      const updatedNewExpr = ts.factory.createNewExpression(
          newExpr.expression, [ts.factory.createToken(ts.SyntaxKind.VoidKeyword)],
          newExpr.arguments);

      update.remove(newExpr.getStart(), newExpr.getWidth());
      update.insertRight(
          newExpr.getStart(),
          printer.printNode(ts.EmitHint.Unspecified, updatedNewExpr, sourceFile));

      hasUpdates = true;
    }

    if (hasUpdates) {
      tree.commitUpdate(update);
    }
  });


  return failures;
}
