/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PartialModule} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';
import * as ts from 'typescript';

import {getAngularClassTransformerFactory} from '../../src/transformers/r3_transform';
import {Directory, MockAotContext, MockCompilerHost} from '../mocks';

const someGenFilePath = '/somePackage/someGenFile';
const someGenFileName = someGenFilePath + '.ts';

describe('r3_transform_spec', () => {
  let context: MockAotContext;
  let host: MockCompilerHost;

  beforeEach(() => {
    context = new MockAotContext('/', FILES);
    host = new MockCompilerHost(context);
  });

  it('should be able to generate a simple identity function', () => {
    expect(emitStaticMethod(new o.ReturnStatement(o.variable('v')), ['v']))
        .toContain('static someMethod(v) { return v; }');
  });

  it('should be able to generate a static field declaration', () => {
    expect(emitStaticField(o.literal(10))).toContain('SomeClass.someField = 10');
  });

  it('should be able to import a symbol', () => {
    expect(emitStaticMethod(new o.ReturnStatement(
               o.importExpr(new o.ExternalReference('@angular/core', 'Component')))))
        .toContain('static someMethod() { return i0.Component; } }');
  });

  it('should be able to modify multiple classes in the same module', () => {
    const result = emit(getAngularClassTransformerFactory(
        [{
          fileName: someGenFileName,
          statements: [
            classMethod(new o.ReturnStatement(o.variable('v')), ['v'], 'someMethod', 'SomeClass'),
            classMethod(
                new o.ReturnStatement(o.variable('v')), ['v'], 'someOtherMethod', 'SomeOtherClass')
          ]
        }],
        false));
    expect(result).toContain('static someMethod(v) { return v; }');
    expect(result).toContain('static someOtherMethod(v) { return v; }');
  });

  it('should insert imports after existing imports', () => {
    context = context.override({
      somePackage: {
        'someGenFile.ts': `
        import {Component} from '@angular/core';

        @Component({selector: 'some-class', template: 'hello!'})
        export class SomeClass {}

        export class SomeOtherClass {}
      `
      }
    });
    host = new MockCompilerHost(context);

    expect(emitStaticMethod(new o.ReturnStatement(
               o.importExpr(new o.ExternalReference('@angular/core', 'Component')))))
        .toContain('const core_1 = require("@angular/core"); const i0 = require("@angular/core");');
  });

  function emit(factory: ts.TransformerFactory<ts.SourceFile>): string {
    let result: string = '';
    const program = ts.createProgram(
        [someGenFileName], {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017}, host);
    const moduleSourceFile = program.getSourceFile(someGenFileName);
    const transformers: ts.CustomTransformers = {before: [factory]};
    const emitResult = program.emit(
        moduleSourceFile, (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
          if (fileName.startsWith(someGenFilePath)) {
            result = data;
          }
        }, undefined, undefined, transformers);
    return normalizeResult(result);
  }

  function emitStaticMethod(
      stmt: o.Statement|o.Statement[], parameters: string[] = [], methodName: string = 'someMethod',
      className: string = 'SomeClass'): string {
    const module: PartialModule = {
      fileName: someGenFileName,
      statements: [classMethod(stmt, parameters, methodName, className)]
    };
    return emit(getAngularClassTransformerFactory([module], false));
  }

  function emitStaticField(
      initializer: o.Expression, fieldName: string = 'someField',
      className: string = 'SomeClass'): string {
    const module: PartialModule = {
      fileName: someGenFileName,
      statements: [classField(initializer, fieldName, className)]
    };
    return emit(getAngularClassTransformerFactory([module], false));
  }
});

const FILES: Directory = {
  somePackage: {
    'someGenFile.ts': `

  export class SomeClass {}

  export class SomeOtherClass {}
`
  }
};

function classMethod(
    stmt: o.Statement|o.Statement[], parameters: string[] = [], methodName: string = 'someMethod',
    className: string = 'SomeClass'): o.ClassStmt {
  const statements = Array.isArray(stmt) ? stmt : [stmt];
  return new o.ClassStmt(
      /* name */ className,
      /* parent */ null,
      /* fields */[],
      /* getters */[],
      /* constructorMethod */ new o.ClassMethod(null, [], []),
      /* methods */[new o.ClassMethod(
          methodName, parameters.map(name => new o.FnParam(name)), statements, null,
          [o.StmtModifier.Static])]);
}

function classField(
    initializer: o.Expression, fieldName: string = 'someField',
    className: string = 'SomeClass'): o.ClassStmt {
  return new o.ClassStmt(
      /* name */ className,
      /* parent */ null,
      /* fields */[new o.ClassField(fieldName, null, [o.StmtModifier.Static], initializer)],
      /* getters */[],
      /* constructorMethod */ new o.ClassMethod(null, [], []),
      /* methods */[]);
}

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
