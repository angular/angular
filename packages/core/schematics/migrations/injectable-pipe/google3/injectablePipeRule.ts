/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

import {InjectablePipeVisitor} from '../angular/injectable_pipe_visitor';
import {INJECTABLE_DECORATOR_NAME, addNamedImport, getNamedImports} from '../util';

/**
 * TSLint rule that flags `@Pipe` classes that haven't been marked as `@Injectable`.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const visitor = new InjectablePipeVisitor(program.getTypeChecker());
    const printer = ts.createPrinter();
    const failures: RuleFailure[] = [];

    visitor.visitNode(sourceFile);

    visitor.missingInjectablePipes.forEach(data => {
      const {pipeDecorator, importDeclarationMissingImport} = data;
      const decoratorFix = new Replacement(
          pipeDecorator.getStart(), pipeDecorator.getWidth(),
          `@${INJECTABLE_DECORATOR_NAME}()\n${pipeDecorator.getText()}`);

      // Add a failure on Pipe decorators that are missing the Injectable decorator.
      failures.push(new RuleFailure(
          sourceFile, pipeDecorator.getStart(), pipeDecorator.getWidth(),
          'Classes with @Pipe should be decorated with @Injectable so that they can be injected.',
          this.ruleName, decoratorFix));

      if (importDeclarationMissingImport) {
        const namedImports = getNamedImports(importDeclarationMissingImport);

        if (namedImports) {
          const importFix = new Replacement(
              namedImports.getStart(), namedImports.getWidth(),
              printer.printNode(
                  ts.EmitHint.Unspecified,
                  addNamedImport(importDeclarationMissingImport, INJECTABLE_DECORATOR_NAME),
                  sourceFile));

          // Add another failure at the `@angular/core` import which
          // will need to import Injectable as well.
          failures.push(new RuleFailure(
              sourceFile, namedImports.getStart(), namedImports.getWidth(),
              'Injectable needs to be imported in order to annotate Pipe classes.', this.ruleName,
              importFix));
        }
      }
    });

    return failures;
  }
}
