/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {platform} from 'os';
import ts from 'typescript';

import {absoluteFrom as _, absoluteFromSourceFile} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {Reference} from '../../imports';
import {TypeScriptReflectionHost} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing';
import {StringConcatBuiltinFn} from '../src/builtin';
import {describeResolvedType, traceDynamicValue} from '../src/diagnostics';
import {DynamicValue} from '../src/dynamic';
import {PartialEvaluator} from '../src/interface';
import {EnumValue, ResolvedModule} from '../src/result';

runInEachFileSystem((os) => {
  describe('partial evaluator', () => {
    describe('describeResolvedType()', () => {
      it('should describe primitives', () => {
        expect(describeResolvedType(0)).toBe('number');
        expect(describeResolvedType(true)).toBe('boolean');
        expect(describeResolvedType(false)).toBe('boolean');
        expect(describeResolvedType(null)).toBe('null');
        expect(describeResolvedType(undefined)).toBe('undefined');
        expect(describeResolvedType('text')).toBe('string');
      });

      it('should describe objects limited to a single level', () => {
        expect(describeResolvedType(new Map())).toBe('{}');
        expect(
          describeResolvedType(
            new Map<string, any>([
              ['a', 0],
              ['b', true],
            ]),
          ),
        ).toBe('{ a: number; b: boolean }');
        expect(describeResolvedType(new Map([['a', new Map()]]))).toBe('{ a: object }');
        expect(describeResolvedType(new Map([['a', [1, 2, 3]]]))).toBe('{ a: Array }');
      });

      it('should describe arrays limited to a single level', () => {
        expect(describeResolvedType([])).toBe('[]');
        expect(describeResolvedType([1, 2, 3])).toBe('[number, number, number]');
        expect(
          describeResolvedType([
            [1, 2],
            [3, 4],
          ]),
        ).toBe('[Array, Array]');
        expect(describeResolvedType([new Map([['a', 0]])])).toBe('[object]');
      });

      it('should describe references', () => {
        const namedFn = ts.factory.createFunctionDeclaration(
          /* modifiers */ undefined,
          /* asteriskToken */ undefined,
          /* name */ 'test',
          /* typeParameters */ undefined,
          /* parameters */ [],
          /* type */ undefined,
          /* body */ undefined,
        );
        expect(describeResolvedType(new Reference(namedFn))).toBe('test');

        const anonymousFn = ts.factory.createFunctionDeclaration(
          /* modifiers */ undefined,
          /* asteriskToken */ undefined,
          /* name */ undefined,
          /* typeParameters */ undefined,
          /* parameters */ [],
          /* type */ undefined,
          /* body */ undefined,
        );
        expect(describeResolvedType(new Reference(anonymousFn))).toBe('(anonymous)');
      });

      it('should describe enum values', () => {
        const decl = ts.factory.createEnumDeclaration(
          /* modifiers */ undefined,
          /* name */ 'MyEnum',
          /* members */ [ts.factory.createEnumMember('member', ts.factory.createNumericLiteral(1))],
        );
        const ref = new Reference(decl);
        expect(describeResolvedType(new EnumValue(ref, 'member', 1))).toBe('MyEnum');
      });

      it('should describe dynamic values', () => {
        const node = ts.factory.createObjectLiteralExpression();
        expect(describeResolvedType(DynamicValue.fromUnsupportedSyntax(node))).toBe(
          '(not statically analyzable)',
        );
      });

      it('should describe known functions', () => {
        expect(describeResolvedType(new StringConcatBuiltinFn('foo'))).toBe('Function');
      });

      it('should describe external modules', () => {
        expect(describeResolvedType(new ResolvedModule(new Map(), () => undefined))).toBe(
          '(module)',
        );
      });
    });

    if (os !== 'Windows' && platform() !== 'win32') {
      describe('traceDynamicValue()', () => {
        it('should not include the origin node if points to a different dynamic node.', () => {
          // In the below expression, the read of "value" is evaluated to be dynamic, but it's also
          // the exact node for which the diagnostic is produced. Therefore, this node is not part
          // of the trace.
          const trace = traceExpression('const value = nonexistent;', 'value');

          expect(trace.length).toBe(1);
          expect(trace[0].messageText).toBe(`Unknown reference.`);
          expect(absoluteFromSourceFile(trace[0].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[0])).toBe('nonexistent');
        });

        it('should include the origin node if it is dynamic by itself', () => {
          const trace = traceExpression('', 'nonexistent;');

          expect(trace.length).toBe(1);
          expect(trace[0].messageText).toBe(`Unknown reference.`);
          expect(absoluteFromSourceFile(trace[0].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[0])).toBe('nonexistent');
        });

        it('should include a trace for a dynamic subexpression in the origin expression', () => {
          const trace = traceExpression('const value = nonexistent;', 'value.property');

          expect(trace.length).toBe(2);
          expect(trace[0].messageText).toBe('Unable to evaluate this expression statically.');
          expect(absoluteFromSourceFile(trace[0].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[0])).toBe('value');

          expect(trace[1].messageText).toBe('Unknown reference.');
          expect(absoluteFromSourceFile(trace[1].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[1])).toBe('nonexistent');
        });

        it('should reduce the granularity to a single entry per statement', () => {
          // Dynamic values exist for each node that has been visited, but only the initial dynamic
          // value within a statement is included in the trace.
          const trace = traceExpression(
            `const firstChild = document.body.childNodes[0];
             const child = firstChild.firstChild;`,
            'child !== undefined',
          );

          expect(trace.length).toBe(4);
          expect(trace[0].messageText).toBe('Unable to evaluate this expression statically.');
          expect(absoluteFromSourceFile(trace[0].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[0])).toBe('child');

          expect(trace[1].messageText).toBe('Unable to evaluate this expression statically.');
          expect(absoluteFromSourceFile(trace[1].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[1])).toBe('firstChild');

          expect(trace[2].messageText).toBe('Unable to evaluate this expression statically.');
          expect(absoluteFromSourceFile(trace[2].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[2])).toBe('document.body');

          expect(trace[3].messageText).toBe(
            `A value for 'document' cannot be determined statically, as it is an external declaration.`,
          );
          expect(absoluteFromSourceFile(trace[3].file!)).toBe(_('/lib.d.ts'));
          expect(getSourceCode(trace[3])).toBe('document: any');
        });

        it('should trace dynamic strings', () => {
          const trace = traceExpression('', '`${document}`');

          expect(trace.length).toBe(1);
          expect(trace[0].messageText).toBe('A string value could not be determined statically.');
          expect(absoluteFromSourceFile(trace[0].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[0])).toBe('document');
        });

        it('should trace invalid expression types', () => {
          const trace = traceExpression('', 'true()');

          expect(trace.length).toBe(1);
          expect(trace[0].messageText).toBe('Unable to evaluate an invalid expression.');
          expect(absoluteFromSourceFile(trace[0].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[0])).toBe('true');
        });

        it('should trace unknown syntax', () => {
          const trace = traceExpression('', `new String('test')`);

          expect(trace.length).toBe(1);
          expect(trace[0].messageText).toBe('This syntax is not supported.');
          expect(absoluteFromSourceFile(trace[0].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[0])).toBe("new String('test')");
        });

        it('should trace complex function invocations', () => {
          const trace = traceExpression(
            `
          function complex() {
            console.log('test');
            return true;
          }`,
            'complex()',
          );

          expect(trace.length).toBe(2);
          expect(trace[0].messageText).toBe(
            'Unable to evaluate function call of complex function. A function must have exactly one return statement.',
          );
          expect(absoluteFromSourceFile(trace[0].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[0])).toBe('complex()');

          expect(trace[1].messageText).toBe('Function is declared here.');
          expect(absoluteFromSourceFile(trace[1].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[1])).toContain(`console.log('test');`);
        });

        it('should trace object destructuring of external reference', () => {
          const trace = traceExpression('const {body: {firstChild}} = document;', 'firstChild');

          expect(trace.length).toBe(2);
          expect(trace[0].messageText).toBe('Unable to evaluate this expression statically.');
          expect(absoluteFromSourceFile(trace[0].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[0])).toBe('body: {firstChild}');

          expect(trace[1].messageText).toBe(
            `A value for 'document' cannot be determined statically, as it is an external declaration.`,
          );
          expect(absoluteFromSourceFile(trace[1].file!)).toBe(_('/lib.d.ts'));
          expect(getSourceCode(trace[1])).toBe('document: any');
        });

        it('should trace deep object destructuring of external reference', () => {
          const trace = traceExpression(
            'const {doc: {body: {firstChild}}} = {doc: document};',
            'firstChild',
          );

          expect(trace.length).toBe(2);
          expect(trace[0].messageText).toBe('Unable to evaluate this expression statically.');
          expect(absoluteFromSourceFile(trace[0].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[0])).toBe('body: {firstChild}');

          expect(trace[1].messageText).toBe(
            `A value for 'document' cannot be determined statically, as it is an external declaration.`,
          );
          expect(absoluteFromSourceFile(trace[1].file!)).toBe(_('/lib.d.ts'));
          expect(getSourceCode(trace[1])).toBe('document: any');
        });

        it('should trace array destructuring of dynamic value', () => {
          const trace = traceExpression(
            'const [firstChild] = document.body.childNodes;',
            'firstChild',
          );

          expect(trace.length).toBe(3);
          expect(trace[0].messageText).toBe('Unable to evaluate this expression statically.');
          expect(absoluteFromSourceFile(trace[0].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[0])).toBe('firstChild');

          expect(trace[1].messageText).toBe('Unable to evaluate this expression statically.');
          expect(absoluteFromSourceFile(trace[1].file!)).toBe(_('/entry.ts'));
          expect(getSourceCode(trace[1])).toBe('document.body');

          expect(trace[2].messageText).toBe(
            `A value for 'document' cannot be determined statically, as it is an external declaration.`,
          );
          expect(absoluteFromSourceFile(trace[2].file!)).toBe(_('/lib.d.ts'));
          expect(getSourceCode(trace[2])).toBe('document: any');
        });
      });
    }
  });
});

function getSourceCode(diag: ts.DiagnosticRelatedInformation): string {
  const text = diag.file!.text;
  return text.slice(diag.start!, diag.start! + diag.length!);
}

function traceExpression(code: string, expr: string): ts.DiagnosticRelatedInformation[] {
  const {program} = makeProgram(
    [
      {name: _('/entry.ts'), contents: `${code}; const target$ = ${expr};`},
      {name: _('/lib.d.ts'), contents: `declare const document: any;`},
    ],
    /* options */ undefined,
    /* host */ undefined,
    /* checkForErrors */ false,
  );
  const checker = program.getTypeChecker();
  const decl = getDeclaration(program, _('/entry.ts'), 'target$', ts.isVariableDeclaration);
  const valueExpr = decl.initializer!;

  const reflectionHost = new TypeScriptReflectionHost(checker);
  const evaluator = new PartialEvaluator(reflectionHost, checker, /* dependencyTracker */ null);

  const value = evaluator.evaluate(valueExpr);
  if (!(value instanceof DynamicValue)) {
    throw new Error('Expected DynamicValue');
  }
  return traceDynamicValue(valueExpr, value);
}
