/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';
import * as ts from 'typescript';

import {NgHost} from '../src/ng_host';

import {Directory, Entry, MockCompilerHost, MockContext} from './mocks';

describe('NgHost', () => {
  let context: MockContext;
  let host: ts.CompilerHost;
  let program: ts.Program;
  let hostNestedGenDir: NgHost;
  let hostSiblingGenDir: NgHost;

  beforeEach(() => {
    context = new MockContext('/tmp/src', clone(FILES));
    host = new MockCompilerHost(context);
    program = ts.createProgram(
        ['main.ts'], {
          module: ts.ModuleKind.CommonJS,
        },
        host);
    // Force a typecheck
    const errors = program.getSemanticDiagnostics();
    if (errors && errors.length) {
      throw new Error('Expected no errors');
    }
    hostNestedGenDir = new NgHost(
        program, host, {
          genDir: '/tmp/project/src/gen/',
          basePath: '/tmp/project/src',
          skipMetadataEmit: false,
          strictMetadataEmit: false,
          skipTemplateCodegen: false,
          trace: false
        },
        context);
    hostSiblingGenDir = new NgHost(
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
      expect(hostNestedGenDir.getImportPath(
                 '/tmp/project/src/gen/my.ngfactory.ts',
                 '/tmp/project/node_modules/@angular/core.d.ts'))
          .toEqual('@angular/core');
    });

    it('should import factory from factory', () => {
      expect(hostNestedGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/my.other.ngfactory.ts'))
          .toEqual('./my.other.ngfactory');
      expect(hostNestedGenDir.getImportPath(
                 '/tmp/project/src/a/my.ngfactory.ts', '/tmp/project/src/my.other.css.ts'))
          .toEqual('../my.other.css');
      expect(hostNestedGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/a/my.other.css.shim.ts'))
          .toEqual('./a/my.other.css.shim');
    });

    it('should import application from factory', () => {
      expect(hostNestedGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/my.other.ts'))
          .toEqual('../my.other');
      expect(hostNestedGenDir.getImportPath(
                 '/tmp/project/src/a/my.ngfactory.ts', '/tmp/project/src/my.other.ts'))
          .toEqual('../../my.other');
      expect(hostNestedGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/a/my.other.ts'))
          .toEqual('../a/my.other');
    });
  });

  describe('nestedGenDir', () => {
    it('should import node_module from factory', () => {
      expect(hostSiblingGenDir.getImportPath(
                 '/tmp/project/src/gen/my.ngfactory.ts',
                 '/tmp/project/node_modules/@angular/core.d.ts'))
          .toEqual('@angular/core');
    });

    it('should import factory from factory', () => {
      expect(hostSiblingGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/my.other.ngfactory.ts'))
          .toEqual('./my.other.ngfactory');
      expect(hostSiblingGenDir.getImportPath(
                 '/tmp/project/src/a/my.ngfactory.ts', '/tmp/project/src/my.other.css.ts'))
          .toEqual('../my.other.css');
      expect(hostSiblingGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/a/my.other.css.shim.ts'))
          .toEqual('./a/my.other.css.shim');
    });

    it('should import application from factory', () => {
      expect(hostSiblingGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/my.other.ts'))
          .toEqual('./my.other');
      expect(hostSiblingGenDir.getImportPath(
                 '/tmp/project/src/a/my.ngfactory.ts', '/tmp/project/src/my.other.ts'))
          .toEqual('../my.other');
      expect(hostSiblingGenDir.getImportPath(
                 '/tmp/project/src/my.ngfactory.ts', '/tmp/project/src/a/my.other.ts'))
          .toEqual('./a/my.other');
    });
  });

  it('should be able to produce an import from main @angular/core', () => {
    expect(hostNestedGenDir.getImportPath(
               '/tmp/project/src/main.ts', '/tmp/project/node_modules/@angular/core.d.ts'))
        .toEqual('@angular/core');
  });

  it('should be able to produce an import from main to a sub-directory', () => {
    expect(hostNestedGenDir.getImportPath('main.ts', 'lib/utils.ts')).toEqual('./lib/utils');
  });

  it('should be able to produce an import from to a peer file', () => {
    expect(hostNestedGenDir.getImportPath('lib/utils.ts', 'lib/collections.ts'))
        .toEqual('./collections');
  });

  it('should be able to produce an import from to a sibling directory', () => {
    expect(hostNestedGenDir.getImportPath('lib2/utils2.ts', 'lib/utils.ts'))
        .toEqual('../lib/utils');
  });

  it('should be able to read a metadata file', () => {
    expect(hostNestedGenDir.getMetadataFor('node_modules/@angular/core.d.ts'))
        .toEqual({__symbolic: 'module', version: 1, metadata: {foo: {__symbolic: 'class'}}});
  });

  it('should be able to read metadata from an otherwise unused .d.ts file ', () => {
    expect(hostNestedGenDir.getMetadataFor('node_modules/@angular/unused.d.ts')).toBeUndefined();
  });

  it('should be able to read empty metadata ', () => {
    expect(hostNestedGenDir.getMetadataFor('node_modules/@angular/empty.d.ts')).toBeUndefined();
  });

  it('should return undefined for missing modules', () => {
    expect(hostNestedGenDir.getMetadataFor('node_modules/@angular/missing.d.ts')).toBeUndefined();
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
    const result: Directory = {};
    for (const name in entry) {
      result[name] = clone(entry[name]);
    }
    return result;
  }
}
