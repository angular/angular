/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '@angular/compiler/src/aot/static_symbol';
import {JavaScriptEmitter} from '@angular/compiler/src/output/js_emitter';
import * as o from '@angular/compiler/src/output/output_ast';
import {newArray} from '@angular/compiler/src/util';

import {stripSourceMapAndNewLine} from './abstract_emitter_spec';

const someGenFilePath = 'somePackage/someGenFile';
const anotherModuleUrl = 'somePackage/someOtherPath';

const sameModuleIdentifier = new o.ExternalReference(null, 'someLocalId', null);

const externalModuleIdentifier = new o.ExternalReference(anotherModuleUrl, 'someExternalId', null);

{
  // Note supported features of our OutputAstin JavaScript / ES5:
  // - types
  // - declaring fields

  describe('JavaScriptEmitter', () => {
    let emitter: JavaScriptEmitter;
    let someVar: o.ReadVarExpr;

    beforeEach(() => {
      emitter = new JavaScriptEmitter();
      someVar = o.variable('someVar');
    });

    function emitStmt(stmt: o.Statement, preamble?: string): string {
      const source = emitter.emitStatements(someGenFilePath, [stmt], preamble);
      return stripSourceMapAndNewLine(source);
    }

    it('should declare variables', () => {
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt())).toEqual(`var someVar = 1;`);
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt(null, [o.StmtModifier.Exported])))
          .toEqual([
            'var someVar = 1;',
            `Object.defineProperty(exports, 'someVar', { get: function() { return someVar; }});`
          ].join('\n'));
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
        '    1,1,1,1,1,1,1,1,1,1,function() {', '      return 1;',
        '    },1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,',
        '    1,1,1,1,1,1,1,1,1,1,1,1);'
      ].join('\n'));
    });

    it('should support blank literals', () => {
      expect(emitStmt(o.literal(null).toStmt())).toEqual('null;');
      expect(emitStmt(o.literal(undefined).toStmt())).toEqual('undefined;');
    });

    it('should support external identifiers', () => {
      expect(emitStmt(o.importExpr(sameModuleIdentifier).toStmt())).toEqual('someLocalId;');
      expect(emitStmt(o.importExpr(externalModuleIdentifier).toStmt())).toEqual([
        `var i0 = re` +
            `quire('somePackage/someOtherPath');`,
        `i0.someExternalId;`
      ].join('\n'));
    });

    it('should support operators', () => {
      const lhs = o.variable('lhs');
      const rhs = o.variable('rhs');
      expect(emitStmt(o.not(someVar).toStmt())).toEqual('!someVar;');
      expect(emitStmt(o.unary(o.UnaryOperator.Minus, someVar).toStmt())).toEqual('(-someVar);');
      expect(emitStmt(o.unary(o.UnaryOperator.Plus, someVar).toStmt())).toEqual('(+someVar);');
      expect(emitStmt(o.assertNotNull(someVar).toStmt())).toEqual('someVar;');
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
      expect(emitStmt(o.fn([], []).toStmt())).toEqual(['function() {', '};'].join('\n'));
      expect(emitStmt(o.fn([], [new o.ReturnStatement(o.literal(1))]).toStmt())).toEqual([
        'function() {', '  return 1;\n};'
      ].join('\n'));
      expect(emitStmt(o.fn([new o.FnParam('param1')], []).toStmt())).toEqual([
        'function(param1) {', '};'
      ].join('\n'));
    });

    it('should support function statements', () => {
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [], []))).toEqual([
        'function someFn() {', '}'
      ].join('\n'));
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [], [], null, [o.StmtModifier.Exported])))
          .toEqual([
            'function someFn() {', '}',
            `Object.defineProperty(exports, 'someFn', { get: function() { return someFn; }});`
          ].join('\n'));
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [], [
        new o.ReturnStatement(o.literal(1))
      ]))).toEqual(['function someFn() {', '  return 1;', '}'].join('\n'));
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [new o.FnParam('param1')], []))).toEqual([
        'function someFn(param1) {', '}'
      ].join('\n'));
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

    it('should support ES5 localized strings', () => {
      const messageParts =
          [new o.LiteralPiece('ab\\:c', {} as any), new o.LiteralPiece('d"e\'f', {} as any)];
      const placeholders = [new o.PlaceholderPiece('ph1', {} as any)];
      const expressions = [o.literal(7, o.NUMBER_TYPE).plus(o.literal(8, o.NUMBER_TYPE))];
      const localizedString = o.localizedString({}, messageParts, placeholders, expressions);
      expect(emitStmt(new o.ExpressionStatement(localizedString)))
          .toEqual(
              String.raw
              `$localize((this&&this.__makeTemplateObject||function(e,t){return Object.defineProperty?Object.defineProperty(e,"raw",{value:t}):e.raw=t,e})(['ab\\:c', ':ph1:d"e\'f'], ['ab\\\\:c', ':ph1:d"e\'f']), (7 + 8));`);
    });

    it('should support try/catch', () => {
      const bodyStmt = o.variable('body').callFn([]).toStmt();
      const catchStmt =
          o.variable('catchFn').callFn([o.CATCH_ERROR_VAR, o.CATCH_STACK_VAR]).toStmt();
      expect(emitStmt(new o.TryCatchStmt([bodyStmt], [catchStmt]))).toEqual([
        'try {', '  body();', '} catch (error) {', '  var stack = error.stack;',
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
          'function SomeClass() {', '}'
        ].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [], null!, [], [o.StmtModifier.Exported])))
            .toEqual([
              'function SomeClass() {', '}',
              `Object.defineProperty(exports, 'SomeClass', { get: function() { return SomeClass; }});`
            ].join('\n'));
        expect(
            emitStmt(new o.ClassStmt('SomeClass', o.variable('SomeSuperClass'), [], [], null!, [])))
            .toEqual([
              'function SomeClass() {', '}',
              'SomeClass.prototype = Object.create(SomeSuperClass.prototype);'
            ].join('\n'));
      });

      it('should support declaring constructors', () => {
        const superCall = o.SUPER_EXPR.callFn([o.variable('someParam')]).toStmt();
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [], new o.ClassMethod(null!, [], []), [])))
            .toEqual(['function SomeClass() {', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [],
                   new o.ClassMethod(null!, [new o.FnParam('someParam')], []), [])))
            .toEqual(['function SomeClass(someParam) {', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', o.variable('SomeSuperClass'), [], [],
                   new o.ClassMethod(null!, [], [superCall]), [])))
            .toEqual([
              'function SomeClass() {', '  var self = this;',
              '  SomeSuperClass.call(this, someParam);', '}',
              'SomeClass.prototype = Object.create(SomeSuperClass.prototype);'
            ].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [], new o.ClassMethod(null!, [], [callSomeMethod]), [])))
            .toEqual([
              'function SomeClass() {', '  var self = this;', '  self.someMethod();', '}'
            ].join('\n'));
      });

      it('should support declaring getters', () => {
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [new o.ClassGetter('someGetter', [])], null!, [])))
            .toEqual([
              'function SomeClass() {', '}',
              `Object.defineProperty(SomeClass.prototype, 'someGetter', { get: function() {`, `}});`
            ].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [new o.ClassGetter('someGetter', [callSomeMethod])],
                   null!, [])))
            .toEqual([
              'function SomeClass() {', '}',
              `Object.defineProperty(SomeClass.prototype, 'someGetter', { get: function() {`,
              `  var self = this;`, `  self.someMethod();`, `}});`
            ].join('\n'));
      });

      it('should support methods', () => {
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [], null!, [new o.ClassMethod('someMethod', [], [])])))
            .toEqual([
              'function SomeClass() {', '}', 'SomeClass.prototype.someMethod = function() {', '};'
            ].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [], null!,
                   [new o.ClassMethod('someMethod', [new o.FnParam('someParam')], [])])))
            .toEqual([
              'function SomeClass() {', '}',
              'SomeClass.prototype.someMethod = function(someParam) {', '};'
            ].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null!, [], [], null!,
                   [new o.ClassMethod('someMethod', [], [callSomeMethod])])))
            .toEqual([
              'function SomeClass() {', '}', 'SomeClass.prototype.someMethod = function() {',
              '  var self = this;', '  self.someMethod();', '};'
            ].join('\n'));
      });
    });

    it('should support a preamble', () => {
      expect(emitStmt(o.variable('a').toStmt(), '/* SomePreamble */')).toBe([
        '/* SomePreamble */', 'a;'
      ].join('\n'));
    });
  });
}
