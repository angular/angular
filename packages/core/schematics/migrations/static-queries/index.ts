/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {logging} from '@angular-devkit/core';
import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {dirname, relative} from 'path';
import * as ts from 'typescript';

import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {parseTsconfigFile} from '../../utils/typescript/parse_tsconfig';
import {TypeScriptVisitor, visitAllNodes} from '../../utils/typescript/visit_nodes';

import {NgQueryResolveVisitor} from './angular/ng_query_visitor';
import {QueryTemplateStrategy} from './strategies/template_strategy/template_strategy';
import {TimingStrategy} from './strategies/timing-strategy';
import {QueryUsageStrategy} from './strategies/usage_strategy/usage_strategy';
import {getTransformedQueryCallExpr} from './transform';

type Logger = logging.LoggerApi;

/** Entry point for the V8 static-query migration. */
export default function(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const projectTsConfigPaths = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();

    if (!projectTsConfigPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate queries ' +
          'to explicit timing.');
    }

    for (const tsconfigPath of projectTsConfigPaths) {
      runStaticQueryMigration(tree, tsconfigPath, basePath, context.logger);
    }
  };
}

/**
 * Runs the static query migration for the given TypeScript project. The schematic
 * analyzes all queries within the project and sets up the query timing based on
 * the current usage of the query property. e.g. a view query that is not used in any
 * lifecycle hook does not need to be static and can be set up with "static: false".
 */
function runStaticQueryMigration(
    tree: Tree, tsconfigPath: string, basePath: string, logger: Logger) {
  const parsed = parseTsconfigFile(tsconfigPath, dirname(tsconfigPath));
  const host = ts.createCompilerHost(parsed.options, true);

  // We need to overwrite the host "readFile" method, as we want the TypeScript
  // program to be based on the file contents in the virtual file tree. Otherwise
  // if we run the migration for multiple tsconfig files which have intersecting
  // source files, it can end up updating query definitions multiple times.
  host.readFile = fileName => {
    const buffer = tree.read(relative(basePath, fileName));
    return buffer ? buffer.toString() : undefined;
  };

  const isUsageStrategy = !!process.env['NG_STATIC_QUERY_USAGE_STRATEGY'];
  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const typeChecker = program.getTypeChecker();
  const queryVisitor = new NgQueryResolveVisitor(typeChecker);
  const templateVisitor = new NgComponentTemplateVisitor(typeChecker);
  const rootSourceFiles = program.getRootFileNames().map(f => program.getSourceFile(f) !);
  const printer = ts.createPrinter();
  const analysisVisitors: TypeScriptVisitor[] = [queryVisitor];

  // If the "usage" strategy is selected, we also need to add the query visitor
  // to the analysis visitors so that query usage in templates can be also checked.
  if (isUsageStrategy) {
    analysisVisitors.push(templateVisitor);
  }

  rootSourceFiles.forEach(sourceFile => {
    // The visit utility function only traverses a source file once. We don't want to
    // traverse through all source files multiple times for each visitor as this could be
    // slow.
    visitAllNodes(sourceFile, analysisVisitors);
  });

  const {resolvedQueries, classMetadata} = queryVisitor;
  const {resolvedTemplates} = templateVisitor;

  if (isUsageStrategy) {
    // Add all resolved templates to the class metadata if the usage strategy is used. This
    // is necessary in order to be able to check component templates for static query usage.
    resolvedTemplates.forEach(template => {
      if (classMetadata.has(template.container)) {
        classMetadata.get(template.container) !.template = template;
      }
    });
  }

  const strategy: TimingStrategy = isUsageStrategy ?
      new QueryUsageStrategy(classMetadata, typeChecker) :
      new QueryTemplateStrategy(tsconfigPath, classMetadata, host);
  const detectionMessages: string[] = [];

  // In case the strategy could not be set up properly, we just exit the
  // migration. We don't want to throw an exception as this could mean
  // that other migrations are interrupted.
  if (!strategy.setup()) {
    return;
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
      const transformedNode = getTransformedQueryCallExpr(q, timing, !!message);

      if (!transformedNode) {
        return;
      }

      const newText = printer.printNode(ts.EmitHint.Unspecified, transformedNode, sourceFile);

      // Replace the existing query decorator call expression with the updated
      // call expression node.
      update.remove(queryExpr.getStart(), queryExpr.getWidth());
      update.insertRight(queryExpr.getStart(), newText);

      const {line, character} =
          ts.getLineAndCharacterOfPosition(sourceFile, q.decorator.node.getStart());
      detectionMessages.push(`${relativePath}@${line + 1}:${character + 1}: ${message}`);
    });

    tree.commitUpdate(update);
  });

  if (detectionMessages.length) {
    logger.info('------ Static Query migration ------');
    logger.info('In preparation for Ivy, developers can now explicitly specify the');
    logger.info('timing of their queries. Read more about this here:');
    logger.info('https://github.com/angular/angular/pull/28810');
    logger.info('');
    logger.info('Some queries cannot be migrated automatically. Please go through');
    logger.info('those manually and apply the appropriate timing:');
    detectionMessages.forEach(failure => logger.warn(`⮑   ${failure}`));
    logger.info('------------------------------------------------');
  }
}
