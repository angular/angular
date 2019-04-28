/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, SchematicsException, Tree, UpdateRecorder} from '@angular-devkit/schematics';
import {dirname, relative} from 'path';
import * as ts from 'typescript';

import {getAngularDecorators} from '../../utils/ng_decorators';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {hasExplicitConstructor} from '../../utils/typescript/class_declaration';
import {parseTsconfigFile} from '../../utils/typescript/parse_tsconfig';

import {NgDirectiveVisitor} from './directive_visitor';
import {findBaseClassDeclarations} from './find_base_classes';
import {ImportManager} from './import_manager';
import {NgModuleDeclarationsManager} from './module_declarations';


/** Entry point for the V8 undecorated-base-class schematic. */
export default function(): Rule {
  return (tree: Tree, ctx: SchematicContext) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const failures: string[] = [];

    ctx.logger.info('------ Undecorated base class migration ------');

    if (!buildPaths.length && !testPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot decorate any base classes which use ' +
          'dependency injection but are not decorated.');
    }

    for (const tsconfigPath of [...buildPaths, ...testPaths]) {
      failures.push(...runUndecoratedBaseClassMigration(tree, tsconfigPath, basePath));
    }

    if (failures.length) {
      ctx.logger.info('Could not migrate all base classes automatically. Please');
      ctx.logger.info('manually fix the following failures:');
      failures.forEach(message => ctx.logger.warn(`⮑   ${message}`));
    } else {
      ctx.logger.info('Successfully migrated all undecorated base classes.');
    }

    ctx.logger.info('----------------------------------------------');
  };
}

function runUndecoratedBaseClassMigration(
    tree: Tree, tsconfigPath: string, basePath: string): string[] {
  const parsed = parseTsconfigFile(tsconfigPath, dirname(tsconfigPath));
  const host = ts.createCompilerHost(parsed.options, true);
  const failures: string[] = [];

  // We need to overwrite the host "readFile" method, as we want the TypeScript
  // program to be based on the file contents in the virtual file tree.
  host.readFile = fileName => {
    const buffer = tree.read(relative(basePath, fileName));
    return buffer ? buffer.toString() : undefined;
  };

  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const typeChecker = program.getTypeChecker();
  const printer = ts.createPrinter();
  const directiveVisitor = new NgDirectiveVisitor(typeChecker);
  const rootSourceFiles = program.getRootFileNames().map(f => program.getSourceFile(f) !);

  // Analyze source files by detecting all directive and components.
  rootSourceFiles.forEach(sourceFile => directiveVisitor.visitNode(sourceFile));

  const {resolvedDirectives, directiveModules} = directiveVisitor;
  const updateRecorders = new Map<ts.SourceFile, UpdateRecorder>();
  const updatedBaseClasses = new Set<ts.ClassDeclaration>();
  const importManager = new ImportManager(getUpdateRecorder, printer);
  const ngModuleManager =
      new NgModuleDeclarationsManager(importManager, getUpdateRecorder, typeChecker, printer);
  let selectorIdx = 1;

  resolvedDirectives.forEach(classDecl => {
    // In case the directive has an explicit constructor, we don't need to do
    // anything because the class is already decorated with "@Directive" or "@Component"
    if (hasExplicitConstructor(classDecl)) {
      return;
    }

    const orderedBaseClasses = findBaseClassDeclarations(classDecl, typeChecker);
    const ngModules = directiveModules.get(classDecl) || [];

    for (let baseClass of orderedBaseClasses) {
      // The list of base classes is ordered and we only need to find the first
      // base class with an explicit constructor class member.
      if (hasExplicitConstructor(baseClass)) {
        // In case the first base class with an explicit constructor is already
        // decorated with the "@Directive" decorator, we don't need to do anything.
        if (baseClass.decorators &&
            getAngularDecorators(typeChecker, baseClass.decorators)
                .some(d => d.name === 'Directive' || d.name === 'Component')) {
          break;
        }

        const baseClassFile = baseClass.getSourceFile();
        const relativePath = relative(basePath, baseClassFile.fileName);

        // In case the base class has already been decorated with other directives,
        // we don't want to add the @Directive decorator multiple times but still
        // add the base class to various NgModule declarations.
        if (!updatedBaseClasses.has(baseClass)) {
          const recorder = getUpdateRecorder(baseClassFile);
          const directiveExpr =
              importManager.addImportToSourceFile(baseClassFile, 'Directive', '@angular/core');

          const newDecorator = ts.createDecorator(ts.createCall(
              directiveExpr, undefined,
              [ts.createObjectLiteral(
                  [ts.createPropertyAssignment(
                      'selector', ts.createStringLiteral(`_base_class_${selectorIdx++}`))],
                  false)]));

          const newDecoratorText =
              printer.printNode(ts.EmitHint.Unspecified, newDecorator, baseClassFile);
          recorder.insertLeft(baseClass.getStart(), `${newDecoratorText}\n`);
          updatedBaseClasses.add(baseClass);
        }

        // In case the directive is used in any NgModule, we want to add the new
        // dummy directive to the module declarations so that NGC does not complain
        // about a missing module for the newly annotated directive base class.
        ngModules.forEach(module => {
          const failure = ngModuleManager.addDeclarationToNgModule(module, baseClass);
          if (failure) {
            const {line, character} =
                ts.getLineAndCharacterOfPosition(baseClassFile, baseClass.getStart());
            failures.push(`${relativePath}@${line + 1}:${character + 1}: ${failure}`);
          }
        });
        break;
      }
    }
  });

  // Record the changes collected in the import manager and NgModule manager. The
  // changes need to be recorded before committing the changes to the host tree.
  importManager.recordChanges();
  ngModuleManager.recordChanges();

  // Walk through each update recorder and commit the update. We need to commit the
  // updates in batches per source file as there can be only one recorder per source
  // file in order to not incorrectly shift offsets.
  updateRecorders.forEach(recorder => tree.commitUpdate(recorder));

  return failures;

  /** Gets the update recorder for the specified source file. */
  function getUpdateRecorder(sourceFile: ts.SourceFile): UpdateRecorder {
    if (updateRecorders.has(sourceFile)) {
      return updateRecorders.get(sourceFile) !;
    }
    const recorder = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    updateRecorders.set(sourceFile, recorder);
    return recorder;
  }
}
