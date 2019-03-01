/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Tree, UpdateRecorder} from '@angular-devkit/schematics';
import {dirname, relative, resolve} from 'path';
import * as ts from 'typescript';

import {analyzeNgQueryUsage} from './angular/analyze_query_usage';
import {NgQueryResolveVisitor} from './angular/ng_query_visitor';
import {NgQueryDefinition, QueryTiming} from './angular/query-definition';
import {getPropertyNameText} from './typescript/property_name';
import {parseTsconfigFile} from './typescript/tsconfig';

/**
 * Runs the static query migration for the given TypeScript project. The schematic
 * analyzes all queries within the project and sets up the query timing based on
 * the current usage of the query property. e.g. a view query that is not used in any
 * lifecycle hook does not need to be static and can be set up with "static: false".
 */
export function runStaticQueryMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const parsed = parseTsconfigFile(tsconfigPath, dirname(tsconfigPath));
  const host = ts.createCompilerHost(parsed.options, true);
  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const typeChecker = program.getTypeChecker();
  const queryVisitor = new NgQueryResolveVisitor(typeChecker);
  const rootSourceFiles = program.getRootFileNames().map(f => program.getSourceFile(f) !);
  const printer = ts.createPrinter();

  // Analyze source files by detecting queries and class relations.
  rootSourceFiles.forEach(sourceFile => queryVisitor.visitNode(sourceFile));

  const {resolvedQueries, classMetadata} = queryVisitor;

  // Walk through all source files that contain resolved queries and update
  // the source files if needed. Note that we need to update multiple queries
  // within a source file within the same recorder in order to not throw off
  // the TypeScript node offsets.
  resolvedQueries.forEach((queries, sourceFile) => {
    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

    // Compute the query usage for all resolved queries and update the
    // query definitions to explicitly declare the query timing (static or dynamic)
    queries.forEach(q => {
      const timing = analyzeNgQueryUsage(q, classMetadata, typeChecker);
      recordQueryUsageTransformation(q, update, timing, printer, sourceFile);
    });

    tree.commitUpdate(update);
  });
}

/**
 * Transforms the query decorator by explicitly specifying the timing based on the
 * determined timing. The changes will be added to the specified update recorder.
 */
function recordQueryUsageTransformation(
    query: NgQueryDefinition, recorder: UpdateRecorder, timing: QueryTiming, printer: ts.Printer,
    sourceFile: ts.SourceFile) {
  const queryExpr = query.decorator.node.expression as ts.CallExpression;
  const queryArguments = queryExpr.arguments;
  const timingPropertyAssignment = ts.createPropertyAssignment(
      'static', timing === QueryTiming.STATIC ? ts.createTrue() : ts.createFalse());
  let newCallText = '';

  // If the query decorator is already called with two arguments, we need to
  // keep the existing options untouched and just add the new property if needed.
  if (queryArguments.length === 2) {
    const existingOptions = queryArguments[1] as ts.ObjectLiteralExpression;

    // In case the options already contains a property for the "static" flag, we just
    // skip this query and leave it untouched.
    if (existingOptions.properties.some(
            p => !!p.name && getPropertyNameText(p.name) === 'static')) {
      return;
    }

    const updatedOptions = ts.updateObjectLiteral(
        existingOptions, existingOptions.properties.concat(timingPropertyAssignment));
    const updatedCall = ts.updateCall(
        queryExpr, queryExpr.expression, queryExpr.typeArguments,
        [queryArguments[0], updatedOptions]);
    newCallText = printer.printNode(ts.EmitHint.Unspecified, updatedCall, sourceFile);
  } else {
    const newCall = ts.updateCall(
        queryExpr, queryExpr.expression, queryExpr.typeArguments,
        [queryArguments[0], ts.createObjectLiteral([timingPropertyAssignment])]);
    newCallText = printer.printNode(ts.EmitHint.Unspecified, newCall, sourceFile);
  }

  recorder.remove(queryExpr.getStart(), queryExpr.getWidth());
  recorder.insertRight(queryExpr.getStart(), newCallText);
}
