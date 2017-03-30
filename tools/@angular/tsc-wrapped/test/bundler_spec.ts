/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

import {MetadataBundler, MetadataBundlerHost} from '../src/bundler';
import {MetadataCollector} from '../src/collector';
import {ModuleMetadata} from '../src/schema';

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
               .map(name => ({name, value: result.metadata.origins[name]})))
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
});

export class MockStringBundlerHost implements MetadataBundlerHost {
  collector = new MetadataCollector();

  constructor(private dirName: string, private directory: Directory) {}

  getMetadataFor(moduleName: string): ModuleMetadata {
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