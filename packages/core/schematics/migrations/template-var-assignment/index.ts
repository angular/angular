/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {logging, normalize} from '@angular-devkit/core';
import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {relative} from 'path';

import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {analyzeResolvedTemplate} from './analyze_template';

type Logger = logging.LoggerApi;

const README_URL = 'https://v8.angular.io/guide/deprecations#cannot-assign-to-template-variables';
const FAILURE_MESSAGE = `Found assignment to template variable.`;

/** Entry point for the V8 template variable assignment schematic. */
export default function(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();

    if (!buildPaths.length && !testPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot check templates for template variable ' +
          'assignments.');
    }

    for (const tsconfigPath of [...buildPaths, ...testPaths]) {
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
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const templateVisitor = new NgComponentTemplateVisitor(typeChecker);
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  // Analyze source files by detecting HTML templates.
  sourceFiles.forEach(sourceFile => templateVisitor.visitNode(sourceFile));

  const {resolvedTemplates} = templateVisitor;
  const collectedFailures: string[] = [];

  // Analyze each resolved template and print a warning for property writes to
  // template variables.
  resolvedTemplates.forEach(template => {
    const filePath = template.filePath;
    const nodes = analyzeResolvedTemplate(template);

    if (!nodes) {
      return;
    }

    const displayFilePath = normalize(relative(basePath, filePath));

    nodes.forEach(n => {
      const {line, character} = template.getCharacterAndLineOfPosition(n.start);
      collectedFailures.push(`${displayFilePath}@${line + 1}:${character + 1}: ${FAILURE_MESSAGE}`);
    });
  });

  if (collectedFailures.length) {
    logger.info('---- Template Variable Assignment schematic ----');
    logger.info('Assignments to template variables will no longer work with Ivy as');
    logger.info('template variables are effectively constants in Ivy. Read more about');
    logger.info(`this change here: ${README_URL}`);
    logger.info('');
    logger.info('The following template assignments were found:');
    collectedFailures.forEach(failure => logger.warn(`⮑   ${failure}`));
  }
}
