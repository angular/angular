/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '@angular/compiler/src/aot/static_symbol';
import {CompileIdentifierMetadata} from '@angular/compiler/src/compile_metadata';
import * as o from '@angular/compiler/src/output/output_ast';
import {ImportResolver} from '@angular/compiler/src/output/path_util';
import {TypeScriptEmitter} from '@angular/compiler/src/output/ts_emitter';

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
  // Not supported features of our OutputAst in TS:
  // - real `const` like in Dart
  // - final fields

  describe('TypeScriptEmitter', () => {
    let importResolver: ImportResolver;
    let emitter: TypeScriptEmitter;
    let someVar: o.ReadVarExpr;

    beforeEach(() => {
      importResolver = new SimpleJsImportGenerator();
      emitter = new TypeScriptEmitter(importResolver);
      someVar = o.variable('someVar', null, null);
    });

    function emitStmt(
        stmt: o.Statement | o.Statement[], exportedVars: string[] | null = null,
        preamble?: string): string {
      const stmts = Array.isArray(stmt) ? stmt : [stmt];
      const source = emitter.emitStatements(
          someSourceFilePath, someGenFilePath, stmts, exportedVars || [], preamble);
      return stripSourceMapAndNewLine(source);
    }

    it('should declare variables', () => {
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt())).toEqual(`var someVar:any = 1;`);
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt(null, [o.StmtModifier.Final])))
          .toEqual(`const someVar:any = 1;`);
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt(), ['someVar']))
          .toEqual(`export var someVar:any = 1;`);
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt(o.INT_TYPE)))
          .toEqual(`var someVar:number = 1;`);
      expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt(o.INFERRED_TYPE)))
          .toEqual(`var someVar = 1;`);
    });

    describe('declare variables with ExternExpressions as values', () => {
      it('should create no reexport if the identifier is in the same module', () => {
        // identifier is in the same module -> no reexport
        expect(emitStmt(someVar.set(o.importExpr(sameModuleIdentifier)).toDeclStmt(), ['someVar']))
            .toEqual('export var someVar:any = someLocalId;');
      });

      it('should create no reexport if the variable is not exported', () => {
        expect(emitStmt(someVar.set(o.importExpr(externalModuleIdentifier)).toDeclStmt())).toEqual([
          `import * as i0 from 'somePackage/someOtherPath';`, `var someVar:any = i0.someExternalId;`
        ].join('\n'));
      });

      it('should create no reexport if the variable is typed', () => {
        expect(emitStmt(
                   someVar.set(o.importExpr(externalModuleIdentifier)).toDeclStmt(o.DYNAMIC_TYPE),
                   ['someVar']))
            .toEqual([
              `import * as i0 from 'somePackage/someOtherPath';`,
              `export var someVar:any = i0.someExternalId;`
            ].join('\n'));
      });

      it('should create no reexport if the identifier has members', () => {
        const externalModuleIdentifierWithMembers: CompileIdentifierMetadata = {
          reference: new StaticSymbol(anotherModuleUrl, 'someExternalId', ['a'])
        };
        expect(emitStmt(
                   someVar.set(o.importExpr(externalModuleIdentifierWithMembers)).toDeclStmt(),
                   ['someVar']))
            .toEqual([
              `import * as i0 from 'somePackage/someOtherPath';`,
              `export var someVar:any = i0.someExternalId.a;`
            ].join('\n'));
      });

      it('should create a reexport', () => {
        expect(
            emitStmt(someVar.set(o.importExpr(externalModuleIdentifier)).toDeclStmt(), ['someVar']))
            .toEqual([
              `export {someExternalId as someVar} from 'somePackage/someOtherPath';`, ``
            ].join('\n'));
      });

      it('should create multiple reexports from the same file', () => {
        const someVar2 = o.variable('someVar2');
        const externalModuleIdentifier2: CompileIdentifierMetadata = {
          reference: new StaticSymbol(anotherModuleUrl, 'someExternalId2', [])
        };
        expect(emitStmt(
                   [
                     someVar.set(o.importExpr(externalModuleIdentifier)).toDeclStmt(),
                     someVar2.set(o.importExpr(externalModuleIdentifier2)).toDeclStmt()
                   ],
                   ['someVar', 'someVar2']))
            .toEqual([
              `export {someExternalId as someVar,someExternalId2 as someVar2} from 'somePackage/someOtherPath';`,
              ``
            ].join('\n'));
      });

      it('should use `importAs` for reexports', () => {
        spyOn(importResolver, 'getImportAs')
            .and.returnValue(new StaticSymbol('somePackage/importAsModule', 'importAsName', []));
        expect(
            emitStmt(someVar.set(o.importExpr(externalModuleIdentifier)).toDeclStmt(), ['someVar']))
            .toEqual([
              `export {importAsName as someVar} from 'somePackage/importAsModule';`, ``
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
      expect(emitStmt(o.literalMap([['someKey', o.literal(1)]]).toStmt())).toEqual(`{someKey:1};`);
    });

    it('should break expressions into multiple lines if they are too long', () => {
      const values: o.Expression[] = new Array(100);
      values.fill(o.literal(1));
      values.splice(50, 0, o.fn([], [new o.ReturnStatement(o.literal(1))]));
      expect(emitStmt(o.variable('fn').callFn(values).toStmt())).toEqual([
        'fn(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,',
        '    1,1,1,1,1,1,1,1,1,1,():void => {', '      return 1;',
        '    },1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,',
        '    1,1,1,1,1,1,1,1,1,1,1,1);'
      ].join('\n'));
    });

    it('should apply quotes to each entry within a map produced with literalMap when true', () => {
      expect(
          emitStmt(
              o.literalMap([['a', o.literal('a')], ['*', o.literal('star')]], null, true).toStmt())
              .replace(/\s+/gm, ''))
          .toEqual(`{'a':'a','*':'star'};`);
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

    it('should support `importAs` for external identifiers', () => {
      spyOn(importResolver, 'getImportAs')
          .and.returnValue(new StaticSymbol('somePackage/importAsModule', 'importAsName', []));
      expect(emitStmt(o.importExpr(externalModuleIdentifier).toStmt())).toEqual([
        `import * as i0 from 'somePackage/importAsModule';`, `i0.importAsName;`
      ].join('\n'));
    });

    it('should support operators', () => {
      const lhs = o.variable('lhs');
      const rhs = o.variable('rhs');
      expect(emitStmt(someVar.cast(o.INT_TYPE).toStmt())).toEqual('(<number>someVar);');
      expect(emitStmt(o.not(someVar).toStmt())).toEqual('!someVar;');
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
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [], [
      ]))).toEqual(['function someFn():void {', '}'].join('\n'));
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [], []), ['someFn'])).toEqual([
        'export function someFn():void {', '}'
      ].join('\n'));
      expect(emitStmt(new o.DeclareFunctionStmt(
                 'someFn', [], [new o.ReturnStatement(o.literal(1))], o.INT_TYPE)))
          .toEqual(['function someFn():number {', '  return 1;', '}'].join('\n'));
      expect(emitStmt(new o.DeclareFunctionStmt('someFn', [new o.FnParam('param1', o.INT_TYPE)], [
      ]))).toEqual(['function someFn(param1:number):void {', '}'].join('\n'));
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
        'try {', '  body();', '} catch (error) {', '  const stack:any = error.stack;',
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
        ]))).toEqual(['class SomeClass {', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt('SomeClass', null !, [], [], null !, []), ['SomeClass']))
            .toEqual(['export class SomeClass {', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt('SomeClass', o.variable('SomeSuperClass'), [], [], null !, [
        ]))).toEqual(['class SomeClass extends SomeSuperClass {', '}'].join('\n'));
      });

      it('should support declaring constructors', () => {
        const superCall = o.SUPER_EXPR.callFn([o.variable('someParam')]).toStmt();
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [], new o.ClassMethod(null !, [], []), [])))
            .toEqual(['class SomeClass {', '  constructor() {', '  }', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [],
                   new o.ClassMethod(null !, [new o.FnParam('someParam', o.INT_TYPE)], []), [])))
            .toEqual(
                ['class SomeClass {', '  constructor(someParam:number) {', '  }', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [], new o.ClassMethod(null !, [], [superCall]), [])))
            .toEqual([
              'class SomeClass {', '  constructor() {', '    super(someParam);', '  }', '}'
            ].join('\n'));
        expect(
            emitStmt(new o.ClassStmt(
                'SomeClass', null !, [], [], new o.ClassMethod(null !, [], [callSomeMethod]), [])))
            .toEqual([
              'class SomeClass {', '  constructor() {', '    this.someMethod();', '  }', '}'
            ].join('\n'));
      });

      it('should support declaring fields', () => {
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [new o.ClassField('someField')], [], null !, [])))
            .toEqual(['class SomeClass {', '  someField:any;', '}'].join('\n'));
        expect(
            emitStmt(new o.ClassStmt(
                'SomeClass', null !, [new o.ClassField('someField', o.INT_TYPE)], [], null !, [])))
            .toEqual(['class SomeClass {', '  someField:number;', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !,
                   [new o.ClassField('someField', o.INT_TYPE, [o.StmtModifier.Private])], [],
                   null !, [])))
            .toEqual(['class SomeClass {', '  /*private*/ someField:number;', '}'].join('\n'));
      });

      it('should support declaring getters', () => {
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [new o.ClassGetter('someGetter', [])], null !, [])))
            .toEqual(['class SomeClass {', '  get someGetter():any {', '  }', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [new o.ClassGetter('someGetter', [], o.INT_TYPE)],
                   null !, [])))
            .toEqual(['class SomeClass {', '  get someGetter():number {', '  }', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [new o.ClassGetter('someGetter', [callSomeMethod])],
                   null !, [])))
            .toEqual([
              'class SomeClass {', '  get someGetter():any {', '    this.someMethod();', '  }', '}'
            ].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [],
                   [new o.ClassGetter('someGetter', [], null !, [o.StmtModifier.Private])], null !,
                   [])))
            .toEqual(
                ['class SomeClass {', '  private get someGetter():any {', '  }', '}'].join('\n'));
      });

      it('should support methods', () => {
        expect(emitStmt(new o.ClassStmt('SomeClass', null !, [], [], null !, [
          new o.ClassMethod('someMethod', [], [])
        ]))).toEqual(['class SomeClass {', '  someMethod():void {', '  }', '}'].join('\n'));
        expect(emitStmt(new o.ClassStmt('SomeClass', null !, [], [], null !, [
          new o.ClassMethod('someMethod', [], [], o.INT_TYPE)
        ]))).toEqual(['class SomeClass {', '  someMethod():number {', '  }', '}'].join('\n'));
        expect(
            emitStmt(new o.ClassStmt(
                'SomeClass', null !, [], [], null !,
                [new o.ClassMethod('someMethod', [new o.FnParam('someParam', o.INT_TYPE)], [])])))
            .toEqual([
              'class SomeClass {', '  someMethod(someParam:number):void {', '  }', '}'
            ].join('\n'));
        expect(emitStmt(new o.ClassStmt(
                   'SomeClass', null !, [], [], null !,
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

    it('should support `importAs` for external types', () => {
      spyOn(importResolver, 'getImportAs')
          .and.returnValue(new StaticSymbol('somePackage/importAsModule', 'importAsName', []));
      const writeVarExpr = o.variable('a').set(o.NULL_EXPR);
      expect(emitStmt(writeVarExpr.toDeclStmt(o.importType(externalModuleIdentifier)))).toEqual([
        `import * as i0 from 'somePackage/importAsModule';`,
        `var a:i0.importAsName = (null as any);`
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
      expect(emitStmt(writeVarExpr.toDeclStmt(new o.ArrayType(null !))))
          .toEqual('var a:any[] = (null as any);');
      expect(emitStmt(writeVarExpr.toDeclStmt(new o.ArrayType(o.INT_TYPE))))
          .toEqual('var a:number[] = (null as any);');

      expect(emitStmt(writeVarExpr.toDeclStmt(new o.MapType(null))))
          .toEqual('var a:{[key: string]:any} = (null as any);');
      expect(emitStmt(writeVarExpr.toDeclStmt(new o.MapType(o.INT_TYPE))))
          .toEqual('var a:{[key: string]:number} = (null as any);');
    });

    it('should support a preamble', () => {
      expect(emitStmt(o.variable('a').toStmt(), [], '/* SomePreamble */')).toBe([
        '/* SomePreamble */', 'a;'
      ].join('\n'));
    });
  });
}
