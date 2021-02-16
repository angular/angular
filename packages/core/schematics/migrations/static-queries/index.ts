/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {logging} from '@angular-devkit/core';
import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {relative} from 'path';
import * as ts from 'typescript';

import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {NgQueryResolveVisitor} from './angular/ng_query_visitor';
import {QueryTemplateStrategy} from './strategies/template_strategy/template_strategy';
import {QueryTestStrategy} from './strategies/test_strategy/test_strategy';
import {TimingStrategy} from './strategies/timing-strategy';
import {QueryUsageStrategy} from './strategies/usage_strategy/usage_strategy';
import {getTransformedQueryCallExpr} from './transform';

enum SELECTED_STRATEGY {
  TEMPLATE,
  USAGE,
  TESTS,
}

interface AnalyzedProject {
  program: ts.Program;
  host: ts.CompilerHost;
  queryVisitor: NgQueryResolveVisitor;
  sourceFiles: ts.SourceFile[];
  basePath: string;
  typeChecker: ts.TypeChecker;
  tsconfigPath: string;
}

/** Entry point for the V8 static-query migration. */
export default function(): Rule {
  return runMigration;
}

/** Runs the V8 migration static-query migration for all determined TypeScript projects. */
async function runMigration(tree: Tree, context: SchematicContext) {
  const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
  const basePath = process.cwd();
  const logger = context.logger;

  if (!buildPaths.length && !testPaths.length) {
    throw new SchematicsException(
        'Could not find any tsconfig file. Cannot migrate queries ' +
        'to add static flag.');
  }

  const analyzedFiles = new Set<string>();
  const buildProjects = new Set<AnalyzedProject>();
  const failures = [];
  const strategy = process.env['NG_STATIC_QUERY_USAGE_STRATEGY'] === 'true' ?
      SELECTED_STRATEGY.USAGE :
      SELECTED_STRATEGY.TEMPLATE;

  for (const tsconfigPath of buildPaths) {
    const project = analyzeProject(tree, tsconfigPath, basePath, analyzedFiles, logger);
    if (project) {
      buildProjects.add(project);
    }
  }

  if (buildProjects.size) {
    for (let project of Array.from(buildProjects.values())) {
      failures.push(...await runStaticQueryMigration(tree, project, strategy, logger));
    }
  }

  // For the "test" tsconfig projects we always want to use the test strategy as
  // we can't detect the proper timing within spec files.
  for (const tsconfigPath of testPaths) {
    const project = await analyzeProject(tree, tsconfigPath, basePath, analyzedFiles, logger);
    if (project) {
      failures.push(
          ...await runStaticQueryMigration(tree, project, SELECTED_STRATEGY.TESTS, logger));
    }
  }

  if (failures.length) {
    logger.info('');
    logger.info('Some queries could not be migrated automatically. Please go');
    logger.info('through these manually and apply the appropriate timing.');
    logger.info('For more info on how to choose a flag, please see: ');
    logger.info('https://v8.angular.io/guide/static-query-migration');
    failures.forEach(failure => logger.warn(`⮑   ${failure}`));
  }
}

/**
 * Analyzes the given TypeScript project by looking for queries that need to be
 * migrated. In case there are no queries that can be migrated, null is returned.
 */
function analyzeProject(
    tree: Tree, tsconfigPath: string, basePath: string, analyzedFiles: Set<string>,
    logger: logging.LoggerApi): AnalyzedProject|null {
  const {program, host} = createMigrationProgram(tree, tsconfigPath, basePath);
  const syntacticDiagnostics = program.getSyntacticDiagnostics();

  // Syntactic TypeScript errors can throw off the query analysis and therefore we want
  // to notify the developer that we couldn't analyze parts of the project. Developers
  // can just re-run the migration after fixing these failures.
  if (syntacticDiagnostics.length) {
    logger.warn(
        `\nTypeScript project "${tsconfigPath}" has syntactical errors which could cause ` +
        `an incomplete migration. Please fix the following failures and rerun the migration:`);
    logger.error(ts.formatDiagnostics(syntacticDiagnostics, host));
    logger.info(
        'Migration can be rerun with: "ng update @angular/core --from 7 --to 8 --migrate-only"\n');
  }

  const typeChecker = program.getTypeChecker();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));
  const queryVisitor = new NgQueryResolveVisitor(typeChecker);

  // Analyze all project source-files and collect all queries that
  // need to be migrated.
  sourceFiles.forEach(sourceFile => {
    const relativePath = relative(basePath, sourceFile.fileName);

    // Only look for queries within the current source files if the
    // file has not been analyzed before.
    if (!analyzedFiles.has(relativePath)) {
      analyzedFiles.add(relativePath);
      queryVisitor.visitNode(sourceFile);
    }
  });

  if (queryVisitor.resolvedQueries.size === 0) {
    return null;
  }

  return {program, host, tsconfigPath, typeChecker, basePath, queryVisitor, sourceFiles};
}

/**
 * Runs the static query migration for the given project. The schematic analyzes all
 * queries within the project and sets up the query timing based on the current usage
 * of the query property. e.g. a view query that is not used in any lifecycle hook does
 * not need to be static and can be set up with "static: false".
 */
async function runStaticQueryMigration(
    tree: Tree, project: AnalyzedProject, selectedStrategy: SELECTED_STRATEGY,
    logger: logging.LoggerApi): Promise<string[]> {
  const {sourceFiles, typeChecker, host, queryVisitor, tsconfigPath, basePath} = project;
  const printer = ts.createPrinter();
  const failureMessages: string[] = [];
  const templateVisitor = new NgComponentTemplateVisitor(typeChecker);

  // If the "usage" strategy is selected, we also need to add the query visitor
  // to the analysis visitors so that query usage in templates can be also checked.
  if (selectedStrategy === SELECTED_STRATEGY.USAGE) {
    sourceFiles.forEach(s => templateVisitor.visitNode(s));
  }

  const {resolvedQueries, classMetadata} = queryVisitor;
  const {resolvedTemplates} = templateVisitor;

  if (selectedStrategy === SELECTED_STRATEGY.USAGE) {
    // Add all resolved templates to the class metadata if the usage strategy is used. This
    // is necessary in order to be able to check component templates for static query usage.
    resolvedTemplates.forEach(template => {
      if (classMetadata.has(template.container)) {
        classMetadata.get(template.container)!.template = template;
      }
    });
  }

  let strategy: TimingStrategy;
  if (selectedStrategy === SELECTED_STRATEGY.USAGE) {
    strategy = new QueryUsageStrategy(classMetadata, typeChecker);
  } else if (selectedStrategy === SELECTED_STRATEGY.TESTS) {
    strategy = new QueryTestStrategy();
  } else {
    strategy = new QueryTemplateStrategy(tsconfigPath, classMetadata, host);
  }

  try {
    strategy.setup();
  } catch (e) {
    if (selectedStrategy === SELECTED_STRATEGY.TEMPLATE) {
      logger.warn(
          `\nThe template migration strategy uses the Angular compiler ` +
          `internally and therefore projects that no longer build successfully after ` +
          `the update cannot use the template migration strategy. Please ensure ` +
          `there are no AOT compilation errors.\n`);
    }
    // In case the strategy could not be set up properly, we just exit the
    // migration. We don't want to throw an exception as this could mean
    // that other migrations are interrupted.
    logger.warn(
        `Could not setup migration strategy for "${project.tsconfigPath}". The ` +
        `following error has been reported:\n`);
    logger.error(`${e.toString()}\n`);
    logger.info(
        'Migration can be rerun with: "ng update @angular/core --from 7 --to 8 --migrate-only"\n');
    return [];
  }

  // Walk through all source files that contain resolved queries and update
  // the source files if needed. Note that we need to update multiple queries
  // within a source file within the same recorder in order to not throw off
  // the TypeScript node offsets.
  resolvedQueries.forEach((queries, sourceFile) => {
    const relativePath = relative(basePath, sourceFile.fileName);
    const update = tree.beginUpdate(relativePath);

    // Compute the query timing for all resolved queries and update the
    // query definitions to explicitly set the determined query timing.
    queries.forEach(q => {
      const queryExpr = q.decorator.node.expression;
      const {timing, message} = strategy.detectTiming(q);
      const result = getTransformedQueryCallExpr(q, timing, !!message);

      if (!result) {
        return;
      }

      const newText = printer.printNode(ts.EmitHint.Unspecified, result.node, sourceFile);

      // Replace the existing query decorator call expression with the updated
      // call expression node.
      update.remove(queryExpr.getStart(), queryExpr.getWidth());
      update.insertRight(queryExpr.getStart(), newText);

      if (result.failureMessage || message) {
        const {line, character} =
            ts.getLineAndCharacterOfPosition(sourceFile, q.decorator.node.getStart());
        failureMessages.push(
            `${relativePath}@${line + 1}:${character + 1}: ${result.failureMessage || message}`);
      }
    });

    tree.commitUpdate(update);
  });

  return failureMessages;
}
