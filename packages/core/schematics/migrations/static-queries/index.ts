/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {dirname, relative} from 'path';
import * as ts from 'typescript';

import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {parseTsconfigFile} from '../../utils/typescript/parse_tsconfig';
import {visitAllNodes} from '../../utils/typescript/visit_nodes';

import {analyzeNgQueryUsage} from './angular/analyze_query_usage';
import {NgQueryResolveVisitor} from './angular/ng_query_visitor';
import {getTransformedQueryCallExpr} from './transform';



/** Entry point for the V8 static-query migration. */
export default function(): Rule {
  return (tree: Tree) => {
    const projectTsConfigPaths = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();

    if (!projectTsConfigPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate queries ' +
          'to explicit timing.');
    }

    for (const tsconfigPath of projectTsConfigPaths) {
      runStaticQueryMigration(tree, tsconfigPath, basePath);
    }
  };
}

/**
 * Runs the static query migration for the given TypeScript project. The schematic
 * analyzes all queries within the project and sets up the query timing based on
 * the current usage of the query property. e.g. a view query that is not used in any
 * lifecycle hook does not need to be static and can be set up with "static: false".
 */
function runStaticQueryMigration(tree: Tree, tsconfigPath: string, basePath: string) {
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

  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const typeChecker = program.getTypeChecker();
  const queryVisitor = new NgQueryResolveVisitor(typeChecker);
  const templateVisitor = new NgComponentTemplateVisitor(typeChecker);
  const rootSourceFiles = program.getRootFileNames().map(f => program.getSourceFile(f) !);
  const printer = ts.createPrinter();

  // Analyze source files by detecting queries, class relations and component templates.
  rootSourceFiles.forEach(sourceFile => {
    // The visit utility function only traverses the source file once. We don't want to
    // traverse through all source files multiple times for each visitor as this could be
    // slow.
    visitAllNodes(sourceFile, [queryVisitor, templateVisitor]);
  });

  const {resolvedQueries, classMetadata} = queryVisitor;

  // Add all resolved templates to the class metadata so that we can also
  // check component templates for static query usage.
  templateVisitor.resolvedTemplates.forEach(template => {
    if (classMetadata.has(template.container)) {
      classMetadata.get(template.container) !.template = template;
    }
  });

  // Walk through all source files that contain resolved queries and update
  // the source files if needed. Note that we need to update multiple queries
  // within a source file within the same recorder in order to not throw off
  // the TypeScript node offsets.
  resolvedQueries.forEach((queries, sourceFile) => {
    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

    // Compute the query usage for all resolved queries and update the
    // query definitions to explicitly declare the query timing (static or dynamic)
    queries.forEach(q => {
      const queryExpr = q.decorator.node.expression;
      const timing = analyzeNgQueryUsage(q, classMetadata, typeChecker);
      const transformedNode = getTransformedQueryCallExpr(q, timing);

      if (!transformedNode) {
        return;
      }

      const newText = printer.printNode(ts.EmitHint.Unspecified, transformedNode, sourceFile);

      // Replace the existing query decorator call expression with the updated
      // call expression node.
      update.remove(queryExpr.getStart(), queryExpr.getWidth());
      update.insertRight(queryExpr.getStart(), newText);
    });

    tree.commitUpdate(update);
  });
}
