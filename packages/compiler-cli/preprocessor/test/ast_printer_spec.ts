/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {outputAst as o} from '@angular/compiler';
import {ExpressionPrinter} from '../src/output_ast_printer.js';
import {stripIife} from '../src/compiler-utils.js';

describe('ExpressionPrinter.printType', () => {
  const printer = new ExpressionPrinter('test.ts');

  beforeEach(() => {
    printer.reset();
  });

  describe('Builtin Types', () => {
    it('should print boolean type', () => {
      expect(printer.printType(o.BOOL_TYPE)).toBe('boolean');
    });

    it('should print dynamic type', () => {
      expect(printer.printType(o.DYNAMIC_TYPE)).toBe('any');
    });

    it('should print number type', () => {
      expect(printer.printType(o.INT_TYPE)).toBe('number');
      expect(printer.printType(o.NUMBER_TYPE)).toBe('number');
    });

    it('should print string type', () => {
      expect(printer.printType(o.STRING_TYPE)).toBe('string');
    });

    it('should print none type as never', () => {
      expect(printer.printType(o.NONE_TYPE)).toBe('never');
    });

    it('should print function type', () => {
      expect(printer.printType(o.FUNCTION_TYPE)).toBe('Function');
    });

    it('should print inferred type as empty', () => {
      expect(printer.printType(o.INFERRED_TYPE)).toBe('');
    });
  });

  describe('Expression Types', () => {
    it('should print a simple class expression type', () => {
      const type = new o.ExpressionType(o.variable('MyClass'));
      expect(printer.printType(type)).toBe('MyClass');
    });

    it('should print an expression type with generic arguments', () => {
      const myClassRef = o.importExpr({name: 'MyClass', moduleName: './my-module'});
      const type = new o.ExpressionType(myClassRef, undefined, [o.STRING_TYPE, o.INT_TYPE]);
      expect(printer.printType(type)).toBe('i1.MyClass<string, number>');
    });

    it('should print expression type with nested generic arguments', () => {
      const myClassRef = o.importExpr({name: 'MyClass', moduleName: './my-module'});
      const anotherClassRef = o.importExpr({name: 'AnotherClass', moduleName: './another-module'});
      const type = new o.ExpressionType(myClassRef, undefined, [
        new o.ExpressionType(anotherClassRef, undefined, [o.BOOL_TYPE]),
      ]);
      expect(printer.printType(type)).toBe('i1.MyClass<i2.AnotherClass<boolean>>');
    });
  });

  describe('Array Types', () => {
    it('should print an array of builtin type', () => {
      const type = new o.ArrayType(o.STRING_TYPE);
      expect(printer.printType(type)).toBe('string[]');
    });

    it('should print an array of expression type', () => {
      const type = new o.ArrayType(new o.ExpressionType(o.variable('MyClass')));
      expect(printer.printType(type)).toBe('MyClass[]');
    });

    it('should print nested array types', () => {
      const type = new o.ArrayType(new o.ArrayType(o.INT_TYPE));
      expect(printer.printType(type)).toBe('number[][]');
    });
  });

  describe('Map Types', () => {
    it('should print a simple map type', () => {
      const type = new o.MapType(o.STRING_TYPE);
      expect(printer.printType(type)).toBe('{ [key: string]: string; }');
    });

    it('should print a map type with null valueType as unknown', () => {
      const type = new o.MapType(null);
      expect(printer.printType(type)).toBe('{ [key: string]: unknown; }');
    });

    it('should print a map type with expression type value', () => {
      const type = new o.MapType(new o.ExpressionType(o.variable('MyClass')));
      expect(printer.printType(type)).toBe('{ [key: string]: MyClass; }');
    });

    it('should print nested map types', () => {
      const type = new o.MapType(new o.MapType(o.BOOL_TYPE));
      expect(printer.printType(type)).toBe('{ [key: string]: { [key: string]: boolean; }; }');
    });
  });

  describe('Complex Nested Structures', () => {
    it('should print map of arrays of generic expressions', () => {
      const myClassRef = o.importExpr({name: 'MyClass', moduleName: './my-module'});
      const type = new o.MapType(
        new o.ArrayType(new o.ExpressionType(myClassRef, undefined, [o.STRING_TYPE])),
      );
      expect(printer.printType(type)).toBe('{ [key: string]: i1.MyClass<string>[]; }');
    });

    it('should print generic types holding maps and arrays', () => {
      const myClassRef = o.importExpr({name: 'MyClass', moduleName: './my-module'});
      const type = new o.ExpressionType(myClassRef, undefined, [
        new o.MapType(o.INT_TYPE),
        new o.ArrayType(o.BOOL_TYPE),
      ]);
      expect(printer.printType(type)).toBe('i1.MyClass<{ [key: string]: number; }, boolean[]>');
    });
  });
});

describe('stripIife', () => {
  it('should unwrap arrow function with statement block body', () => {
    const stmt = o.variable('x').set(o.literal(1)).toStmt();
    const arrowFn = new o.ArrowFunctionExpr([], [stmt]);
    const iife = new o.InvokeFunctionExpr(arrowFn, []);
    const stmts = stripIife(iife);
    expect(stmts).toEqual([stmt]);
  });

  it('should unwrap arrow function with concise expression body', () => {
    const expr = o.variable('x').plus(o.literal(1));
    const arrowFn = new o.ArrowFunctionExpr([], expr);
    const iife = new o.InvokeFunctionExpr(arrowFn, []);
    const stmts = stripIife(iife);
    expect(stmts.length).toBe(1);
    expect(stmts[0] instanceof o.ExpressionStatement).toBeTrue();
    expect((stmts[0] as o.ExpressionStatement).expr).toBe(expr);
  });

  it('should unwrap regular function expression with statements', () => {
    const stmt = o.variable('x').set(o.literal(2)).toStmt();
    const fn = new o.FunctionExpr([], [stmt]);
    const iife = new o.InvokeFunctionExpr(fn, []);
    const stmts = stripIife(iife);
    expect(stmts).toEqual([stmt]);
  });

  it('should return non-IIFE expressions wrapped as a statement', () => {
    const expr = o.variable('x');
    const stmts = stripIife(expr);
    expect(stmts.length).toBe(1);
    expect(stmts[0] instanceof o.ExpressionStatement).toBeTrue();
    expect((stmts[0] as o.ExpressionStatement).expr).toBe(expr);
  });
});

describe('ExpressionPrinter.print - LocalizedString', () => {
  const printer = new ExpressionPrinter('test.ts');

  beforeEach(() => {
    printer.reset();
  });

  it('should print a simple LocalizedString without placeholders or metadata', () => {
    const localized = new o.LocalizedString({}, [new o.LiteralPiece('Hello World', null!)], [], []);
    expect(printer.print(localized)).toBe('$localize `Hello World`');
  });

  it('should print LocalizedString with meaning and description metadata', () => {
    const localized = new o.LocalizedString(
      {meaning: 'custom meaning', description: 'custom description'},
      [new o.LiteralPiece('Hello World', null!)],
      [],
      [],
    );
    expect(printer.print(localized)).toBe(
      '$localize `:custom meaning|custom description:Hello World`',
    );
  });

  it('should print LocalizedString with custom ID', () => {
    const localized = new o.LocalizedString(
      {customId: 'customId123'},
      [new o.LiteralPiece('Hello World', null!)],
      [],
      [],
    );
    expect(printer.print(localized)).toBe('$localize `:@@customId123:Hello World`');
  });

  it('should print LocalizedString with expressions and placeholder names', () => {
    const localized = new o.LocalizedString(
      {meaning: 'greeting', description: 'greeting text'},
      [new o.LiteralPiece('Hello ', null!), new o.LiteralPiece('!', null!)],
      [new o.PlaceholderPiece('NAME', null!)],
      [o.variable('name')],
    );
    expect(printer.print(localized)).toBe(
      '$localize `:greeting|greeting text:Hello ${name}:NAME:!`',
    );
  });

  it('should print LocalizedString with multiple expressions', () => {
    const localized = new o.LocalizedString(
      {},
      [
        new o.LiteralPiece('Count: ', null!),
        new o.LiteralPiece(' of ', null!),
        new o.LiteralPiece(' items', null!),
      ],
      [new o.PlaceholderPiece('CURRENT', null!), new o.PlaceholderPiece('TOTAL', null!)],
      [o.variable('curr'), o.variable('total')],
    );
    expect(printer.print(localized)).toBe(
      '$localize `Count: ${curr}:CURRENT: of ${total}:TOTAL: items`',
    );
  });
});

describe('binary operator @ts-ignore', () => {
  function emitStmt(expr: o.Expression, printTypes = true): string {
    const printer = new ExpressionPrinter(printTypes ? 'test.ts' : 'test.js');
    return printer.printStatement(expr.toStmt()).trim();
  }

  it('should add @ts-ignore when a numeric operator has a NotExpr operand', () => {
    const expr = o.not(o.variable('a')).bigger(o.literal(1));
    expect(emitStmt(expr)).toEqual('// @ts-ignore\n(!a > 1);');
  });

  it('should not add @ts-ignore for plain numeric comparisons', () => {
    const expr = o.variable('a').bigger(o.literal(1));
    expect(emitStmt(expr)).toEqual('(a > 1);');
  });

  it('should add @ts-ignore when nullish coalescing has a non-nullish left-hand-side', () => {
    const concat = o.literal('prefix-').plus(o.variable('a'));
    const expr = new o.ParenthesizedExpr(concat).nullishCoalesce(o.literal(''));
    expect(emitStmt(expr)).toEqual(`// @ts-ignore\n(('prefix-' + a) ?? '');`);
  });

  it('should not add @ts-ignore when nullish coalescing has a nullable left-hand-side', () => {
    expect(emitStmt(o.variable('a').nullishCoalesce(o.literal('')))).toEqual(`(a ?? '');`);
    expect(emitStmt(o.variable('a').and(o.variable('b')).nullishCoalesce(o.literal('')))).toEqual(
      `((a && b) ?? '');`,
    );
  });

  it('should add @ts-ignore when comparing a NotExpr with a non-boolean literal', () => {
    const expr = o.not(o.variable('a')).identical(o.literal('oh no'));
    expect(emitStmt(expr)).toEqual(`// @ts-ignore\n(!a === 'oh no');`);
  });

  it('should not add @ts-ignore when comparing a NotExpr with a boolean literal', () => {
    const expr = o.not(o.variable('a')).identical(o.literal(false));
    expect(emitStmt(expr)).toEqual('(!a === false);');
  });

  it('should not add @ts-ignore when printTypes is false', () => {
    const expr = o.not(o.variable('a')).bigger(o.literal(1));
    expect(emitStmt(expr, /* printTypes */ false)).toEqual('(!a > 1);');
  });

  it('should add at most one @ts-ignore per line when nested expressions match', () => {
    const lhs = o.not(o.variable('a')).bigger(o.literal(1));
    const rhs = o.not(o.variable('b')).bigger(o.literal(2));
    expect(emitStmt(lhs.plus(rhs))).toEqual('// @ts-ignore\n((!a > 1) + (!b > 2));');
  });
});
