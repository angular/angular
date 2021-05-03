/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {METADATA_VERSION, MetadataCollector, ModuleMetadata} from '../../src/metadata';
import {MetadataReaderHost, readMetadata} from '../../src/transformers/metadata_reader';
import {Directory, Entry, MockAotContext} from '../mocks';

describe('metadata reader', () => {
  let host: MetadataReaderHost;

  beforeEach(() => {
    const context = new MockAotContext('/tmp/src', clone(FILES));
    const metadataCollector = new MetadataCollector();
    host = {
      fileExists: (fileName) => context.fileExists(fileName),
      readFile: (fileName) => context.readFile(fileName),
      getSourceFileMetadata: (fileName) => {
        const sourceText = context.readFile(fileName);
        return sourceText != null ? metadataCollector.getMetadata(ts.createSourceFile(
                                        fileName, sourceText, ts.ScriptTarget.Latest)) :
                                    undefined;
      },
    };
  });


  it('should be able to read a metadata file', () => {
    expect(readMetadata('node_modules/@angular/core.d.ts', host)).toEqual([
      {__symbolic: 'module', version: METADATA_VERSION, metadata: {foo: {__symbolic: 'class'}}}
    ]);
  });

  it('should be able to read metadata from an otherwise unused .d.ts file ', () => {
    expect(readMetadata('node_modules/@angular/unused.d.ts', host)).toEqual([dummyMetadata]);
  });

  it('should be able to read empty metadata ', () => {
    expect(readMetadata('node_modules/@angular/empty.d.ts', host)).toEqual([]);
  });

  it('should return undefined for missing modules', () => {
    expect(readMetadata('node_modules/@angular/missing.d.ts', host)).toBeUndefined();
  });

  it(`should add missing v${METADATA_VERSION} metadata from v1 metadata and .d.ts files`, () => {
    expect(readMetadata('metadata_versions/v1.d.ts', host)).toEqual([
      {__symbolic: 'module', version: 1, metadata: {foo: {__symbolic: 'class'}}}, {
        __symbolic: 'module',
        version: METADATA_VERSION,
        metadata: {
          foo: {__symbolic: 'class'},
          aType: {__symbolic: 'interface'},
          Bar: {__symbolic: 'class', members: {ngOnInit: [{__symbolic: 'method'}]}},
          BarChild: {__symbolic: 'class', extends: {__symbolic: 'reference', name: 'Bar'}},
          ReExport: {__symbolic: 'reference', module: './lib/utils2', name: 'ReExport'},
        },
        exports: [{from: './lib/utils2', export: ['Export']}],
      }
    ]);
  });

  it(`should upgrade a missing metadata file into v${METADATA_VERSION}`, () => {
    expect(readMetadata('metadata_versions/v1_empty.d.ts', host)).toEqual([{
      __symbolic: 'module',
      version: METADATA_VERSION,
      metadata: {},
      exports: [{from: './lib/utils'}]
    }]);
  });

  it(`should upgrade v3 metadata into v${METADATA_VERSION}`, () => {
    expect(readMetadata('metadata_versions/v3.d.ts', host)).toEqual([
      {__symbolic: 'module', version: 3, metadata: {foo: {__symbolic: 'class'}}}, {
        __symbolic: 'module',
        version: METADATA_VERSION,
        metadata: {
          foo: {__symbolic: 'class'},
          aType: {__symbolic: 'interface'},
          Bar: {__symbolic: 'class', members: {ngOnInit: [{__symbolic: 'method'}]}},
          BarChild: {__symbolic: 'class', extends: {__symbolic: 'reference', name: 'Bar'}},
          ReExport: {__symbolic: 'reference', module: './lib/utils2', name: 'ReExport'},
        }
        // Note: exports is missing because it was elided in the original.
      }
    ]);
  });
});

const dummyModule = 'export let foo: any[];';
const dummyMetadata: ModuleMetadata = {
  __symbolic: 'module',
  version: METADATA_VERSION,
  metadata:
      {foo: {__symbolic: 'error', message: 'Variable not initialized', line: 0, character: 11}}
};
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
          'core.metadata.json': `{"__symbolic":"module", "version": ${
              METADATA_VERSION}, "metadata": {"foo": {"__symbolic": "class"}}}`,
          'router': {'index.d.ts': dummyModule, 'src': {'providers.d.ts': dummyModule}},
          'unused.d.ts': dummyModule,
          'empty.d.ts': 'export declare var a: string;',
          'empty.metadata.json': '[]',
        }
      },
      'metadata_versions': {
        'v1.d.ts': `
          import {ReExport} from './lib/utils2';
          export {ReExport};

          export {Export} from './lib/utils2';

          export type aType = number;

          export declare class Bar {
            ngOnInit() {}
          }
          export declare class BarChild extends Bar {}
        `,
        'v1.metadata.json':
            `{"__symbolic":"module", "version": 1, "metadata": {"foo": {"__symbolic": "class"}}}`,
        'v1_empty.d.ts': `
          export * from './lib/utils';
        `,
        'v3.d.ts': `
          import {ReExport} from './lib/utils2';
          export {ReExport};

          export {Export} from './lib/utils2';

          export type aType = number;

          export declare class Bar {
            ngOnInit() {}
          }
          export declare class BarChild extends Bar {}
        `,
        'v3.metadata.json':
            `{"__symbolic":"module", "version": 3, "metadata": {"foo": {"__symbolic": "class"}}}`,
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
