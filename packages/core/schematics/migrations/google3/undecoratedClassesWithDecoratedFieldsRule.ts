/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

import {FALLBACK_DECORATOR, addImport, getNamedImports, getUndecoratedClassesWithDecoratedFields, hasNamedImport} from '../undecorated-classes-with-decorated-fields/utils';



/**
 * TSLint rule that adds an Angular decorator to classes that have Angular field decorators.
 * https://hackmd.io/vuQfavzfRG6KUCtU7oK_EA
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const typeChecker = program.getTypeChecker();
    const printer = ts.createPrinter();
    const classes = getUndecoratedClassesWithDecoratedFields(sourceFile, typeChecker);

    return classes.map((current, index) => {
      const {classDeclaration: declaration, importDeclaration} = current;
      const name = declaration.name;

      // Set the class identifier node (if available) as the failing node so IDEs don't highlight
      // the entire class with red. This is similar to how errors are shown for classes in other
      // cases like an interface not being implemented correctly.
      const start = (name || declaration).getStart();
      const end = (name || declaration).getEnd();
      const fixes = [Replacement.appendText(declaration.getStart(), `@${FALLBACK_DECORATOR}()\n`)];

      // If it's the first class that we're processing in this file, add `Directive` to the imports.
      if (index === 0 && !hasNamedImport(importDeclaration, FALLBACK_DECORATOR)) {
        const namedImports = getNamedImports(importDeclaration);

        if (namedImports) {
          fixes.push(new Replacement(
              namedImports.getStart(), namedImports.getWidth(),
              printer.printNode(
                  ts.EmitHint.Unspecified, addImport(namedImports, FALLBACK_DECORATOR),
                  sourceFile)));
        }
      }

      return new RuleFailure(
          sourceFile, start, end,
          'Classes with decorated fields must have an Angular decorator as well.',
          'undecorated-classes-with-decorated-fields', fixes);
    });
  }
}
