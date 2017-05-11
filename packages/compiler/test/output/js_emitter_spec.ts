/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '@angular/compiler/src/aot/static_symbol';
import {CompileIdentifierMetadata} from '@angular/compiler/src/compile_metadata';
import {JavaScriptEmitter} from '@angular/compiler/src/output/js_emitter';
import * as o from '@angular/compiler/src/output/output_ast';
import {ImportResolver} from '@angular/compiler/src/output/path_util';

import {stripSourceMapAndNewLine} from './abstract_emitter_spec';

const someGenFilePath = 'somePackage/someGenFile';
const someSourceFilePath = 'somePackage/someSourceFile';
const anotherModuleUrl = 'somePackage/someOtherPath';

const sameModuleIdentifier: CompileIdentifierMetadata = {
  reference: new StaticSymbol(someGenFilePath, 'someLocalId', [])
};
const externalModuleIdentifier: CompileIdentifierMetadata = {
  reference: new StaticSymbol(anotherModuleUrl, 'someExternalId', [])
};

class SimpleJsImportGenerator implements ImportResolver {
  fileNameToModuleName(importedUrlStr: string, moduleUrlStr: string): string {
    return importedUrlStr;
  }
  getImportAs(symbol: StaticSymbol): StaticSymbol|null { return null; }
  getTypeArity(symbol: StaticSymbol): number|null { return null; }
}

export function main() {
  // Note supported features of our OutputAstin JavaScript / ES5:
  // - types
  // - declaring fields

  describe('JavaScriptEmitter', () => {
    let importResolver: ImportResolver;
    let emitter: JavaScriptEmitter;
    let someVar: o.ReadVarExpr;

    beforeEach(() => {
      importResolver = new SimpleJsImportGenerator();
      emitter = new JavaScriptEmitter(importResolver);
      someVar = o.variable('someVar');
    });

    function emitStmt(
        stmt: o.Statement, exportedVars: string[] | null = null, preamble?: string): string {
      const source = emitter.emitStatements(
          someSourceFilePath, someGenFilePath, [stmt], exportedVars || [], preamble);
      return stripSourceMapAndNewLine(source);
    }

    it('should declare variables', () => {
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt())).toEqual(`var someVar = 1;`);
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt(), ['someVar'])).toEqual([
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
      expect(emitStmt(o.literalMap([['someKey', o.literal(1)]]).toStmt())).toEqual(`{someKey:1};`);
    });

    it('should break expressions into multiple lines if they are too long', () => {
      const values: o.Expression[] = new Array(100);
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

    it('should support `importAs` for external identifiers', () => {
      spyOn(importResolver, 'getImportAs')
          .and.returnValue(new StaticSymbol('somePackage/importAsModule', 'importAsName', []));
      expect(emitStmt(o.importExpr(externalModuleIdentifier).toStmt())).toEqual([
        `var i0 = re` +
            `quire('somePackage/importAsModule');`,
        `i0.importAsName;`
      ].join('\n'));
    });

    it('should support operators', () => {
      const lhs = o.variable('lhs');
      const rhs = o.variable('rhs');
      expect(emitStmt(o.not(someVar).toStmt())).toEqual('!someVar;');
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
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [], [
      ]))).toEqual(['function someFn() {', '}'].join('\n'));
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [], []), ['someFn'])).toEqual([
        'function someFn() {', '}',
        `Object.defineProperty(exports, 'someFn', { get: function() { return someFn; }});`
      ].join('\n'));
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [], [
        new o.ReturnStatement(o.literal(1))
      ]))).toEqual(['function someFn() {', '  return 1;', '}'].join('\n'));
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [new o.FnParam('param1')], [
      ]))).toEqual(['function someFn(param1) {', '}'].join('\n'));
    });

    it('should support comments', () => {
      expect(emitStmt(new o.CommentStmt('a\nb'))).toEqual(['// a', '// b'].join('\n'));
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

    it('should support try/catch', () => {
      const bodyStmt = o.variable('body').callFn([]).toStmt();
      const catchStmt =
          o.variable('catchFn').callFn([o.CATCH_ERROR_VAR, o.CATCH_STACK_VAR]).toStmt();
      expect(emitStmt(new o.TryCatchStmt([bodyStmt], [catchStmt]))).toEqual([
        'try {', '  body();', '} catch (error) {', '  var stack = error.stack;',
        '  catchFn(error,stack);', '}'
      ].join('\n'));
    });

    it('should support support throwing',
       () => { expect(emitStmt(new o.ThrowStmt(someVar))).toEqual('throw someVar;'); });

    describe('classes', () => {
      let callSomeMethod: o.Statement;

      beforeEach(() => { callSomeMethod = o.THIS_EXPR.callMethod('someMethod', []).toStmt(); });

      it('should support declaring classes', () => {
        expect(emitStmt(new o.ClassStmt('SomeClass', null !, [], [], null !, [
        ]))).toEqual(['function SomeClass() {', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt('SomeClass', null !, [], [], null !, []), ['SomeClass']))
            .toEqual([
              'function SomeClass() {', '}',
              `Object.defineProperty(exports, 'SomeClass', { get: function() { return SomeClass; }});`
            ].join('\n'));
        expect(emitStmt(
                   new o.ClassStmt('SomeClass', o.variable('SomeSuperClass'), [], [], null !, [])))
            .toEqual([
              'function SomeClass() {', '}',
              'SomeClass.prototype = Object.create(SomeSuperClass.prototype);'
            ].join('\n'));
      });

      it('should support declaring constructors', () => {
        const superCall = o.SUPER_EXPR.callFn([o.variable('someParam')]).toStmt();
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [], new o.ClassMethod(null !, [], []), [])))
            .toEqual(['function SomeClass() {', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [],
                   new o.ClassMethod(null !, [new o.FnParam('someParam')], []), [])))
            .toEqual(['function SomeClass(someParam) {', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', o.variable('SomeSuperClass'), [], [],
                   new o.ClassMethod(null !, [], [superCall]), [])))
            .toEqual([
              'function SomeClass() {', '  var self = this;',
              '  SomeSuperClass.call(this, someParam);', '}',
              'SomeClass.prototype = Object.create(SomeSuperClass.prototype);'
            ].join('\n'));
        expect(
            emitStmt(new o.ClassStmt(
                'SomeClass', null !, [], [], new o.ClassMethod(null !, [], [callSomeMethod]), [])))
            .toEqual([
              'function SomeClass() {', '  var self = this;', '  self.someMethod();', '}'
            ].join('\n'));
      });

      it('should support declaring getters', () => {
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [new o.ClassGetter('someGetter', [])], null !, [])))
            .toEqual([
              'function SomeClass() {', '}',
              `Object.defineProperty(SomeClass.prototype, 'someGetter', { get: function() {`, `}});`
            ].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [new o.ClassGetter('someGetter', [callSomeMethod])],
                   null !, [])))
            .toEqual([
              'function SomeClass() {', '}',
              `Object.defineProperty(SomeClass.prototype, 'someGetter', { get: function() {`,
              `  var self = this;`, `  self.someMethod();`, `}});`
            ].join('\n'));
      });

      it('should support methods', () => {
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [], null !, [new o.ClassMethod('someMethod', [], [])])))
            .toEqual([
              'function SomeClass() {', '}', 'SomeClass.prototype.someMethod = function() {', '};'
            ].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [], null !,
                   [new o.ClassMethod('someMethod', [new o.FnParam('someParam')], [])])))
            .toEqual([
              'function SomeClass() {', '}',
              'SomeClass.prototype.someMethod = function(someParam) {', '};'
            ].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [], null !,
                   [new o.ClassMethod('someMethod', [], [callSomeMethod])])))
            .toEqual([
              'function SomeClass() {', '}', 'SomeClass.prototype.someMethod = function() {',
              '  var self = this;', '  self.someMethod();', '};'
            ].join('\n'));
      });
    });

    it('should support a preamble', () => {
      expect(emitStmt(o.variable('a').toStmt(), [], '/* SomePreamble */')).toBe([
        '/* SomePreamble */', 'a;'
      ].join('\n'));
    });
  });
}
