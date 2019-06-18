/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

import {InjectablePipeVisitor} from '../injectable-pipe/angular/injectable_pipe_visitor';
import {INJECTABLE_DECORATOR_NAME, addImport, getNamedImports} from '../injectable-pipe/util';


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
      const fixes = [new Replacement(
          pipeDecorator.getStart(), pipeDecorator.getWidth(),
          `@${INJECTABLE_DECORATOR_NAME}()\n${pipeDecorator.getText()}`)];

      if (importDeclarationMissingImport) {
        const namedImports = getNamedImports(importDeclarationMissingImport);

        // Add another fix that'll add the missing import.
        if (namedImports) {
          fixes.push(new Replacement(
              namedImports.getStart(), namedImports.getWidth(),
              printer.printNode(
                  ts.EmitHint.Unspecified, addImport(namedImports, INJECTABLE_DECORATOR_NAME),
                  sourceFile)));
        }
      }

      // Add a failure on Pipe decorators that are missing the Injectable decorator.
      failures.push(new RuleFailure(
          sourceFile, pipeDecorator.getStart(), pipeDecorator.getWidth(),
          'Classes with @Pipe should be decorated with @Injectable so that they can be injected.',
          this.ruleName, fixes));
    });

    return failures;
  }
}
