/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, ddescribe, describe, expect, iit, it} from '@angular/core/testing/testing_internal';
import * as ts from 'typescript';

import {ReflectorHost} from '../src/reflector_host';

import {Directory, Entry, MockCompilerHost, MockContext} from './mocks';

describe('reflector_host', () => {
  var context: MockContext;
  var host: ts.CompilerHost;
  var program: ts.Program;
  var reflectorNestedGenDir: ReflectorHost;
  var reflectorSiblingGenDir: ReflectorHost;

  beforeEach(() => {
    context = new MockContext('/tmp/src', clone(FILES));
    host = new MockCompilerHost(context);
    program = ts.createProgram(
        ['main.ts'], {
          module: ts.ModuleKind.CommonJS,
        },
        host);
    // Force a typecheck
    let errors = program.getSemanticDiagnostics();
    if (errors && errors.length) {
      throw new Error('Expected no errors');
    }
    reflectorNestedGenDir = new ReflectorHost(
        program, host, {
          genDir: '/tmp/project/src/gen/',
          basePath: '/tmp/project/src',
          skipMetadataEmit: false,
          strictMetadataEmit: false,
          skipTemplateCodegen: false,
          trace: false
        },
        context);
    reflectorSiblingGenDir = new ReflectorHost(
        program, host, {
          genDir: '/tmp/project/gen',
          basePath: '/tmp/project/src/',
          skipMetadataEmit: false,
          strictMetadataEmit: false,
          skipTemplateCodegen: false,
          trace: false
        },
        context);
  });

  describe('nestedGenDir', () => {
    it('should import node_module from factory', () => {
      expect(reflectorNestedGenDir.getImportPath(
                 '/tmp/project/src/gen/my.ngfactory.ts',
                 '/tmp/project/node_modules/@angular/core.d.ts'))
          .toEqual('@angular/core');
    });

    it('should import factory from factory', () => {
      expect(reflectorNestedGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/my.other.ngfactory.ts'))
          .toEqual('./my.other.ngfactory');
      expect(reflectorNestedGenDir.getImportPath(
                 '/tmp/project/src/a/my.ngfactory.ts', '/tmp/project/src/my.other.css.ts'))
          .toEqual('../my.other.css');
      expect(reflectorNestedGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/a/my.other.css.shim.ts'))
          .toEqual('./a/my.other.css.shim');
    });

    it('should import application from factory', () => {
      expect(reflectorNestedGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/my.other.ts'))
          .toEqual('../my.other');
      expect(reflectorNestedGenDir.getImportPath(
                 '/tmp/project/src/a/my.ngfactory.ts', '/tmp/project/src/my.other.ts'))
          .toEqual('../../my.other');
      expect(reflectorNestedGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/a/my.other.ts'))
          .toEqual('../a/my.other');
    });
  });

  describe('nestedGenDir', () => {
    it('should import node_module from factory', () => {
      expect(reflectorSiblingGenDir.getImportPath(
                 '/tmp/project/src/gen/my.ngfactory.ts',
                 '/tmp/project/node_modules/@angular/core.d.ts'))
          .toEqual('@angular/core');
    });

    it('should import factory from factory', () => {
      expect(reflectorSiblingGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/my.other.ngfactory.ts'))
          .toEqual('./my.other.ngfactory');
      expect(reflectorSiblingGenDir.getImportPath(
                 '/tmp/project/src/a/my.ngfactory.ts', '/tmp/project/src/my.other.css.ts'))
          .toEqual('../my.other.css');
      expect(reflectorSiblingGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/a/my.other.css.shim.ts'))
          .toEqual('./a/my.other.css.shim');
    });

    it('should import application from factory', () => {
      expect(reflectorSiblingGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/my.other.ts'))
          .toEqual('./my.other');
      expect(reflectorSiblingGenDir.getImportPath(
                 '/tmp/project/src/a/my.ngfactory.ts', '/tmp/project/src/my.other.ts'))
          .toEqual('../my.other');
      expect(reflectorSiblingGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/a/my.other.ts'))
          .toEqual('./a/my.other');
    });
  });

  it('should provide the import locations for angular', () => {
    let {coreDecorators, diDecorators, diMetadata, animationMetadata, provider} =
        reflectorNestedGenDir.angularImportLocations();
    expect(coreDecorators).toEqual('@angular/core/src/metadata');
    expect(diDecorators).toEqual('@angular/core/src/di/metadata');
    expect(diMetadata).toEqual('@angular/core/src/di/metadata');
    expect(animationMetadata).toEqual('@angular/core/src/animation/metadata');
    expect(provider).toEqual('@angular/core/src/di/provider');
  });

  it('should be able to produce an import from main @angular/core', () => {
    expect(reflectorNestedGenDir.getImportPath(
               '/tmp/project/src/main.ts', '/tmp/project/node_modules/@angular/core.d.ts'))
        .toEqual('@angular/core');
  });

  it('should be able to produce an import from main to a sub-directory', () => {
    expect(reflectorNestedGenDir.getImportPath('main.ts', 'lib/utils.ts')).toEqual('./lib/utils');
  });

  it('should be able to produce an import from to a peer file', () => {
    expect(reflectorNestedGenDir.getImportPath('lib/utils.ts', 'lib/collections.ts'))
        .toEqual('./collections');
  });

  it('should be able to produce an import from to a sibling directory', () => {
    expect(reflectorNestedGenDir.getImportPath('lib2/utils2.ts', 'lib/utils.ts'))
        .toEqual('../lib/utils');
  });

  it('should be able to produce a symbol for an exported symbol', () => {
    expect(reflectorNestedGenDir.findDeclaration('@angular/router', 'foo', 'main.ts'))
        .toBeDefined();
  });

  it('should be able to produce a symbol for values space only reference', () => {
    expect(reflectorNestedGenDir.findDeclaration('@angular/router/src/providers', 'foo', 'main.ts'))
        .toBeDefined();
  });


  it('should be produce the same symbol if asked twice', () => {
    let foo1 = reflectorNestedGenDir.getStaticSymbol('main.ts', 'foo');
    let foo2 = reflectorNestedGenDir.getStaticSymbol('main.ts', 'foo');
    expect(foo1).toBe(foo2);
  });

  it('should be able to produce a symbol for a module with no file', () => {
    expect(reflectorNestedGenDir.getStaticSymbol('angularjs', 'SomeAngularSymbol')).toBeDefined();
  });

  it('should be able to read a metadata file', () => {
    expect(reflectorNestedGenDir.getMetadataFor('node_modules/@angular/core.d.ts'))
        .toEqual({__symbolic: 'module', version: 1, metadata: {foo: {__symbolic: 'class'}}});
  });

  it('should be able to read metadata from an otherwise unused .d.ts file ', () => {
    expect(reflectorNestedGenDir.getMetadataFor('node_modules/@angular/unused.d.ts'))
        .toBeUndefined();
  });

  it('should be able to read empty metadata ', () => {
    expect(reflectorNestedGenDir.getMetadataFor('node_modules/@angular/empty.d.ts'))
        .toBeUndefined();
  });

  it('should return undefined for missing modules', () => {
    expect(reflectorNestedGenDir.getMetadataFor('node_modules/@angular/missing.d.ts'))
        .toBeUndefined();
  });

  it('should be able to trace a named export', () => {
    const symbol = reflectorNestedGenDir.findDeclaration(
        './reexport/reexport.d.ts', 'One', '/tmp/src/main.ts');
    expect(symbol.name).toEqual('One');
    expect(symbol.filePath).toEqual('/tmp/src/reexport/src/origin1.d.ts');
  });

  it('should be able to trace a renamed export', () => {
    const symbol = reflectorNestedGenDir.findDeclaration(
        './reexport/reexport.d.ts', 'Four', '/tmp/src/main.ts');
    expect(symbol.name).toEqual('Three');
    expect(symbol.filePath).toEqual('/tmp/src/reexport/src/origin1.d.ts');
  });

  it('should be able to trace an export * export', () => {
    const symbol = reflectorNestedGenDir.findDeclaration(
        './reexport/reexport.d.ts', 'Five', '/tmp/src/main.ts');
    expect(symbol.name).toEqual('Five');
    expect(symbol.filePath).toEqual('/tmp/src/reexport/src/origin5.d.ts');
  });

  it('should be able to trace a multi-level re-export', () => {
    const symbol = reflectorNestedGenDir.findDeclaration(
        './reexport/reexport.d.ts', 'Thirty', '/tmp/src/main.ts');
    expect(symbol.name).toEqual('Thirty');
    expect(symbol.filePath).toEqual('/tmp/src/reexport/src/origin30.d.ts');
  });
});

const dummyModule = 'export let foo: any[];';

const FILES: Entry = {
  'tmp': {
    'src': {
      'main.ts': `
        import * as c from '@angular/core';
        import * as r from '@angular/router';
        import * as u from './lib/utils';
        import * as cs from './lib/collections';
        import * as u2 from './lib2/utils2';
      `,
      'lib': {
        'utils.ts': dummyModule,
        'collections.ts': dummyModule,
      },
      'lib2': {'utils2.ts': dummyModule},
      'reexport': {
        'reexport.d.ts': `
          import * as c from '@angular/core';
        `,
        'reexport.metadata.json': JSON.stringify({
          __symbolic: 'module',
          version: 1,
          metadata: {},
          exports: [
            {from: './src/origin1', export: ['One', 'Two', {name: 'Three', as: 'Four'}]},
            {from: './src/origin5'}, {from: './src/reexport2'}
          ]
        }),
        'src': {
          'origin1.d.ts': `
            export class One {}
            export class Two {}
            export class Three {}
          `,
          'origin1.metadata.json': JSON.stringify({
            __symbolic: 'module',
            version: 1,
            metadata: {
              One: {__symbolic: 'class'},
              Two: {__symbolic: 'class'},
              Three: {__symbolic: 'class'},
            },
          }),
          'origin5.d.ts': `
            export class Five {}
          `,
          'origin5.metadata.json': JSON.stringify({
            __symbolic: 'module',
            version: 1,
            metadata: {
              Five: {__symbolic: 'class'},
            },
          }),
          'origin30.d.ts': `
            export class Thirty {}
          `,
          'origin30.metadata.json': JSON.stringify({
            __symbolic: 'module',
            version: 1,
            metadata: {
              Thirty: {__symbolic: 'class'},
            },
          }),
          'originNone.d.ts': dummyModule,
          'originNone.metadata.json': JSON.stringify({
            __symbolic: 'module',
            version: 1,
            metadata: {},
          }),
          'reexport2.d.ts': dummyModule,
          'reexport2.metadata.json': JSON.stringify({
            __symbolic: 'module',
            version: 1,
            metadata: {},
            exports: [{from: './originNone'}, {from: './origin30'}]
          })
        }
      },
      'node_modules': {
        '@angular': {
          'core.d.ts': dummyModule,
          'core.metadata.json':
              `{"__symbolic":"module", "version": 1, "metadata": {"foo": {"__symbolic": "class"}}}`,
          'router': {'index.d.ts': dummyModule, 'src': {'providers.d.ts': dummyModule}},
          'unused.d.ts': dummyModule,
          'empty.d.ts': 'export declare var a: string;',
          'empty.metadata.json': '[]',
        }
      }
    }
  }
};

function clone(entry: Entry): Entry {
  if (typeof entry === 'string') {
    return entry;
  } else {
    let result: Directory = {};
    for (let name in entry) {
      result[name] = clone(entry[name]);
    }
    return result;
  }
}
