/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '@angular/compiler/src/aot/static_symbol';
import * as o from '@angular/compiler/src/output/output_ast';
import {TypeScriptEmitter} from '@angular/compiler/src/output/ts_emitter';
import {ParseLocation, ParseSourceFile, ParseSourceSpan} from '@angular/compiler/src/parse_util';
import {newArray} from '@angular/compiler/src/util';

import {stripSourceMapAndNewLine} from './abstract_emitter_spec';

const someGenFilePath = 'somePackage/someGenFile';
const anotherModuleUrl = 'somePackage/someOtherPath';

const sameModuleIdentifier = new o.ExternalReference(null, 'someLocalId', null);

const externalModuleIdentifier = new o.ExternalReference(anotherModuleUrl, 'someExternalId', null);

{
  // Not supported features of our OutputAst in TS:
  // - real `const` like in Dart
  // - final fields

  describe('TypeScriptEmitter', () => {
    let emitter: TypeScriptEmitter;
    let someVar: o.ReadVarExpr;

    beforeEach(() => {
      emitter = new TypeScriptEmitter();
      someVar = o.variable('someVar', null, null);
    });

    function emitStmt(stmt: o.Statement|o.Statement[], preamble?: string): string {
      const stmts = Array.isArray(stmt) ? stmt : [stmt];
      const source = emitter.emitStatements(someGenFilePath, stmts, preamble);
      return stripSourceMapAndNewLine(source);
    }

    it('should declare variables', () => {
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt())).toEqual(`var someVar:any = 1;`);
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt(null, [o.StmtModifier.Final])))
          .toEqual(`const someVar:any = 1;`);
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt(null, [o.StmtModifier.Exported])))
          .toEqual(`export var someVar:any = 1;`);
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt(o.INT_TYPE)))
          .toEqual(`var someVar:number = 1;`);
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt(o.INFERRED_TYPE)))
          .toEqual(`var someVar = 1;`);
    });

    describe('declare variables with ExternExpressions as values', () => {
      it('should create no reexport if the identifier is in the same module', () => {
        // identifier is in the same module -> no reexport
        expect(emitStmt(someVar.set(o.importExpr(sameModuleIdentifier)).toDeclStmt(null, [
          o.StmtModifier.Exported
        ]))).toEqual('export var someVar:any = someLocalId;');
      });

      it('should create no reexport if the variable is not exported', () => {
        expect(emitStmt(someVar.set(o.importExpr(externalModuleIdentifier)).toDeclStmt())).toEqual([
          `import * as i0 from 'somePackage/someOtherPath';`, `var someVar:any = i0.someExternalId;`
        ].join('\n'));
      });

      it('should create no reexport if the variable is typed', () => {
        expect(emitStmt(someVar.set(o.importExpr(externalModuleIdentifier))
                            .toDeclStmt(o.DYNAMIC_TYPE, [o.StmtModifier.Exported])))
            .toEqual([
              `import * as i0 from 'somePackage/someOtherPath';`,
              `export var someVar:any = i0.someExternalId;`
            ].join('\n'));
      });

      it('should create a reexport', () => {
        expect(emitStmt(someVar.set(o.importExpr(externalModuleIdentifier))
                            .toDeclStmt(null, [o.StmtModifier.Exported])))
            .toEqual([
              `export {someExternalId as someVar} from 'somePackage/someOtherPath';`, ``
            ].join('\n'));
      });

      it('should create multiple reexports from the same file', () => {
        const someVar2 = o.variable('someVar2');
        const externalModuleIdentifier2 =
            new o.ExternalReference(anotherModuleUrl, 'someExternalId2', null);
        expect(emitStmt([
          someVar.set(o.importExpr(externalModuleIdentifier))
              .toDeclStmt(null, [o.StmtModifier.Exported]),
          someVar2.set(o.importExpr(externalModuleIdentifier2))
              .toDeclStmt(null, [o.StmtModifier.Exported])
        ]))
            .toEqual([
              `export {someExternalId as someVar,someExternalId2 as someVar2} from 'somePackage/someOtherPath';`,
              ``
            ].join('\n'));
      });
    });

    it('should read and write variables', () => {
      expect(emitStmt(someVar.toStmt())).toEqual(`someVar;`);
      expect(emitStmt(someVar.set(o.literal(1)).toStmt())).toEqual(`someVar = 1;`);
      expect(emitStmt(someVar.set(o.variable('someOtherVar').set(o.literal(1))).toStmt()))
          .toEqual(`someVar = (someOtherVar = 1);`);
    });

    it('should read and write keys', () => {
      expect(emitStmt(o.variable('someMap').key(o.variable('someKey')).toStmt()))
          .toEqual(`someMap[someKey];`);
      expect(emitStmt(o.variable('someMap').key(o.variable('someKey')).set(o.literal(1)).toStmt()))
          .toEqual(`someMap[someKey] = 1;`);
    });

    it('should read and write properties', () => {
      expect(emitStmt(o.variable('someObj').prop('someProp').toStmt()))
          .toEqual(`someObj.someProp;`);
      expect(emitStmt(o.variable('someObj').prop('someProp').set(o.literal(1)).toStmt()))
          .toEqual(`someObj.someProp = 1;`);
    });

    it('should invoke functions and methods and constructors', () => {
      expect(emitStmt(o.variable('someFn').callFn([o.literal(1)]).toStmt())).toEqual('someFn(1);');
      expect(emitStmt(o.variable('someObj').callMethod('someMethod', [o.literal(1)]).toStmt()))
          .toEqual('someObj.someMethod(1);');
      expect(emitStmt(o.variable('SomeClass').instantiate([o.literal(1)]).toStmt()))
          .toEqual('new SomeClass(1);');
    });

    it('should support builtin methods', () => {
      expect(emitStmt(o.variable('arr1')
                          .callMethod(o.BuiltinMethod.ConcatArray, [o.variable('arr2')])
                          .toStmt()))
          .toEqual('arr1.concat(arr2);');

      expect(emitStmt(o.variable('observable')
                          .callMethod(o.BuiltinMethod.SubscribeObservable, [o.variable('listener')])
                          .toStmt()))
          .toEqual('observable.subscribe(listener);');

      expect(
          emitStmt(
              o.variable('fn').callMethod(o.BuiltinMethod.Bind, [o.variable('someObj')]).toStmt()))
          .toEqual('fn.bind(someObj);');
    });

    it('should support literals', () => {
      expect(emitStmt(o.literal(0).toStmt())).toEqual('0;');
      expect(emitStmt(o.literal(true).toStmt())).toEqual('true;');
      expect(emitStmt(o.literal('someStr').toStmt())).toEqual(`'someStr';`);
      expect(emitStmt(o.literalArr([o.literal(1)]).toStmt())).toEqual(`[1];`);
      expect(emitStmt(o.literalMap([
                         {key: 'someKey', value: o.literal(1), quoted: false},
                         {key: 'a', value: o.literal('a'), quoted: false},
                         {key: '*', value: o.literal('star'), quoted: true},
                       ]).toStmt())
                 .replace(/\s+/gm, ''))
          .toEqual(`{someKey:1,a:'a','*':'star'};`);
    });

    it('should break expressions into multiple lines if they are too long', () => {
      const values: o.Expression[] = newArray(100);
      values.fill(o.literal(1));
      values.splice(50, 0, o.fn([], [new o.ReturnStatement(o.literal(1))]));
      expect(emitStmt(o.variable('fn').callFn(values).toStmt())).toEqual([
        'fn(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,',
        '    1,1,1,1,1,1,1,1,1,1,():void => {', '      return 1;',
        '    },1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,',
        '    1,1,1,1,1,1,1,1,1,1,1,1);'
      ].join('\n'));
    });

    it('should support blank literals', () => {
      expect(emitStmt(o.literal(null).toStmt())).toEqual('(null as any);');
      expect(emitStmt(o.literal(undefined).toStmt())).toEqual('(undefined as any);');
      expect(emitStmt(o.variable('a', null).isBlank().toStmt())).toEqual('(a == null);');
    });

    it('should support external identifiers', () => {
      expect(emitStmt(o.importExpr(sameModuleIdentifier).toStmt())).toEqual('someLocalId;');
      expect(emitStmt(o.importExpr(externalModuleIdentifier).toStmt())).toEqual([
        `import * as i0 from 'somePackage/someOtherPath';`, `i0.someExternalId;`
      ].join('\n'));
    });

    it('should support operators', () => {
      const lhs = o.variable('lhs');
      const rhs = o.variable('rhs');
      expect(emitStmt(someVar.cast(o.INT_TYPE).toStmt())).toEqual('(<number>someVar);');
      expect(emitStmt(o.not(someVar).toStmt())).toEqual('!someVar;');
      expect(emitStmt(o.unary(o.UnaryOperator.Minus, someVar).toStmt())).toEqual('(-someVar);');
      expect(emitStmt(o.unary(o.UnaryOperator.Plus, someVar).toStmt())).toEqual('(+someVar);');
      expect(emitStmt(o.assertNotNull(someVar).toStmt())).toEqual('someVar!;');
      expect(
          emitStmt(someVar.conditional(o.variable('trueCase'), o.variable('falseCase')).toStmt()))
          .toEqual('(someVar? trueCase: falseCase);');

      expect(emitStmt(lhs.equals(rhs).toStmt())).toEqual('(lhs == rhs);');
      expect(emitStmt(lhs.notEquals(rhs).toStmt())).toEqual('(lhs != rhs);');
      expect(emitStmt(lhs.identical(rhs).toStmt())).toEqual('(lhs === rhs);');
      expect(emitStmt(lhs.notIdentical(rhs).toStmt())).toEqual('(lhs !== rhs);');
      expect(emitStmt(lhs.minus(rhs).toStmt())).toEqual('(lhs - rhs);');
      expect(emitStmt(lhs.plus(rhs).toStmt())).toEqual('(lhs + rhs);');
      expect(emitStmt(lhs.divide(rhs).toStmt())).toEqual('(lhs / rhs);');
      expect(emitStmt(lhs.multiply(rhs).toStmt())).toEqual('(lhs * rhs);');
      expect(emitStmt(lhs.modulo(rhs).toStmt())).toEqual('(lhs % rhs);');
      expect(emitStmt(lhs.and(rhs).toStmt())).toEqual('(lhs && rhs);');
      expect(emitStmt(lhs.or(rhs).toStmt())).toEqual('(lhs || rhs);');
      expect(emitStmt(lhs.lower(rhs).toStmt())).toEqual('(lhs < rhs);');
      expect(emitStmt(lhs.lowerEquals(rhs).toStmt())).toEqual('(lhs <= rhs);');
      expect(emitStmt(lhs.bigger(rhs).toStmt())).toEqual('(lhs > rhs);');
      expect(emitStmt(lhs.biggerEquals(rhs).toStmt())).toEqual('(lhs >= rhs);');
    });

    it('should support function expressions', () => {
      expect(emitStmt(o.fn([], []).toStmt())).toEqual(['():void => {', '};'].join('\n'));
      expect(emitStmt(o.fn([], [new o.ReturnStatement(o.literal(1))], o.INT_TYPE).toStmt()))
          .toEqual(['():number => {', '  return 1;\n};'].join('\n'));
      expect(emitStmt(o.fn([new o.FnParam('param1', o.INT_TYPE)], []).toStmt())).toEqual([
        '(param1:number):void => {', '};'
      ].join('\n'));
    });

    it('should support function statements', () => {
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [], []))).toEqual([
        'function someFn():void {', '}'
      ].join('\n'));
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [], [], null, [o.StmtModifier.Exported])))
          .toEqual(['export function someFn():void {', '}'].join('\n'));
      expect(emitStmt(new o.DeclareFunctionStmt(
                 'someFn', [], [new o.ReturnStatement(o.literal(1))], o.INT_TYPE)))
          .toEqual(['function someFn():number {', '  return 1;', '}'].join('\n'));
      expect(
          emitStmt(new o.DeclareFunctionStmt('someFn', [new o.FnParam('param1', o.INT_TYPE)], [])))
          .toEqual(['function someFn(param1:number):void {', '}'].join('\n'));
    });

    it('should support comments', () => {
      expect(emitStmt(new o.ReturnStatement(o.literal(1), null, [o.leadingComment('a\nb')])))
          .toEqual('// a\n// b\nreturn 1;');
    });

    it('should support if stmt', () => {
      const trueCase = o.variable('trueCase').callFn([]).toStmt();
      const falseCase = o.variable('falseCase').callFn([]).toStmt();
      expect(emitStmt(new o.IfStmt(o.variable('cond'), [trueCase]))).toEqual([
        'if (cond) { trueCase(); }'
      ].join('\n'));
      expect(emitStmt(new o.IfStmt(o.variable('cond'), [trueCase], [falseCase]))).toEqual([
        'if (cond) {', '  trueCase();', '} else {', '  falseCase();', '}'
      ].join('\n'));
    });

    it('should support localized strings', () => {
      const messageParts =
          [new o.LiteralPiece('ab\\:c', {} as any), new o.LiteralPiece('d"e\'f', {} as any)];
      const placeholders = [new o.PlaceholderPiece('ph1', {} as any)];
      const expressions = [o.literal(7, o.NUMBER_TYPE).plus(o.literal(8, o.NUMBER_TYPE))];
      const localizedString = o.localizedString({}, messageParts, placeholders, expressions);
      expect(emitStmt(new o.ExpressionStatement(localizedString)))
          .toEqual('$localize `ab\\\\:c${(7 + 8)}:ph1:d"e\'f`;');
    });

    it('should support try/catch', () => {
      const bodyStmt = o.variable('body').callFn([]).toStmt();
      const catchStmt =
          o.variable('catchFn').callFn([o.CATCH_ERROR_VAR, o.CATCH_STACK_VAR]).toStmt();
      expect(emitStmt(new o.TryCatchStmt([bodyStmt], [catchStmt]))).toEqual([
        'try {', '  body();', '} catch (error) {', '  const stack:any = error.stack;',
        '  catchFn(error,stack);', '}'
      ].join('\n'));
    });

    it('should support support throwing', () => {
      expect(emitStmt(new o.ThrowStmt(someVar))).toEqual('throw someVar;');
    });

    describe('classes', () => {
      let callSomeMethod: o.Statement;

      beforeEach(() => {
        callSomeMethod = o.THIS_EXPR.callMethod('someMethod', []).toStmt();
      });


      it('should support declaring classes', () => {
        expect(emitStmt(new o.ClassStmt('SomeClass', null!, [], [], null!, []))).toEqual([
          'class SomeClass {', '}'
        ].join('\n'));
        expect(emitStmt(new o.ClassStmt('SomeClass', null!, [], [], null!, [], [
          o.StmtModifier.Exported
        ]))).toEqual(['export class SomeClass {', '}'].join('\n'));
        expect(
            emitStmt(new o.ClassStmt('SomeClass', o.variable('SomeSuperClass'), [], [], null!, [])))
            .toEqual(['class SomeClass extends SomeSuperClass {', '}'].join('\n'));
      });

      it('should support declaring constructors', () => {
        const superCall = o.SUPER_EXPR.callFn([o.variable('someParam')]).toStmt();
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [], new o.ClassMethod(null!, [], []), [])))
            .toEqual(['class SomeClass {', '  constructor() {', '  }', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [],
                   new o.ClassMethod(null!, [new o.FnParam('someParam', o.INT_TYPE)], []), [])))
            .toEqual(
                ['class SomeClass {', '  constructor(someParam:number) {', '  }', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [], new o.ClassMethod(null!, [], [superCall]), [])))
            .toEqual([
              'class SomeClass {', '  constructor() {', '    super(someParam);', '  }', '}'
            ].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [], new o.ClassMethod(null!, [], [callSomeMethod]), [])))
            .toEqual([
              'class SomeClass {', '  constructor() {', '    this.someMethod();', '  }', '}'
            ].join('\n'));
      });

      it('should support declaring fields', () => {
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [new o.ClassField('someField')], [], null!, [])))
            .toEqual(['class SomeClass {', '  someField:any;', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [new o.ClassField('someField', o.INT_TYPE)], [], null!, [])))
            .toEqual(['class SomeClass {', '  someField:number;', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!,
                   [new o.ClassField('someField', o.INT_TYPE, [o.StmtModifier.Private])], [], null!,
                   [])))
            .toEqual(['class SomeClass {', '  /*private*/ someField:number;', '}'].join('\n'));
      });

      it('should support declaring getters', () => {
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [new o.ClassGetter('someGetter', [])], null!, [])))
            .toEqual(['class SomeClass {', '  get someGetter():any {', '  }', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [new o.ClassGetter('someGetter', [], o.INT_TYPE)], null!,
                   [])))
            .toEqual(['class SomeClass {', '  get someGetter():number {', '  }', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [new o.ClassGetter('someGetter', [callSomeMethod])],
                   null!, [])))
            .toEqual([
              'class SomeClass {', '  get someGetter():any {', '    this.someMethod();', '  }', '}'
            ].join('\n'));
        expect(
            emitStmt(new o.ClassStmt(
                'SomeClass', null!, [],
                [new o.ClassGetter('someGetter', [], null!, [o.StmtModifier.Private])], null!, [])))
            .toEqual(
                ['class SomeClass {', '  private get someGetter():any {', '  }', '}'].join('\n'));
      });

      it('should support methods', () => {
        expect(emitStmt(new o.ClassStmt('SomeClass', null!, [], [], null!, [
          new o.ClassMethod('someMethod', [], [])
        ]))).toEqual(['class SomeClass {', '  someMethod():void {', '  }', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt('SomeClass', null!, [], [], null!, [
          new o.ClassMethod('someMethod', [], [], o.INT_TYPE)
        ]))).toEqual(['class SomeClass {', '  someMethod():number {', '  }', '}'].join('\n'));
        expect(
            emitStmt(new o.ClassStmt(
                'SomeClass', null!, [], [], null!,
                [new o.ClassMethod('someMethod', [new o.FnParam('someParam', o.INT_TYPE)], [])])))
            .toEqual([
              'class SomeClass {', '  someMethod(someParam:number):void {', '  }', '}'
            ].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [], null!,
                   [new o.ClassMethod('someMethod', [], [callSomeMethod])])))
            .toEqual([
              'class SomeClass {', '  someMethod():void {', '    this.someMethod();', '  }', '}'
            ].join('\n'));
      });
    });

    it('should support builtin types', () => {
      const writeVarExpr = o.variable('a').set(o.NULL_EXPR);
      expect(emitStmt(writeVarExpr.toDeclStmt(o.DYNAMIC_TYPE)))
          .toEqual('var a:any = (null as any);');
      expect(emitStmt(writeVarExpr.toDeclStmt(o.BOOL_TYPE)))
          .toEqual('var a:boolean = (null as any);');
      expect(emitStmt(writeVarExpr.toDeclStmt(o.INT_TYPE)))
          .toEqual('var a:number = (null as any);');
      expect(emitStmt(writeVarExpr.toDeclStmt(o.NUMBER_TYPE)))
          .toEqual('var a:number = (null as any);');
      expect(emitStmt(writeVarExpr.toDeclStmt(o.STRING_TYPE)))
          .toEqual('var a:string = (null as any);');
      expect(emitStmt(writeVarExpr.toDeclStmt(o.FUNCTION_TYPE)))
          .toEqual('var a:Function = (null as any);');
    });

    it('should support external types', () => {
      const writeVarExpr = o.variable('a').set(o.NULL_EXPR);
      expect(emitStmt(writeVarExpr.toDeclStmt(o.importType(sameModuleIdentifier))))
          .toEqual('var a:someLocalId = (null as any);');
      expect(emitStmt(writeVarExpr.toDeclStmt(o.importType(externalModuleIdentifier)))).toEqual([
        `import * as i0 from 'somePackage/someOtherPath';`,
        `var a:i0.someExternalId = (null as any);`
      ].join('\n'));
    });

    it('should support expression types', () => {
      expect(
          emitStmt(o.variable('a').set(o.NULL_EXPR).toDeclStmt(o.expressionType(o.variable('b')))))
          .toEqual('var a:b = (null as any);');
    });

    it('should support expressions with type parameters', () => {
      expect(emitStmt(o.variable('a')
                          .set(o.NULL_EXPR)
                          .toDeclStmt(o.importType(externalModuleIdentifier, [o.STRING_TYPE]))))
          .toEqual([
            `import * as i0 from 'somePackage/someOtherPath';`,
            `var a:i0.someExternalId<string> = (null as any);`
          ].join('\n'));
    });

    it('should support combined types', () => {
      const writeVarExpr = o.variable('a').set(o.NULL_EXPR);
      expect(emitStmt(writeVarExpr.toDeclStmt(new o.ArrayType(null!))))
          .toEqual('var a:any[] = (null as any);');
      expect(emitStmt(writeVarExpr.toDeclStmt(new o.ArrayType(o.INT_TYPE))))
          .toEqual('var a:number[] = (null as any);');

      expect(emitStmt(writeVarExpr.toDeclStmt(new o.MapType(null))))
          .toEqual('var a:{[key: string]:any} = (null as any);');
      expect(emitStmt(writeVarExpr.toDeclStmt(new o.MapType(o.INT_TYPE))))
          .toEqual('var a:{[key: string]:number} = (null as any);');
    });

    describe('comments', () => {
      it('should support a preamble', () => {
        expect(emitStmt(o.variable('a').toStmt(), '/* SomePreamble */')).toBe([
          '/* SomePreamble */', 'a;'
        ].join('\n'));
      });

      it('should support singleline comments', () => {
        expect(emitStmt(new o.ReturnStatement(o.literal(1), null, [o.leadingComment('a\nb')])))
            .toBe('// a\n// b\nreturn 1;');
      });

      it('should support multiline comments', () => {
        expect(emitStmt(new o.ReturnStatement(o.literal(1), null, [
          o.leadingComment('Multiline comment', true)
        ]))).toBe('/* Multiline comment */\nreturn 1;');
        expect(emitStmt(new o.ReturnStatement(o.literal(1), null, [
          o.leadingComment(`Multiline\ncomment`, true)
        ]))).toBe(`/* Multiline\ncomment */\nreturn 1;`);
      });

      it('should support inline multiline comments', () => {
        expect(emitStmt(new o.ReturnStatement(o.literal(1), null, [
          o.leadingComment('inline comment', true, false)
        ]))).toBe('/* inline comment */return 1;');
      });

      it('should support JSDoc comments', () => {
        expect(emitStmt(new o.ReturnStatement(o.literal(1), null, [
          o.jsDocComment([{text: 'Intro comment'}])
        ]))).toBe(`/**\n * Intro comment\n */\nreturn 1;`);
        expect(emitStmt(new o.ReturnStatement(o.literal(1), null, [
          o.jsDocComment([{tagName: o.JSDocTagName.Desc, text: 'description'}])
        ]))).toBe(`/**\n * @desc description\n */\nreturn 1;`);
        expect(emitStmt(new o.ReturnStatement(
                   o.literal(1), null, [o.jsDocComment([
                     {text: 'Intro comment'},
                     {tagName: o.JSDocTagName.Desc, text: 'description'},
                     {tagName: o.JSDocTagName.Id, text: '{number} identifier 123'},
                   ])])))
            .toBe(
                `/**\n * Intro comment\n * @desc description\n * @id {number} identifier 123\n */\nreturn 1;`);
      });
    });

    describe('emitter context', () => {
      it('should be able to back to the generating span', () => {
        const file = new ParseSourceFile('some content', 'a.ts');
        const returnSpan = new ParseSourceSpan(
            new ParseLocation(file, 100, 10, 10), new ParseLocation(file, 200, 20, 10));
        const referenceSpan = new ParseSourceSpan(
            new ParseLocation(file, 150, 15, 10), new ParseLocation(file, 175, 17, 10));
        const statements = [new o.ClassStmt(
            'SomeClass', null, [], [], new o.ClassMethod(null, [], []),
            [new o.ClassMethod('someMethod', [new o.FnParam('a', o.INT_TYPE)], [
              o.variable('someVar', o.INT_TYPE).set(o.literal(0)).toDeclStmt(),
              new o.ReturnStatement(o.variable('someVar', null, referenceSpan), returnSpan)
            ])])];
        const {sourceText, context} =
            emitter.emitStatementsAndContext('a.ts', statements, '/* some preamble /*\n\n');
        const spanOf = (text: string, after: number = 0) => {
          const location = sourceText.indexOf(text, after);
          const {line, col} = calculateLineCol(sourceText, location);
          return context.spanOf(line, col);
        };
        const returnLoc = sourceText.indexOf('return');
        expect(spanOf('return someVar')).toEqual(returnSpan, 'return span calculated incorrectly');
        expect(spanOf(';', returnLoc)).toEqual(returnSpan, 'reference span calculated incorrectly');
        expect(spanOf('someVar', returnLoc))
            .toEqual(referenceSpan, 'return span calculated incorrectly');
      });
    });
  });
}

function calculateLineCol(text: string, offset: number): {line: number, col: number} {
  const lines = text.split('\n');
  let line = 0;
  for (let cur = 0; cur < text.length; line++) {
    const next = cur + lines[line].length + 1;
    if (next > offset) {
      return {line, col: offset - cur};
    }
    cur = next;
  }
  return {line, col: 0};
}
