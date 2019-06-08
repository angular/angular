/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createProgram} from '@angular/compiler-cli';
import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {NgQueryResolveVisitor} from '../angular/ng_query_visitor';
import {QueryTiming} from '../angular/query-definition';
import {QueryTemplateStrategy} from '../strategies/template_strategy/template_strategy';
import {getTransformedQueryCallExpr} from '../transform';

const FAILURE_MESSAGE = 'Query does not explicitly specify its timing. Read more here: ' +
    'https://v8.angular.io/guide/static-query-migration.';

/**
 * Rule that reports if an Angular "ViewChild" or "ContentChild" query is not explicitly
 * specifying its timing. The rule also provides TSLint automatic replacements that can
 * be applied in order to automatically migrate to the explicit query timing API.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const queryVisitor = new NgQueryResolveVisitor(program.getTypeChecker());
    const rootSourceFiles = program.getRootFileNames().map(f => program.getSourceFile(f) !);
    const printer = ts.createPrinter();
    const failures: RuleFailure[] = [];

    // Analyze source files by detecting queries, class relations and component templates.
    rootSourceFiles.forEach(sourceFile => queryVisitor.visitNode(sourceFile));

    const {resolvedQueries, classMetadata} = queryVisitor;
    const queries = resolvedQueries.get(sourceFile);
    const host = ts.createCompilerHost(program.getCompilerOptions(), true);
    const strategy = new QueryTemplateStrategy('', classMetadata, host);

    // Overwrite the strategy "createNgProgram" method to create the program from
    // the existing TSLint program.
    strategy.createNgProgram = () => {
      const compilerOptions = program.getCompilerOptions();
      return createProgram({
        rootNames: program.getRootFileNames(),
        options: {...compilerOptions, basePath: program.getCurrentDirectory()}, host
      });
    };

    // No queries detected for the given source file.
    if (!queries) {
      return [];
    }

    strategy.setup();

    // Compute the query usage for all resolved queries and update the
    // query definitions to explicitly declare the query timing (static or dynamic)
    queries.forEach(q => {
      const queryExpr = q.decorator.node.expression;
      const {timing, message} = strategy.detectTiming(q);
      const result = getTransformedQueryCallExpr(q, timing, !!message);

      if (!result) {
        return;
      }

      const newText = printer.printNode(ts.EmitHint.Unspecified, result.node, sourceFile);

      // Replace the existing query decorator call expression with the
      // updated call expression node.
      const fix = new Replacement(queryExpr.getStart(), queryExpr.getWidth(), newText);
      let failureMessage = FAILURE_MESSAGE;

      if (message || timing === null) {
        failureMessage += ` ${message || 'Query could not be migrated automatically.'}`;
      } else {
        failureMessage += ` Based on analysis of the query it can be marked as ` +
            `"{static: ${(timing === QueryTiming.STATIC).toString()}}".`;
      }

      failures.push(new RuleFailure(
          sourceFile, queryExpr.getStart(), queryExpr.getEnd(), failureMessage, this.ruleName,
          fix));
    });

    return failures;
  }
}
