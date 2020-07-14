/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {Evaluator} from '../../src/metadata/evaluator';
import {Symbols} from '../../src/metadata/symbols';

import {Directory, expectNoDiagnostics, findVar, findVarInitializer, Host} from './typescript.mocks';

describe('Evaluator', () => {
  const documentRegistry = ts.createDocumentRegistry();
  let host: ts.LanguageServiceHost;
  let service: ts.LanguageService;
  let program: ts.Program;
  let typeChecker: ts.TypeChecker;
  let symbols: Symbols;
  let evaluator: Evaluator;

  beforeEach(() => {
    host = new Host(FILES, [
      'expressions.ts', 'consts.ts', 'const_expr.ts', 'forwardRef.ts', 'classes.ts',
      'newExpression.ts', 'errors.ts', 'declared.ts'
    ]);
    service = ts.createLanguageService(host, documentRegistry);
    program = service.getProgram()!;
    typeChecker = program.getTypeChecker();
    symbols = new Symbols(null as any as ts.SourceFile);
    evaluator = new Evaluator(symbols, new Map());
  });

  it('should not have typescript errors in test data', () => {
    expectNoDiagnostics(service.getCompilerOptionsDiagnostics());
    for (const sourceFile of program.getSourceFiles()) {
      expectNoDiagnostics(service.getSyntacticDiagnostics(sourceFile.fileName));
      if (sourceFile.fileName != 'errors.ts') {
        // Skip errors.ts because we it has intentional semantic errors that we are testing for.
        expectNoDiagnostics(service.getSemanticDiagnostics(sourceFile.fileName));
      }
    }
  });

  it('should be able to fold literal expressions', () => {
    const consts = program.getSourceFile('consts.ts')!;
    expect(evaluator.isFoldable(findVarInitializer(consts, 'someName'))).toBeTruthy();
    expect(evaluator.isFoldable(findVarInitializer(consts, 'someBool'))).toBeTruthy();
    expect(evaluator.isFoldable(findVarInitializer(consts, 'one'))).toBeTruthy();
    expect(evaluator.isFoldable(findVarInitializer(consts, 'two'))).toBeTruthy();
  });

  it('should be able to fold expressions with foldable references', () => {
    const expressions = program.getSourceFile('expressions.ts')!;
    symbols.define('someName', 'some-name');
    symbols.define('someBool', true);
    symbols.define('one', 1);
    symbols.define('two', 2);
    expect(evaluator.isFoldable(findVarInitializer(expressions, 'three'))).toBeTruthy();
    expect(evaluator.isFoldable(findVarInitializer(expressions, 'four'))).toBeTruthy();
    symbols.define('three', 3);
    symbols.define('four', 4);
    expect(evaluator.isFoldable(findVarInitializer(expressions, 'obj'))).toBeTruthy();
    expect(evaluator.isFoldable(findVarInitializer(expressions, 'arr'))).toBeTruthy();
  });

  it('should be able to evaluate literal expressions', () => {
    const consts = program.getSourceFile('consts.ts')!;
    expect(evaluator.evaluateNode(findVarInitializer(consts, 'someName'))).toBe('some-name');
    expect(evaluator.evaluateNode(findVarInitializer(consts, 'someBool'))).toBe(true);
    expect(evaluator.evaluateNode(findVarInitializer(consts, 'one'))).toBe(1);
    expect(evaluator.evaluateNode(findVarInitializer(consts, 'two'))).toBe(2);
  });

  it('should be able to evaluate expressions', () => {
    const expressions = program.getSourceFile('expressions.ts')!;
    symbols.define('someName', 'some-name');
    symbols.define('someBool', true);
    symbols.define('one', 1);
    symbols.define('two', 2);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'three'))).toBe(3);
    symbols.define('three', 3);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'four'))).toBe(4);
    symbols.define('four', 4);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'obj')))
        .toEqual({one: 1, two: 2, three: 3, four: 4});
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'arr'))).toEqual([1, 2, 3, 4]);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bTrue'))).toEqual(true);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bFalse'))).toEqual(false);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bAnd'))).toEqual(true);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bOr'))).toEqual(true);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'nDiv'))).toEqual(2);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'nMod'))).toEqual(1);


    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bLOr'))).toEqual(false || true);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bLAnd'))).toEqual(true && true);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bBOr'))).toEqual(0x11 | 0x22);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bBAnd'))).toEqual(0x11 & 0x03);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bXor'))).toEqual(0x11 ^ 0x21);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bEqual')))
        .toEqual(1 == <any>'1');
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bNotEqual')))
        .toEqual(1 != <any>'1');
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bIdentical')))
        .toEqual(1 === <any>'1');
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bNotIdentical')))
        .toEqual(1 !== <any>'1');
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bLessThan'))).toEqual(1 < 2);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bGreaterThan'))).toEqual(1 > 2);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bLessThanEqual')))
        .toEqual(1 <= 2);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bGreaterThanEqual')))
        .toEqual(1 >= 2);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bShiftLeft'))).toEqual(1 << 2);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bShiftRight'))).toEqual(-1 >> 2);
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'bShiftRightU')))
        .toEqual(-1 >>> 2);
  });

  it('should report recursive references as symbolic', () => {
    const expressions = program.getSourceFile('expressions.ts')!;
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'recursiveA')))
        .toEqual({__symbolic: 'reference', name: 'recursiveB'});
    expect(evaluator.evaluateNode(findVarInitializer(expressions, 'recursiveB')))
        .toEqual({__symbolic: 'reference', name: 'recursiveA'});
  });

  it('should correctly handle special cases for CONST_EXPR', () => {
    const const_expr = program.getSourceFile('const_expr.ts')!;
    expect(evaluator.evaluateNode(findVarInitializer(const_expr, 'bTrue'))).toEqual(true);
    expect(evaluator.evaluateNode(findVarInitializer(const_expr, 'bFalse'))).toEqual(false);
  });

  it('should resolve a forwardRef', () => {
    const forwardRef = program.getSourceFile('forwardRef.ts')!;
    expect(evaluator.evaluateNode(findVarInitializer(forwardRef, 'bTrue'))).toEqual(true);
    expect(evaluator.evaluateNode(findVarInitializer(forwardRef, 'bFalse'))).toEqual(false);
  });

  it('should return new expressions', () => {
    symbols.define('Value', {__symbolic: 'reference', module: './classes', name: 'Value'});
    evaluator = new Evaluator(symbols, new Map());
    const newExpression = program.getSourceFile('newExpression.ts')!;
    expect(evaluator.evaluateNode(findVarInitializer(newExpression, 'someValue'))).toEqual({
      __symbolic: 'new',
      expression:
          {__symbolic: 'reference', name: 'Value', module: './classes', line: 4, character: 33},
      arguments: ['name', 12]
    });
    expect(evaluator.evaluateNode(findVarInitializer(newExpression, 'complex'))).toEqual({
      __symbolic: 'new',
      expression:
          {__symbolic: 'reference', name: 'Value', module: './classes', line: 5, character: 42},
      arguments: ['name', 12]
    });
  });

  it('should support reference to a declared module type', () => {
    const declared = program.getSourceFile('declared.ts')!;
    const aDecl = findVar(declared, 'a')!;
    expect(evaluator.evaluateNode(aDecl.type!)).toEqual({
      __symbolic: 'select',
      expression: {__symbolic: 'reference', name: 'Foo'},
      member: 'A'
    });
  });

  it('should return errors for unsupported expressions', () => {
    const errors = program.getSourceFile('errors.ts')!;
    const fDecl = findVar(errors, 'f')!;
    expect(evaluator.evaluateNode(fDecl.initializer!))
        .toEqual({__symbolic: 'error', message: 'Lambda not supported', line: 1, character: 12});
    const eDecl = findVar(errors, 'e')!;
    expect(evaluator.evaluateNode(eDecl.type!)).toEqual({
      __symbolic: 'error',
      message: 'Could not resolve type',
      line: 2,
      character: 11,
      context: {typeName: 'NotFound'}
    });
    const sDecl = findVar(errors, 's')!;
    expect(evaluator.evaluateNode(sDecl.initializer!)).toEqual({
      __symbolic: 'error',
      message: 'Name expected',
      line: 3,
      character: 14,
      context: {received: '1'}
    });
    const tDecl = findVar(errors, 't')!;
    expect(evaluator.evaluateNode(tDecl.initializer!)).toEqual({
      __symbolic: 'error',
      message: 'Expression form not supported',
      line: 4,
      character: 12
    });
  });

  it('should be able to fold an array spread', () => {
    const expressions = program.getSourceFile('expressions.ts')!;
    symbols.define('arr', [1, 2, 3, 4]);
    const arrSpread = findVar(expressions, 'arrSpread')!;
    expect(evaluator.evaluateNode(arrSpread.initializer!)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('should be able to produce a spread expression', () => {
    const expressions = program.getSourceFile('expressions.ts')!;
    const arrSpreadRef = findVar(expressions, 'arrSpreadRef')!;
    expect(evaluator.evaluateNode(arrSpreadRef.initializer!)).toEqual([
      0, {__symbolic: 'spread', expression: {__symbolic: 'reference', name: 'arrImport'}}, 5
    ]);
  });

  it('should be able to handle a new expression with no arguments', () => {
    const source = sourceFileOf(`
      export var a = new f;
    `);
    const expr = findVar(source, 'a')!;
    expect(evaluator.evaluateNode(expr.initializer!))
        .toEqual({__symbolic: 'new', expression: {__symbolic: 'reference', name: 'f'}});
  });

  describe('with substitution', () => {
    let evaluator: Evaluator;
    const lambdaTemp = 'lambdaTemp';

    beforeEach(() => {
      evaluator = new Evaluator(symbols, new Map(), {
        substituteExpression: (value, node) => {
          if (node.kind == ts.SyntaxKind.ArrowFunction) {
            return {__symbolic: 'reference', name: lambdaTemp};
          }
          return value;
        }
      });
    });

    it('should be able to substitute a lambda with a reference', () => {
      const source = sourceFileOf(`
        var b = 1;
        export var a = () => b;
      `);
      const expr = findVar(source, 'a');
      expect(evaluator.evaluateNode(expr!.initializer!))
          .toEqual({__symbolic: 'reference', name: lambdaTemp});
    });

    it('should be able to substitute a lambda in an expression', () => {
      const source = sourceFileOf(`
        var b = 1;
        export var a = [
          { provide: 'someValue': useFactory: () => b }
        ];
      `);
      const expr = findVar(source, 'a');
      expect(evaluator.evaluateNode(expr!.initializer!)).toEqual([
        {provide: 'someValue', useFactory: {__symbolic: 'reference', name: lambdaTemp}}
      ]);
    });
  });
});

function sourceFileOf(text: string): ts.SourceFile {
  return ts.createSourceFile('test.ts', text, ts.ScriptTarget.Latest, true);
}

const FILES: Directory = {
  'directives.ts': `
    export function Pipe(options: { name?: string, pure?: boolean}) {
      return function(fn: Function) { }
    }
    `,
  'classes.ts': `
    export class Value {
      constructor(public name: string, public value: any) {}
    }
  `,
  'consts.ts': `
    export var someName = 'some-name';
    export var someBool = true;
    export var one = 1;
    export var two = 2;
    export var arrImport = [1, 2, 3, 4];
  `,
  'expressions.ts': `
    import {arrImport} from './consts';

    export var someName = 'some-name';
    export var someBool = true;
    export var one = 1;
    export var two = 2;

    export var three = one + two;
    export var four = two * two;
    export var obj = { one: one, two: two, three: three, four: four };
    export var arr = [one, two, three, four];
    export var bTrue = someBool;
    export var bFalse = !someBool;
    export var bAnd = someBool && someBool;
    export var bOr = someBool || someBool;
    export var nDiv = four / two;
    export var nMod = (four + one) % two;

    export var bLOr = false || true;             // true
    export var bLAnd = true && true;             // true
    export var bBOr = 0x11 | 0x22;               // 0x33
    export var bBAnd = 0x11 & 0x03;              // 0x01
    export var bXor = 0x11 ^ 0x21;               // 0x20
    export var bEqual = 1 == <any>"1";           // true
    export var bNotEqual = 1 != <any>"1";        // false
    export var bIdentical = 1 === <any>"1";      // false
    export var bNotIdentical = 1 !== <any>"1";   // true
    export var bLessThan = 1 < 2;                // true
    export var bGreaterThan = 1 > 2;             // false
    export var bLessThanEqual = 1 <= 2;          // true
    export var bGreaterThanEqual = 1 >= 2;       // false
    export var bShiftLeft = 1 << 2;              // 0x04
    export var bShiftRight = -1 >> 2;            // -1
    export var bShiftRightU = -1 >>> 2;          // 0x3fffffff

    export var arrSpread = [0, ...arr, 5];

    export var arrSpreadRef = [0, ...arrImport, 5];

    export var recursiveA = recursiveB;
    export var recursiveB = recursiveA;
  `,
  'A.ts': `
    import {Pipe} from './directives';

    @Pipe({name: 'A', pure: false})
    export class A {}`,
  'B.ts': `
    import {Pipe} from './directives';
    import {someName, someBool} from './consts';

    @Pipe({name: someName, pure: someBool})
    export class B {}`,
  'const_expr.ts': `
    function CONST_EXPR(value: any) { return value; }
    export var bTrue = CONST_EXPR(true);
    export var bFalse = CONST_EXPR(false);
  `,
  'forwardRef.ts': `
    function forwardRef(value: any) { return value; }
    export var bTrue = forwardRef(() => true);
    export var bFalse = forwardRef(() => false);
  `,
  'newExpression.ts': `
    import {Value} from './classes';
    function CONST_EXPR(value: any) { return value; }
    function forwardRef(value: any) { return value; }
    export const someValue = new Value("name", 12);
    export const complex = CONST_EXPR(new Value("name", forwardRef(() => 12)));
  `,
  'errors.ts': `
    let f = () => 1;
    let e: NotFound;
    let s = { 1: 1, 2: 2 };
    let t = typeof 12;
  `,
  'declared.ts': `
    declare namespace Foo {
      type A = string;
    }

    let a: Foo.A = 'some value';
  `
};
