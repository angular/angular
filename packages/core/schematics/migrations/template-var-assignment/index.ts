/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {logging, normalize} from '@angular-devkit/core';
import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {dirname, relative} from 'path';
import * as ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {parseTsconfigFile} from '../../utils/typescript/parse_tsconfig';

import {analyzeResolvedTemplate} from './analyze_template';
import {NgComponentTemplateVisitor} from './angular/ng_component_template';

type Logger = logging.LoggerApi;

/** Entry point for the V8 template variable assignment schematic. */
export default function(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const projectTsConfigPaths = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();

    if (!projectTsConfigPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot check templates for template variable ' +
          'assignments.');
    }

    for (const tsconfigPath of projectTsConfigPaths) {
      runTemplateVariableAssignmentCheck(tree, tsconfigPath, basePath, context.logger);
    }
  };
}

/**
 * Runs the template variable assignment check. Warns developers
 * if values are assigned to template variables within output bindings.
 */
function runTemplateVariableAssignmentCheck(
    tree: Tree, tsconfigPath: string, basePath: string, logger: Logger) {
  const parsed = parseTsconfigFile(tsconfigPath, dirname(tsconfigPath));
  const host = ts.createCompilerHost(parsed.options, true);

  // We need to overwrite the host "readFile" method, as we want the TypeScript
  // program to be based on the file contents in the virtual file tree.
  host.readFile = fileName => {
    const buffer = tree.read(relative(basePath, fileName));
    return buffer ? buffer.toString() : undefined;
  };

  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const typeChecker = program.getTypeChecker();
  const templateVisitor = new NgComponentTemplateVisitor(typeChecker);
  const rootSourceFiles = program.getRootFileNames().map(f => program.getSourceFile(f) !);

  // Analyze source files by detecting HTML templates.
  rootSourceFiles.forEach(sourceFile => templateVisitor.visitNode(sourceFile));

  const {resolvedTemplates} = templateVisitor;

  // Analyze each resolved template and print a warning for property writes to
  // template variables.
  resolvedTemplates.forEach((template, filePath) => {
    const nodes = analyzeResolvedTemplate(filePath, template);

    if (!nodes) {
      return;
    }

    const displayFilePath = normalize(relative(basePath, filePath));

    nodes.forEach(n => {
      const {line, character} = template.getCharacterAndLineOfPosition(n.start);
      logger.warn(
          `${displayFilePath}@${line + 1}:${character + 1}: Found assignment to template ` +
          `variable. This does not work with Ivy and needs to be updated.`);
    });
  });
}
