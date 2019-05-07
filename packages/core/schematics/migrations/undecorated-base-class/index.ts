/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {dirname, relative} from 'path';
import * as ts from 'typescript';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {parseTsconfigFile} from '../../utils/typescript/parse_tsconfig';

import {NgDirectiveVisitor} from './directive_visitor';
import {UndecoratedBaseClassTransform} from './transform';
import {UpdateRecorder} from './update_recorder';


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
  const directiveVisitor = new NgDirectiveVisitor(typeChecker);
  const rootSourceFiles = program.getRootFileNames().map(f => program.getSourceFile(f) !);

  // Analyze source files by detecting all directive and components.
  rootSourceFiles.forEach(sourceFile => directiveVisitor.visitNode(sourceFile));

  const {resolvedDirectives, directiveModules} = directiveVisitor;
  const transformer =
      new UndecoratedBaseClassTransform(typeChecker, directiveModules, getUpdateRecorder);
  const updateRecorders = new Map<ts.SourceFile, UpdateRecorder>();

  resolvedDirectives.forEach(classDecl => {
    transformer.migrateDirective(classDecl).forEach(({message, node}) => {
      const nodeSourceFile = node.getSourceFile();
      const relativeFilePath = relative(basePath, nodeSourceFile.fileName);
      const {line, character} =
          ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
      failures.push(`${relativeFilePath}@${line + 1}:${character + 1}: ${message}`);
    });
  });

  // Record the changes collected in the import manager and NgModule manager. The
  // changes need to be recorded before committing the changes to the host tree.
  transformer.recordChanges();

  // Walk through each update recorder and commit the update. We need to commit the
  // updates in batches per source file as there can be only one recorder per source
  // file in order to not incorrectly shift offsets.
  updateRecorders.forEach(recorder => recorder.commitUpdate());

  return failures;

  /** Gets the update recorder for the specified source file. */
  function getUpdateRecorder(sourceFile: ts.SourceFile): UpdateRecorder {
    if (updateRecorders.has(sourceFile)) {
      return updateRecorders.get(sourceFile) !;
    }
    const treeRecorder = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    const recorder: UpdateRecorder = {
      addBaseClassDecorator(node: ts.ClassDeclaration, decoratorText: string) {
        treeRecorder.insertLeft(node.getStart(), decoratorText);
      },
      addNewImport(start: number, importText: string) {
        treeRecorder.insertRight(start, importText);
      },
      updateExistingImport(namedBindings: ts.NamedImports, newNamedBindings: string) {
        treeRecorder.remove(namedBindings.getStart(), namedBindings.getWidth());
        treeRecorder.insertRight(namedBindings.getStart(), newNamedBindings);
      },
      updateModuleDeclarations(node: ts.ArrayLiteralExpression, newDeclarations: string) {
        treeRecorder.remove(node.getStart(), node.getWidth());
        treeRecorder.insertRight(node.getStart(), newDeclarations);
      },
      commitUpdate() { tree.commitUpdate(treeRecorder); }
    };
    updateRecorders.set(sourceFile, recorder);
    return recorder;
  }
}
