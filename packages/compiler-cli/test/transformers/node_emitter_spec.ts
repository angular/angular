/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseLocation, ParseSourceFile, ParseSourceSpan} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';
import {MappingItem, RawSourceMap, SourceMapConsumer} from 'source-map';
import * as ts from 'typescript';

import {TypeScriptNodeEmitter} from '../../src/transformers/node_emitter';
import {Directory, MockAotContext, MockCompilerHost} from '../mocks';

const someGenFilePath = '/somePackage/someGenFile';
const someGenFileName = someGenFilePath + '.ts';
const someSourceFilePath = '/somePackage/someSourceFile';
const anotherModuleUrl = '/somePackage/someOtherPath';

const sameModuleIdentifier = new o.ExternalReference(null, 'someLocalId', null);

const externalModuleIdentifier = new o.ExternalReference(anotherModuleUrl, 'someExternalId', null);

describe('TypeScriptNodeEmitter', () => {
  let context: MockAotContext;
  let host: MockCompilerHost;
  let emitter: TypeScriptNodeEmitter;
  let someVar: o.ReadVarExpr;

  beforeEach(() => {
    context = new MockAotContext('/', FILES);
    host = new MockCompilerHost(context);
    emitter = new TypeScriptNodeEmitter();
    someVar = o.variable('someVar', null, null);
  });

  function emitStmt(stmt: o.Statement | o.Statement[], preamble?: string): string {
    const stmts = Array.isArray(stmt) ? stmt : [stmt];

    const program = ts.createProgram(
        [someGenFileName], {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017}, host);
    const moduleSourceFile = program.getSourceFile(someGenFileName);
    const transformers: ts.CustomTransformers = {
      before: [context => {
        return sourceFile => {
          const [newSourceFile] = emitter.updateSourceFile(sourceFile, stmts, preamble);
          return newSourceFile;
        };
      }]
    };
    let result: string = '';
    const emitResult = program.emit(
        moduleSourceFile, (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
          if (fileName.startsWith(someGenFilePath)) {
            result = data;
          }
        }, undefined, undefined, transformers);
    return normalizeResult(result);
  }

  it('should declare variables', () => {
    expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt())).toEqual(`var someVar = 1;`);
    expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt(null, [o.StmtModifier.Final])))
        .toEqual(`var someVar = 1;`);
    expect(emitStmt(someVar.set(o.literal(1)).toDeclStmt(null, [o.StmtModifier.Exported])))
        .toEqual(`var someVar = 1; exports.someVar = someVar;`);
  });

  describe('declare variables with ExternExpressions as values', () => {
    it('should create no reexport if the identifier is in the same module', () => {
      // identifier is in the same module -> no reexport
      expect(emitStmt(someVar.set(o.importExpr(sameModuleIdentifier)).toDeclStmt(null, [
        o.StmtModifier.Exported
      ]))).toEqual('var someVar = someLocalId; exports.someVar = someVar;');
    });

    it('should create no reexport if the variable is not exported', () => {
      expect(emitStmt(someVar.set(o.importExpr(externalModuleIdentifier)).toDeclStmt()))
          .toEqual(
              `const i0 = require("/somePackage/someOtherPath"); var someVar = i0.someExternalId;`);
    });

    it('should create no reexport if the variable is typed', () => {
      expect(emitStmt(someVar.set(o.importExpr(externalModuleIdentifier))
                          .toDeclStmt(o.DYNAMIC_TYPE, [o.StmtModifier.Exported])))
          .toEqual(
              `const i0 = require("/somePackage/someOtherPath"); var someVar = i0.someExternalId; exports.someVar = someVar;`);
    });

    it('should create a reexport', () => {
      expect(emitStmt(someVar.set(o.importExpr(externalModuleIdentifier))
                          .toDeclStmt(null, [o.StmtModifier.Exported])))
          .toEqual(
              `var someOtherPath_1 = require("/somePackage/someOtherPath"); exports.someVar = someOtherPath_1.someExternalId;`);
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
          .toEqual(
              `var someOtherPath_1 = require("/somePackage/someOtherPath"); exports.someVar = someOtherPath_1.someExternalId; exports.someVar2 = someOtherPath_1.someExternalId2;`);
    });
  });

  it('should read and write variables', () => {
    expect(emitStmt(someVar.toStmt())).toEqual(`someVar;`);
    expect(emitStmt(someVar.set(o.literal(1)).toStmt())).toEqual(`someVar = 1;`);
    expect(emitStmt(someVar.set(o.variable('someOtherVar').set(o.literal(1))).toStmt()))
        .toEqual(`someVar = someOtherVar = 1;`);
  });

  it('should read and write keys', () => {
    expect(emitStmt(o.variable('someMap').key(o.variable('someKey')).toStmt()))
        .toEqual(`someMap[someKey];`);
    expect(emitStmt(o.variable('someMap').key(o.variable('someKey')).set(o.literal(1)).toStmt()))
        .toEqual(`someMap[someKey] = 1;`);
  });

  it('should read and write properties', () => {
    expect(emitStmt(o.variable('someObj').prop('someProp').toStmt())).toEqual(`someObj.someProp;`);
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

    expect(emitStmt(
               o.variable('fn').callMethod(o.BuiltinMethod.Bind, [o.variable('someObj')]).toStmt()))
        .toEqual('fn.bind(someObj);');
  });

  it('should support literals', () => {
    expect(emitStmt(o.literal(0).toStmt())).toEqual('0;');
    expect(emitStmt(o.literal(true).toStmt())).toEqual('true;');
    expect(emitStmt(o.literal('someStr').toStmt())).toEqual(`"someStr";`);
    expect(emitStmt(o.literalArr([o.literal(1)]).toStmt())).toEqual(`[1];`);
    expect(emitStmt(o.literalMap([
                       {key: 'someKey', value: o.literal(1), quoted: false},
                       {key: 'a', value: o.literal('a'), quoted: false},
                       {key: 'b', value: o.literal('b'), quoted: true},
                       {key: '*', value: o.literal('star'), quoted: false},
                     ]).toStmt())
               .replace(/\s+/gm, ''))
        .toEqual(`({someKey:1,a:"a","b":"b","*":"star"});`);
  });

  it('should support blank literals', () => {
    expect(emitStmt(o.literal(null).toStmt())).toEqual('null;');
    expect(emitStmt(o.literal(undefined).toStmt())).toEqual('undefined;');
    expect(emitStmt(o.variable('a', null).isBlank().toStmt())).toEqual('(a == null);');
  });

  it('should support external identifiers', () => {
    expect(emitStmt(o.importExpr(sameModuleIdentifier).toStmt())).toEqual('someLocalId;');
    expect(emitStmt(o.importExpr(externalModuleIdentifier).toStmt()))
        .toEqual(`const i0 = require("/somePackage/someOtherPath"); i0.someExternalId;`);
  });

  it('should support operators', () => {
    const lhs = o.variable('lhs');
    const rhs = o.variable('rhs');
    expect(emitStmt(someVar.cast(o.INT_TYPE).toStmt())).toEqual('someVar;');
    expect(emitStmt(o.not(someVar).toStmt())).toEqual('!someVar;');
    expect(emitStmt(o.assertNotNull(someVar).toStmt())).toEqual('someVar;');
    expect(emitStmt(someVar.conditional(o.variable('trueCase'), o.variable('falseCase')).toStmt()))
        .toEqual('(someVar ? trueCase : falseCase);');
    expect(emitStmt(someVar.conditional(o.variable('trueCase'), o.variable('falseCase'))
                        .conditional(o.variable('trueCase'), o.variable('falseCase'))
                        .toStmt()))
        .toEqual('((someVar ? trueCase : falseCase) ? trueCase : falseCase);');

    expect(emitStmt(lhs.equals(rhs).toStmt())).toEqual('(lhs == rhs);');
    expect(emitStmt(lhs.notEquals(rhs).toStmt())).toEqual('(lhs != rhs);');
    expect(emitStmt(lhs.identical(rhs).toStmt())).toEqual('(lhs === rhs);');
    expect(emitStmt(lhs.notIdentical(rhs).toStmt())).toEqual('(lhs !== rhs);');
    expect(emitStmt(lhs.minus(rhs).toStmt())).toEqual('(lhs - rhs);');
    expect(emitStmt(lhs.plus(rhs).toStmt())).toEqual('(lhs + rhs);');
    expect(emitStmt(lhs.divide(rhs).toStmt())).toEqual('(lhs / rhs);');
    expect(emitStmt(lhs.multiply(rhs).toStmt())).toEqual('(lhs * rhs);');
    expect(emitStmt(lhs.plus(rhs).multiply(rhs).toStmt())).toEqual('((lhs + rhs) * rhs);');
    expect(emitStmt(lhs.modulo(rhs).toStmt())).toEqual('(lhs % rhs);');
    expect(emitStmt(lhs.and(rhs).toStmt())).toEqual('(lhs && rhs);');
    expect(emitStmt(lhs.or(rhs).toStmt())).toEqual('(lhs || rhs);');
    expect(emitStmt(lhs.lower(rhs).toStmt())).toEqual('(lhs < rhs);');
    expect(emitStmt(lhs.lowerEquals(rhs).toStmt())).toEqual('(lhs <= rhs);');
    expect(emitStmt(lhs.bigger(rhs).toStmt())).toEqual('(lhs > rhs);');
    expect(emitStmt(lhs.biggerEquals(rhs).toStmt())).toEqual('(lhs >= rhs);');
  });

  it('should support function expressions', () => {
    expect(emitStmt(o.fn([], []).toStmt())).toEqual(`(function () { });`);
    expect(emitStmt(o.fn([], [new o.ReturnStatement(o.literal(1))], o.INT_TYPE).toStmt()))
        .toEqual(`(function () { return 1; });`);
    expect(emitStmt(o.fn([new o.FnParam('param1', o.INT_TYPE)], []).toStmt()))
        .toEqual(`(function (param1) { });`);
  });

  it('should support function statements', () => {
    expect(emitStmt(new o.DeclareFunctionStmt('someFn', [], []))).toEqual('function someFn() { }');
    expect(emitStmt(new o.DeclareFunctionStmt('someFn', [], [], null, [o.StmtModifier.Exported])))
        .toEqual(`function someFn() { } exports.someFn = someFn;`);
    expect(emitStmt(new o.DeclareFunctionStmt(
               'someFn', [], [new o.ReturnStatement(o.literal(1))], o.INT_TYPE)))
        .toEqual(`function someFn() { return 1; }`);
    expect(emitStmt(new o.DeclareFunctionStmt('someFn', [new o.FnParam('param1', o.INT_TYPE)], [
    ]))).toEqual(`function someFn(param1) { }`);
  });

  it('should support comments', () => { expect(emitStmt(new o.CommentStmt('a\nb'))).toEqual(''); });

  it('should support if stmt', () => {
    const trueCase = o.variable('trueCase').callFn([]).toStmt();
    const falseCase = o.variable('falseCase').callFn([]).toStmt();
    expect(emitStmt(new o.IfStmt(o.variable('cond'), [trueCase])))
        .toEqual('if (cond) { trueCase(); }');
    expect(emitStmt(new o.IfStmt(o.variable('cond'), [trueCase], [falseCase])))
        .toEqual('if (cond) { trueCase(); } else { falseCase(); }');
  });

  it('should support try/catch', () => {
    const bodyStmt = o.variable('body').callFn([]).toStmt();
    const catchStmt = o.variable('catchFn').callFn([o.CATCH_ERROR_VAR, o.CATCH_STACK_VAR]).toStmt();
    expect(emitStmt(new o.TryCatchStmt([bodyStmt], [catchStmt])))
        .toEqual(
            `try { body(); } catch (error) { var stack = error.stack; catchFn(error, stack); }`);
  });

  it('should support support throwing',
     () => { expect(emitStmt(new o.ThrowStmt(someVar))).toEqual('throw someVar;'); });

  describe('classes', () => {
    let callSomeMethod: o.Statement;

    beforeEach(() => { callSomeMethod = o.THIS_EXPR.callMethod('someMethod', []).toStmt(); });


    it('should support declaring classes', () => {
      expect(emitStmt(new o.ClassStmt('SomeClass', null !, [], [], null !, [
      ]))).toEqual('class SomeClass { }');
      expect(emitStmt(new o.ClassStmt('SomeClass', null !, [], [], null !, [], [
        o.StmtModifier.Exported
      ]))).toEqual('class SomeClass { } exports.SomeClass = SomeClass;');
      expect(emitStmt(new o.ClassStmt('SomeClass', o.variable('SomeSuperClass'), [], [], null !, [
      ]))).toEqual('class SomeClass extends SomeSuperClass { }');
    });

    it('should support declaring constructors', () => {
      const superCall = o.SUPER_EXPR.callFn([o.variable('someParam')]).toStmt();
      expect(emitStmt(new o.ClassStmt(
                 'SomeClass', null !, [], [], new o.ClassMethod(null !, [], []), [])))
          .toEqual(`class SomeClass { constructor() { } }`);
      expect(emitStmt(new o.ClassStmt(
                 'SomeClass', null !, [], [],
                 new o.ClassMethod(null !, [new o.FnParam('someParam', o.INT_TYPE)], []), [])))
          .toEqual(`class SomeClass { constructor(someParam) { } }`);
      expect(emitStmt(new o.ClassStmt(
                 'SomeClass', null !, [], [], new o.ClassMethod(null !, [], [superCall]), [])))
          .toEqual(`class SomeClass { constructor() { super(someParam); } }`);
      expect(emitStmt(new o.ClassStmt(
                 'SomeClass', null !, [], [], new o.ClassMethod(null !, [], [callSomeMethod]), [])))
          .toEqual(`class SomeClass { constructor() { this.someMethod(); } }`);
    });

    it('should support declaring fields', () => {
      expect(emitStmt(new o.ClassStmt(
                 'SomeClass', null !, [new o.ClassField('someField')], [], null !, [])))
          .toEqual(`class SomeClass { constructor() { this.someField = null; } }`);
      expect(emitStmt(new o.ClassStmt(
                 'SomeClass', null !, [new o.ClassField('someField', o.INT_TYPE)], [], null !, [])))
          .toEqual(`class SomeClass { constructor() { this.someField = null; } }`);
      expect(emitStmt(new o.ClassStmt(
                 'SomeClass', null !,
                 [new o.ClassField('someField', o.INT_TYPE, [o.StmtModifier.Private])], [], null !,
                 [])))
          .toEqual(`class SomeClass { constructor() { this.someField = null; } }`);
    });

    it('should support declaring getters', () => {
      expect(emitStmt(new o.ClassStmt(
                 'SomeClass', null !, [], [new o.ClassGetter('someGetter', [])], null !, [])))
          .toEqual(`class SomeClass { get someGetter() { } }`);
      expect(emitStmt(new o.ClassStmt(
                 'SomeClass', null !, [], [new o.ClassGetter('someGetter', [], o.INT_TYPE)], null !,
                 [])))
          .toEqual(`class SomeClass { get someGetter() { } }`);
      expect(emitStmt(new o.ClassStmt(
                 'SomeClass', null !, [], [new o.ClassGetter('someGetter', [callSomeMethod])],
                 null !, [])))
          .toEqual(`class SomeClass { get someGetter() { this.someMethod(); } }`);
      expect(
          emitStmt(new o.ClassStmt(
              'SomeClass', null !, [],
              [new o.ClassGetter('someGetter', [], null !, [o.StmtModifier.Private])], null !, [])))
          .toEqual(`class SomeClass { get someGetter() { } }`);
    });

    it('should support methods', () => {
      expect(emitStmt(new o.ClassStmt('SomeClass', null !, [], [], null !, [
        new o.ClassMethod('someMethod', [], [])
      ]))).toEqual(`class SomeClass { someMethod() { } }`);
      expect(emitStmt(new o.ClassStmt('SomeClass', null !, [], [], null !, [
        new o.ClassMethod('someMethod', [], [], o.INT_TYPE)
      ]))).toEqual(`class SomeClass { someMethod() { } }`);
      expect(emitStmt(new o.ClassStmt('SomeClass', null !, [], [], null !, [
        new o.ClassMethod('someMethod', [new o.FnParam('someParam', o.INT_TYPE)], [])
      ]))).toEqual(`class SomeClass { someMethod(someParam) { } }`);
      expect(emitStmt(new o.ClassStmt('SomeClass', null !, [], [], null !, [
        new o.ClassMethod('someMethod', [], [callSomeMethod])
      ]))).toEqual(`class SomeClass { someMethod() { this.someMethod(); } }`);
    });
  });

  it('should support builtin types', () => {
    const writeVarExpr = o.variable('a').set(o.NULL_EXPR);
    expect(emitStmt(writeVarExpr.toDeclStmt(o.DYNAMIC_TYPE))).toEqual('var a = null;');
    expect(emitStmt(writeVarExpr.toDeclStmt(o.BOOL_TYPE))).toEqual('var a = null;');
    expect(emitStmt(writeVarExpr.toDeclStmt(o.INT_TYPE))).toEqual('var a = null;');
    expect(emitStmt(writeVarExpr.toDeclStmt(o.NUMBER_TYPE))).toEqual('var a = null;');
    expect(emitStmt(writeVarExpr.toDeclStmt(o.STRING_TYPE))).toEqual('var a = null;');
    expect(emitStmt(writeVarExpr.toDeclStmt(o.FUNCTION_TYPE))).toEqual('var a = null;');
  });

  it('should support external types', () => {
    const writeVarExpr = o.variable('a').set(o.NULL_EXPR);
    expect(emitStmt(writeVarExpr.toDeclStmt(o.importType(sameModuleIdentifier))))
        .toEqual('var a = null;');
    expect(emitStmt(writeVarExpr.toDeclStmt(o.importType(externalModuleIdentifier))))
        .toEqual(`var a = null;`);
  });

  it('should support expression types', () => {
    expect(emitStmt(o.variable('a').set(o.NULL_EXPR).toDeclStmt(o.expressionType(o.variable('b')))))
        .toEqual('var a = null;');
  });

  it('should support expressions with type parameters', () => {
    expect(emitStmt(o.variable('a')
                        .set(o.NULL_EXPR)
                        .toDeclStmt(o.importType(externalModuleIdentifier, [o.STRING_TYPE]))))
        .toEqual(`var a = null;`);
  });

  it('should support combined types', () => {
    const writeVarExpr = o.variable('a').set(o.NULL_EXPR);
    expect(emitStmt(writeVarExpr.toDeclStmt(new o.ArrayType(null !)))).toEqual('var a = null;');
    expect(emitStmt(writeVarExpr.toDeclStmt(new o.ArrayType(o.INT_TYPE)))).toEqual('var a = null;');

    expect(emitStmt(writeVarExpr.toDeclStmt(new o.MapType(null)))).toEqual('var a = null;');
    expect(emitStmt(writeVarExpr.toDeclStmt(new o.MapType(o.INT_TYPE)))).toEqual('var a = null;');
  });

  it('should support a preamble', () => {
    expect(emitStmt(o.variable('a').toStmt(), '/* SomePreamble */')).toBe('/* SomePreamble */ a;');
  });

  describe('source maps', () => {
    function emitStmt(stmt: o.Statement | o.Statement[], preamble?: string): string {
      const stmts = Array.isArray(stmt) ? stmt : [stmt];

      const program = ts.createProgram(
          [someGenFileName], {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2017,
            sourceMap: true,
            inlineSourceMap: true,
            inlineSources: true,
          },
          host);
      const moduleSourceFile = program.getSourceFile(someGenFileName);
      const transformers: ts.CustomTransformers = {
        before: [context => {
          return sourceFile => {
            const [newSourceFile] = emitter.updateSourceFile(sourceFile, stmts, preamble);
            return newSourceFile;
          };
        }]
      };
      let result: string = '';
      const emitResult = program.emit(
          moduleSourceFile, (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
            if (fileName.startsWith(someGenFilePath)) {
              result = data;
            }
          }, undefined, undefined, transformers);
      return result;
    }

    it('should produce a source map that maps back to the source', () => {
      const statement = someVar.set(o.literal(1)).toDeclStmt();
      const text = '<my-comp> a = 1 </my-comp>';
      const sourceName = 'ng://some.file.html';
      const sourceUrl = 'file:///ng:/some.file.html';
      const file = new ParseSourceFile(text, sourceName);
      const start = new ParseLocation(file, 0, 0, 0);
      const end = new ParseLocation(file, text.length, 0, text.length);
      statement.sourceSpan = new ParseSourceSpan(start, end);

      const result = emitStmt(statement);

      // find the source map:
      const sourceMapMatch = /sourceMappingURL\=data\:application\/json;base64,(.*)$/.exec(result);
      const sourceMapBase64 = sourceMapMatch ![1];
      const sourceMapBuffer = Buffer.from(sourceMapBase64, 'base64');
      const sourceMapText = sourceMapBuffer.toString('utf8');
      const sourceMap: RawSourceMap = JSON.parse(sourceMapText);
      const consumer = new SourceMapConsumer(sourceMap);
      const mappings: MappingItem[] = [];
      consumer.eachMapping(mapping => { mappings.push(mapping); });
      expect(mappings).toEqual([
        {
          source: sourceUrl,
          generatedLine: 3,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          name: null
        },
        {
          source: sourceUrl,
          generatedLine: 3,
          generatedColumn: 16,
          originalLine: 1,
          originalColumn: 26,
          name: null
        }
      ]);
    });
  });
});

const FILES: Directory = {
  somePackage: {'someGenFile.ts': `export var a: number;`}
};

function normalizeResult(result: string): string {
  // Remove TypeScript prefixes
  // Remove new lines
  // Squish adjacent spaces
  // Remove prefix and postfix spaces
  return result.replace('"use strict";', ' ')
      .replace('exports.__esModule = true;', ' ')
      .replace('Object.defineProperty(exports, "__esModule", { value: true });', ' ')
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
      .replace(/^ /g, '')
      .replace(/ $/g, '');
}
