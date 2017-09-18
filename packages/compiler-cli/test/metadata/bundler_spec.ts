/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

import {MetadataBundler, MetadataBundlerHost} from '../../src/metadata/bundler';
import {MetadataCollector} from '../../src/metadata/collector';
import {ClassMetadata, MetadataGlobalReferenceExpression, ModuleMetadata} from '../../src/metadata/schema';

import {Directory, open} from './typescript.mocks';

describe('metadata bundler', () => {

  it('should be able to bundle a simple library', () => {
    const host = new MockStringBundlerHost('/', SIMPLE_LIBRARY);
    const bundler = new MetadataBundler('/lib/index', undefined, host);
    const result = bundler.getMetadataBundle();
    expect(Object.keys(result.metadata.metadata).sort()).toEqual([
      'ONE_CLASSES', 'One', 'OneMore', 'TWO_CLASSES', 'Two', 'TwoMore', 'ɵa', 'ɵb'
    ]);

    const originalOne = './src/one';
    const originalTwo = './src/two/index';
    expect(Object.keys(result.metadata.origins)
               .sort()
               .map(name => ({name, value: result.metadata.origins ![name]})))
        .toEqual([
          {name: 'ONE_CLASSES', value: originalOne}, {name: 'One', value: originalOne},
          {name: 'OneMore', value: originalOne}, {name: 'TWO_CLASSES', value: originalTwo},
          {name: 'Two', value: originalTwo}, {name: 'TwoMore', value: originalTwo},
          {name: 'ɵa', value: originalOne}, {name: 'ɵb', value: originalTwo}
        ]);
    expect(result.privates).toEqual([
      {privateName: 'ɵa', name: 'PrivateOne', module: originalOne},
      {privateName: 'ɵb', name: 'PrivateTwo', module: originalTwo}
    ]);
  });

  it('should be able to bundle an oddly constructed library', () => {
    const host = new MockStringBundlerHost('/', {
      'lib': {
        'index.ts': `
          export * from './src/index';
        `,
        'src': {
          'index.ts': `
            export {One, OneMore, ONE_CLASSES} from './one';
            export {Two, TwoMore, TWO_CLASSES} from './two/index';
          `,
          'one.ts': `
            class One {}
            class OneMore extends One {}
            class PrivateOne {}
            const ONE_CLASSES = [One, OneMore, PrivateOne];
            export {One, OneMore, PrivateOne, ONE_CLASSES};
          `,
          'two': {
            'index.ts': `
              class Two {}
              class TwoMore extends Two {}
              class PrivateTwo {}
              const TWO_CLASSES = [Two, TwoMore, PrivateTwo];
              export {Two, TwoMore, PrivateTwo, TWO_CLASSES};
            `
          }
        }
      }
    });
    const bundler = new MetadataBundler('/lib/index', undefined, host);
    const result = bundler.getMetadataBundle();
    expect(Object.keys(result.metadata.metadata).sort()).toEqual([
      'ONE_CLASSES', 'One', 'OneMore', 'TWO_CLASSES', 'Two', 'TwoMore', 'ɵa', 'ɵb'
    ]);
    expect(result.privates).toEqual([
      {privateName: 'ɵa', name: 'PrivateOne', module: './src/one'},
      {privateName: 'ɵb', name: 'PrivateTwo', module: './src/two/index'}
    ]);
  });

  it('should not output windows paths in metadata', () => {
    const host = new MockStringBundlerHost('/', {
      'index.ts': `
        export * from './exports/test';
      `,
      'exports': {'test.ts': `export class TestExport {}`}
    });
    const bundler = new MetadataBundler('/index', undefined, host);
    const result = bundler.getMetadataBundle();

    expect(result.metadata.origins).toEqual({'TestExport': './exports/test'});
  });

  it('should convert re-exported to the export', () => {
    const host = new MockStringBundlerHost('/', {
      'index.ts': `
        export * from './bar';
        export * from './foo';
      `,
      'bar.ts': `
        import {Foo} from './foo';
        export class Bar extends Foo {

        }
      `,
      'foo.ts': `
        export {Foo} from 'foo';
      `
    });
    const bundler = new MetadataBundler('/index', undefined, host);
    const result = bundler.getMetadataBundle();
    // Expect the extends reference to refer to the imported module
    expect((result.metadata.metadata as any).Bar.extends.module).toEqual('foo');
    expect(result.privates).toEqual([]);
  });

  it('should treat import then export as a simple export', () => {
    const host = new MockStringBundlerHost('/', {
      'index.ts': `
        export * from './a';
        export * from './c';
      `,
      'a.ts': `
        import { B } from './b';
        export { B };
      `,
      'b.ts': `
        export class B { }
      `,
      'c.ts': `
        import { B } from './b';
        export class C extends B { }
      `
    });
    const bundler = new MetadataBundler('/index', undefined, host);
    const result = bundler.getMetadataBundle();
    expect(Object.keys(result.metadata.metadata).sort()).toEqual(['B', 'C']);
    expect(result.privates).toEqual([]);
  });

  it('should be able to bundle a private from a un-exported module', () => {
    const host = new MockStringBundlerHost('/', {
      'index.ts': `
        export * from './foo';
      `,
      'foo.ts': `
        import {Bar} from './bar';
        export class Foo extends Bar {

        }
      `,
      'bar.ts': `
        export class Bar {}
      `
    });
    const bundler = new MetadataBundler('/index', undefined, host);
    const result = bundler.getMetadataBundle();
    expect(Object.keys(result.metadata.metadata).sort()).toEqual(['Foo', 'ɵa']);
    expect(result.privates).toEqual([{privateName: 'ɵa', name: 'Bar', module: './bar'}]);
  });

  it('should be able to bundle a library with re-exported symbols', () => {
    const host = new MockStringBundlerHost('/', {
      'public-api.ts': `
        export * from './src/core';
        export * from './src/externals';
      `,
      'src': {
        'core.ts': `
          export class A {}
          export class B extends A {}
        `,
        'externals.ts': `
          export {E, F, G} from 'external_one';
          export * from 'external_two';
        `
      }
    });

    const bundler = new MetadataBundler('/public-api', undefined, host);
    const result = bundler.getMetadataBundle();
    expect(result.metadata.exports).toEqual([
      {from: 'external_two'}, {
        export: [{name: 'E', as: 'E'}, {name: 'F', as: 'F'}, {name: 'G', as: 'G'}],
        from: 'external_one'
      }
    ]);
    expect(result.metadata.origins !['E']).toBeUndefined();
  });

  it('should be able to de-duplicate symbols of re-exported modules', () => {
    const host = new MockStringBundlerHost('/', {
      'public-api.ts': `
        export {A as A2, A, B as B1, B as B2} from './src/core';
        export {A as A3} from './src/alternate';
      `,
      'src': {
        'core.ts': `
          export class A {}
          export class B {}
        `,
        'alternate.ts': `
          export class A {}
        `,
      }
    });

    const bundler = new MetadataBundler('/public-api', undefined, host);
    const result = bundler.getMetadataBundle();
    const {A, A2, A3, B1, B2} = result.metadata.metadata as{
      A: ClassMetadata,
      A2: MetadataGlobalReferenceExpression,
      A3: ClassMetadata,
      B1: ClassMetadata,
      B2: MetadataGlobalReferenceExpression
    };
    expect(A.__symbolic).toEqual('class');
    expect(A2.__symbolic).toEqual('reference');
    expect(A2.name).toEqual('A');
    expect(A3.__symbolic).toEqual('class');
    expect(B1.__symbolic).toEqual('class');
    expect(B2.__symbolic).toEqual('reference');
    expect(B2.name).toEqual('B1');
  });
});

export class MockStringBundlerHost implements MetadataBundlerHost {
  collector = new MetadataCollector();

  constructor(private dirName: string, private directory: Directory) {}

  getMetadataFor(moduleName: string): ModuleMetadata|undefined {
    const fileName = path.join(this.dirName, moduleName) + '.ts';
    const text = open(this.directory, fileName);
    if (typeof text == 'string') {
      const sourceFile = ts.createSourceFile(
          fileName, text, ts.ScriptTarget.Latest, /* setParent */ true, ts.ScriptKind.TS);
      const diagnostics: ts.Diagnostic[] = (sourceFile as any).parseDiagnostics;
      if (diagnostics && diagnostics.length) {
        throw Error('Unexpected syntax error in test');
      }
      const result = this.collector.getMetadata(sourceFile);
      return result;
    }
  }
}


export const SIMPLE_LIBRARY = {
  'lib': {
    'index.ts': `
      export * from './src/index';
    `,
    'src': {
      'index.ts': `
        export {One, OneMore, ONE_CLASSES} from './one';
        export {Two, TwoMore, TWO_CLASSES} from './two/index';
      `,
      'one.ts': `
        export class One {}
        export class OneMore extends One {}
        export class PrivateOne {}
        export const ONE_CLASSES = [One, OneMore, PrivateOne];
      `,
      'two': {
        'index.ts': `
          export class Two {}
          export class TwoMore extends Two {}
          export class PrivateTwo {}
          export const TWO_CLASSES = [Two, TwoMore, PrivateTwo];
        `
      }
    }
  }
};
