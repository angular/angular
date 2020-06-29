/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol, StaticSymbolCache, StaticSymbolResolver, StaticSymbolResolverHost, Summary, SummaryResolver} from '@angular/compiler';
import {CollectorOptions, METADATA_VERSION} from '@angular/compiler-cli';
import {MetadataCollector} from '@angular/compiler-cli/src/metadata/collector';
import * as ts from 'typescript';

// This matches .ts files but not .d.ts files.
const TS_EXT = /(^.|(?!\.d)..)\.ts$/;

describe('StaticSymbolResolver', () => {
  let host: StaticSymbolResolverHost;
  let symbolResolver: StaticSymbolResolver;
  let symbolCache: StaticSymbolCache;

  beforeEach(() => {
    symbolCache = new StaticSymbolCache();
  });

  function init(
      testData: {[key: string]: any} = DEFAULT_TEST_DATA, summaries: Summary<StaticSymbol>[] = [],
      summaryImportAs: {symbol: StaticSymbol, importAs: StaticSymbol}[] = []) {
    host = new MockStaticSymbolResolverHost(testData);
    symbolResolver = new StaticSymbolResolver(
        host, symbolCache, new MockSummaryResolver(summaries, summaryImportAs));
  }

  beforeEach(() => init());

  it('should throw an exception for unsupported metadata versions', () => {
    expect(
        () => symbolResolver.resolveSymbol(
            symbolResolver.getSymbolByModule('src/version-error', 'e')))
        .toThrow(new Error(
            `Metadata version mismatch for module /tmp/src/version-error.d.ts, found version 100, expected ${
                METADATA_VERSION}`));
  });

  it('should throw an exception for version 2 metadata', () => {
    expect(
        () => symbolResolver.resolveSymbol(
            symbolResolver.getSymbolByModule('src/version-2-error', 'e')))
        .toThrowError(
            'Unsupported metadata version 2 for module /tmp/src/version-2-error.d.ts. This module should be compiled with a newer version of ngc');
  });

  it('should be produce the same symbol if asked twice', () => {
    const foo1 = symbolResolver.getStaticSymbol('main.ts', 'foo');
    const foo2 = symbolResolver.getStaticSymbol('main.ts', 'foo');
    expect(foo1).toBe(foo2);
  });

  it('should be able to produce a symbol for a module with no file', () => {
    expect(symbolResolver.getStaticSymbol('angularjs', 'SomeAngularSymbol')).toBeDefined();
  });

  it('should be able to split the metadata per symbol', () => {
    init({
      '/tmp/src/test.ts': `
        export var a = 1;
        export var b = 2;
      `
    });
    expect(symbolResolver.resolveSymbol(symbolResolver.getStaticSymbol('/tmp/src/test.ts', 'a'))
               .metadata)
        .toBe(1);
    expect(symbolResolver.resolveSymbol(symbolResolver.getStaticSymbol('/tmp/src/test.ts', 'b'))
               .metadata)
        .toBe(2);
  });

  it('should be able to resolve static symbols with members', () => {
    init({
      '/tmp/src/test.ts': `
        export {exportedObj} from './export';

        export var obj = {a: 1};
        export class SomeClass {
          static someField = 2;
        }
      `,
      '/tmp/src/export.ts': `
        export var exportedObj = {};
      `,
    });
    expect(symbolResolver
               .resolveSymbol(symbolResolver.getStaticSymbol('/tmp/src/test.ts', 'obj', ['a']))
               .metadata)
        .toBe(1);
    expect(symbolResolver
               .resolveSymbol(
                   symbolResolver.getStaticSymbol('/tmp/src/test.ts', 'SomeClass', ['someField']))
               .metadata)
        .toBe(2);
    expect(symbolResolver
               .resolveSymbol(symbolResolver.getStaticSymbol(
                   '/tmp/src/test.ts', 'exportedObj', ['someMember']))
               .metadata)
        .toBe(symbolResolver.getStaticSymbol('/tmp/src/export.ts', 'exportedObj', ['someMember']));
  });

  it('should not explore re-exports of the same module', () => {
    init({
      '/tmp/src/test.ts': `
        export * from './test';

        export const testValue = 10;
      `,
    });

    const symbols = symbolResolver.getSymbolsOf('/tmp/src/test.ts');
    expect(symbols).toEqual([symbolResolver.getStaticSymbol('/tmp/src/test.ts', 'testValue')]);
  });

  it('should use summaries in resolveSymbol and prefer them over regular metadata', () => {
    const symbolA = symbolCache.get('/test.ts', 'a');
    const symbolB = symbolCache.get('/test.ts', 'b');
    const symbolC = symbolCache.get('/test.ts', 'c');
    init({'/test.ts': 'export var a = 2; export var b = 2; export var c = 2;'}, [
      {symbol: symbolA, metadata: 1},
      {symbol: symbolB, metadata: 1},
    ]);
    // reading the metadata of a symbol without a summary first,
    // to test whether summaries are still preferred after this.
    expect(symbolResolver.resolveSymbol(symbolC).metadata).toBe(2);
    expect(symbolResolver.resolveSymbol(symbolA).metadata).toBe(1);
    expect(symbolResolver.resolveSymbol(symbolB).metadata).toBe(1);
  });

  it('should be able to get all exported symbols of a file', () => {
    expect(symbolResolver.getSymbolsOf('/tmp/src/reexport/src/origin1.d.ts')).toEqual([
      symbolResolver.getStaticSymbol('/tmp/src/reexport/src/origin1.d.ts', 'One'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/src/origin1.d.ts', 'Two'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/src/origin1.d.ts', 'Three'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/src/origin1.d.ts', 'Six'),
    ]);
  });

  it('should be able to get all reexported symbols of a file', () => {
    expect(symbolResolver.getSymbolsOf('/tmp/src/reexport/reexport.d.ts')).toEqual([
      symbolResolver.getStaticSymbol('/tmp/src/reexport/reexport.d.ts', 'One'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/reexport.d.ts', 'Two'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/reexport.d.ts', 'Four'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/reexport.d.ts', 'Six'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/reexport.d.ts', 'Five'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/reexport.d.ts', 'Thirty'),
    ]);
  });

  it('should read the exported symbols of a file from the summary and ignore exports in the source',
     () => {
       init(
           {'/test.ts': 'export var b = 2'},
           [{symbol: symbolCache.get('/test.ts', 'a'), metadata: 1}]);
       expect(symbolResolver.getSymbolsOf('/test.ts')).toEqual([symbolCache.get('/test.ts', 'a')]);
     });

  describe('importAs', () => {
    it('should calculate importAs relationship for non source files without summaries', () => {
      init(
          {
            '/test.d.ts': [{
              '__symbolic': 'module',
              'version': METADATA_VERSION,
              'metadata': {
                'a': {'__symbolic': 'reference', 'name': 'b', 'module': './test2'},
              }
            }],
            '/test2.d.ts': [{
              '__symbolic': 'module',
              'version': METADATA_VERSION,
              'metadata': {
                'b': {'__symbolic': 'reference', 'name': 'c', 'module': './test3'},
              }
            }]
          },
          []);
      symbolResolver.getSymbolsOf('/test.d.ts');
      symbolResolver.getSymbolsOf('/test2.d.ts');

      expect(symbolResolver.getImportAs(symbolCache.get('/test2.d.ts', 'b')))
          .toBe(symbolCache.get('/test.d.ts', 'a'));
      expect(symbolResolver.getImportAs(symbolCache.get('/test3.d.ts', 'c')))
          .toBe(symbolCache.get('/test.d.ts', 'a'));
    });

    it('should calculate importAs relationship for non source files with summaries', () => {
      init(
          {
            '/test.ts': `
          export {a} from './test2';
        `
          },
          [], [{
            symbol: symbolCache.get('/test2.d.ts', 'a'),
            importAs: symbolCache.get('/test3.d.ts', 'b')
          }]);
      symbolResolver.getSymbolsOf('/test.ts');

      expect(symbolResolver.getImportAs(symbolCache.get('/test2.d.ts', 'a')))
          .toBe(symbolCache.get('/test3.d.ts', 'b'));
    });

    it('should ignore summaries for inputAs if requested', () => {
      init(
          {
            '/test.ts': `
        export {a} from './test2';
      `
          },
          [], [{
            symbol: symbolCache.get('/test2.d.ts', 'a'),
            importAs: symbolCache.get('/test3.d.ts', 'b')
          }]);

      symbolResolver.getSymbolsOf('/test.ts');

      expect(
          symbolResolver.getImportAs(symbolCache.get('/test2.d.ts', 'a'), /* useSummaries */ false))
          .toBeUndefined();
    });

    it('should calculate importAs for symbols with members based on importAs for symbols without',
       () => {
         init(
             {
               '/test.ts': `
          export {a} from './test2';
        `
             },
             [], [{
               symbol: symbolCache.get('/test2.d.ts', 'a'),
               importAs: symbolCache.get('/test3.d.ts', 'b')
             }]);
         symbolResolver.getSymbolsOf('/test.ts');

         expect(symbolResolver.getImportAs(symbolCache.get('/test2.d.ts', 'a', ['someMember'])))
             .toBe(symbolCache.get('/test3.d.ts', 'b', ['someMember']));
       });
  });

  it('should replace references by StaticSymbols', () => {
    init({
      '/test.ts': `
        import {b, y} from './test2';
        export var a = b;
        export var x = [y];

        export function simpleFn(fnArg) {
          return [a, y, fnArg];
        }
      `,
      '/test2.ts': `
        export var b;
        export var y;
      `
    });
    expect(symbolResolver.resolveSymbol(symbolCache.get('/test.ts', 'a')).metadata)
        .toEqual(symbolCache.get('/test2.ts', 'b'));
    expect(symbolResolver.resolveSymbol(symbolCache.get('/test.ts', 'x')).metadata).toEqual([{
      __symbolic: 'resolved',
      symbol: symbolCache.get('/test2.ts', 'y'),
      line: 3,
      character: 24,
      fileName: '/test.ts'
    }]);
    expect(symbolResolver.resolveSymbol(symbolCache.get('/test.ts', 'simpleFn')).metadata).toEqual({
      __symbolic: 'function',
      parameters: ['fnArg'],
      value: [
        symbolCache.get('/test.ts', 'a'), {
          __symbolic: 'resolved',
          symbol: symbolCache.get('/test2.ts', 'y'),
          line: 6,
          character: 21,
          fileName: '/test.ts'
        },
        {__symbolic: 'reference', name: 'fnArg'}
      ]
    });
  });

  it('should ignore module references without a name', () => {
    init({
      '/test.ts': `
        import Default from './test2';
        export {Default};
      `
    });

    expect(symbolResolver.resolveSymbol(symbolCache.get('/test.ts', 'Default')).metadata)
        .toBeFalsy();
  });

  it('should fill references to ambient symbols with undefined', () => {
    init({
      '/test.ts': `
        export var y = 1;
        export var z = [window, z];
      `
    });

    expect(symbolResolver.resolveSymbol(symbolCache.get('/test.ts', 'z')).metadata).toEqual([
      undefined, symbolCache.get('/test.ts', 'z')
    ]);
  });

  it('should allow to use symbols with __', () => {
    init({
      '/test.ts': `
        export {__a__ as __b__} from './test2';
        import {__c__} from './test2';

        export var __x__ = 1;
        export var __y__ = __c__;
      `
    });

    expect(symbolResolver.resolveSymbol(symbolCache.get('/test.ts', '__x__')).metadata).toBe(1);
    expect(symbolResolver.resolveSymbol(symbolCache.get('/test.ts', '__y__')).metadata)
        .toBe(symbolCache.get('/test2.d.ts', '__c__'));
    expect(symbolResolver.resolveSymbol(symbolCache.get('/test.ts', '__b__')).metadata)
        .toBe(symbolCache.get('/test2.d.ts', '__a__'));

    expect(symbolResolver.getSymbolsOf('/test.ts')).toEqual([
      symbolCache.get('/test.ts', '__b__'),
      symbolCache.get('/test.ts', '__x__'),
      symbolCache.get('/test.ts', '__y__'),
    ]);
  });

  it('should only use the arity for classes from libraries without summaries', () => {
    init({
      '/test.d.ts': [{
        '__symbolic': 'module',
        'version': METADATA_VERSION,
        'metadata': {
          'AParam': {__symbolic: 'class'},
          'AClass': {
            __symbolic: 'class',
            arity: 1,
            members: {
              __ctor__: [
                {__symbolic: 'constructor', parameters: [symbolCache.get('/test.d.ts', 'AParam')]}
              ]
            }
          }
        }
      }]
    });

    expect(symbolResolver.resolveSymbol(symbolCache.get('/test.d.ts', 'AClass')).metadata)
        .toEqual({__symbolic: 'class', arity: 1});
  });

  it('should be able to trace a named export', () => {
    const symbol = symbolResolver
                       .resolveSymbol(symbolResolver.getSymbolByModule(
                           './reexport/reexport', 'One', '/tmp/src/main.ts'))
                       .metadata;
    expect(symbol.name).toEqual('One');
    expect(symbol.filePath).toEqual('/tmp/src/reexport/src/origin1.d.ts');
  });

  it('should be able to trace a renamed export', () => {
    const symbol = symbolResolver
                       .resolveSymbol(symbolResolver.getSymbolByModule(
                           './reexport/reexport', 'Four', '/tmp/src/main.ts'))
                       .metadata;
    expect(symbol.name).toEqual('Three');
    expect(symbol.filePath).toEqual('/tmp/src/reexport/src/origin1.d.ts');
  });

  it('should be able to trace an export * export', () => {
    const symbol = symbolResolver
                       .resolveSymbol(symbolResolver.getSymbolByModule(
                           './reexport/reexport', 'Five', '/tmp/src/main.ts'))
                       .metadata;
    expect(symbol.name).toEqual('Five');
    expect(symbol.filePath).toEqual('/tmp/src/reexport/src/origin5.d.ts');
  });

  it('should be able to trace a multi-level re-export', () => {
    const symbol1 = symbolResolver
                        .resolveSymbol(symbolResolver.getSymbolByModule(
                            './reexport/reexport', 'Thirty', '/tmp/src/main.ts'))
                        .metadata;
    expect(symbol1.name).toEqual('Thirty');
    expect(symbol1.filePath).toEqual('/tmp/src/reexport/src/reexport2.d.ts');
    const symbol2 = symbolResolver.resolveSymbol(symbol1).metadata;
    expect(symbol2.name).toEqual('Thirty');
    expect(symbol2.filePath).toEqual('/tmp/src/reexport/src/origin30.d.ts');
  });

  it('should prefer names in the file over reexports', () => {
    const metadata = symbolResolver
                         .resolveSymbol(symbolResolver.getSymbolByModule(
                             './reexport/reexport', 'Six', '/tmp/src/main.ts'))
                         .metadata;
    expect(metadata.__symbolic).toBe('class');
  });

  it('should cache tracing a named export', () => {
    const moduleNameToFileNameSpy = spyOn(host, 'moduleNameToFileName').and.callThrough();
    const getMetadataForSpy = spyOn(host, 'getMetadataFor').and.callThrough();
    symbolResolver.resolveSymbol(
        symbolResolver.getSymbolByModule('./reexport/reexport', 'One', '/tmp/src/main.ts'));
    moduleNameToFileNameSpy.calls.reset();
    getMetadataForSpy.calls.reset();

    const symbol = symbolResolver
                       .resolveSymbol(symbolResolver.getSymbolByModule(
                           './reexport/reexport', 'One', '/tmp/src/main.ts'))
                       .metadata;
    expect(moduleNameToFileNameSpy.calls.count()).toBe(1);
    expect(getMetadataForSpy.calls.count()).toBe(0);
    expect(symbol.name).toEqual('One');
    expect(symbol.filePath).toEqual('/tmp/src/reexport/src/origin1.d.ts');
  });
});

export class MockSummaryResolver implements SummaryResolver<StaticSymbol> {
  constructor(private summaries: Summary<StaticSymbol>[] = [], private importAs: {
    symbol: StaticSymbol,
    importAs: StaticSymbol
  }[] = []) {}
  addSummary(summary: Summary<StaticSymbol>) {
    this.summaries.push(summary);
  }
  resolveSummary(reference: StaticSymbol): Summary<StaticSymbol> {
    return this.summaries.find(summary => summary.symbol === reference)!;
  }
  getSymbolsOf(filePath: string): StaticSymbol[]|null {
    const symbols = this.summaries.filter(summary => summary.symbol.filePath === filePath)
                        .map(summary => summary.symbol);
    return symbols.length ? symbols : null;
  }
  getImportAs(symbol: StaticSymbol): StaticSymbol {
    const entry = this.importAs.find(entry => entry.symbol === symbol);
    return entry ? entry.importAs : undefined!;
  }
  getKnownModuleName(fileName: string): string|null {
    return null;
  }
  isLibraryFile(filePath: string): boolean {
    return filePath.endsWith('.d.ts');
  }
  toSummaryFileName(filePath: string): string {
    return filePath.replace(/(\.d)?\.ts$/, '.d.ts');
  }
  fromSummaryFileName(filePath: string): string {
    return filePath;
  }
}

export class MockStaticSymbolResolverHost implements StaticSymbolResolverHost {
  private collector: MetadataCollector;

  constructor(private data: {[key: string]: any}, collectorOptions?: CollectorOptions) {
    this.collector = new MetadataCollector(collectorOptions);
  }

  // In tests, assume that symbols are not re-exported
  moduleNameToFileName(modulePath: string, containingFile?: string): string {
    function splitPath(path: string): string[] {
      return path.split(/\/|\\/g);
    }

    function resolvePath(pathParts: string[]): string {
      const result: string[] = [];
      pathParts.forEach((part, index) => {
        switch (part) {
          case '':
          case '.':
            if (index > 0) return;
            break;
          case '..':
            if (index > 0 && result.length != 0) result.pop();
            return;
        }
        result.push(part);
      });
      return result.join('/');
    }

    function pathTo(from: string, to: string): string {
      let result = to;
      if (to.startsWith('.')) {
        const fromParts = splitPath(from);
        fromParts.pop();  // remove the file name.
        const toParts = splitPath(to);
        result = resolvePath(fromParts.concat(toParts));
      }
      return result;
    }

    if (modulePath.indexOf('.') === 0) {
      const baseName = pathTo(containingFile!, modulePath);
      const tsName = baseName + '.ts';
      if (this._getMetadataFor(tsName)) {
        return tsName;
      }
      return baseName + '.d.ts';
    }
    if (modulePath == 'unresolved') {
      return undefined!;
    }
    return '/tmp/' + modulePath + '.d.ts';
  }

  getMetadataFor(moduleId: string): any {
    return this._getMetadataFor(moduleId);
  }

  getOutputName(filePath: string): string {
    return filePath;
  }

  private _getMetadataFor(filePath: string): any {
    if (this.data[filePath] && filePath.match(TS_EXT)) {
      const text = this.data[filePath];
      if (typeof text === 'string') {
        const sf = ts.createSourceFile(
            filePath, this.data[filePath], ts.ScriptTarget.ES5, /* setParentNodes */ true);
        const diagnostics: ts.Diagnostic[] = (<any>sf).parseDiagnostics;
        if (diagnostics && diagnostics.length) {
          const errors = diagnostics
                             .map(d => {
                               const {line, character} =
                                   ts.getLineAndCharacterOfPosition(d.file!, d.start!);
                               return `(${line}:${character}): ${d.messageText}`;
                             })
                             .join('\n');
          throw Error(`Error encountered during parse of file ${filePath}\n${errors}`);
        }
        return [this.collector.getMetadata(sf)];
      }
    }
    const result = this.data[filePath];
    if (result) {
      return Array.isArray(result) ? result : [result];
    } else {
      return null;
    }
  }
}

const DEFAULT_TEST_DATA: {[key: string]: any} = {
  '/tmp/src/version-error.d.ts': {'__symbolic': 'module', 'version': 100, metadata: {e: 's'}},
  '/tmp/src/version-2-error.d.ts': {'__symbolic': 'module', 'version': 2, metadata: {e: 's'}},
  '/tmp/src/reexport/reexport.d.ts': {
    __symbolic: 'module',
    version: METADATA_VERSION,
    metadata: {
      Six: {__symbolic: 'class'},
    },
    exports: [
      {from: './src/origin1', export: ['One', 'Two', {name: 'Three', as: 'Four'}, 'Six']},
      {from: './src/origin5'}, {from: './src/reexport2'}
    ]
  },
  '/tmp/src/reexport/src/origin1.d.ts': {
    __symbolic: 'module',
    version: METADATA_VERSION,
    metadata: {
      One: {__symbolic: 'class'},
      Two: {__symbolic: 'class'},
      Three: {__symbolic: 'class'},
      Six: {__symbolic: 'class'},
    },
  },
  '/tmp/src/reexport/src/origin5.d.ts': {
    __symbolic: 'module',
    version: METADATA_VERSION,
    metadata: {
      Five: {__symbolic: 'class'},
    },
  },
  '/tmp/src/reexport/src/origin30.d.ts': {
    __symbolic: 'module',
    version: METADATA_VERSION,
    metadata: {
      Thirty: {__symbolic: 'class'},
    },
  },
  '/tmp/src/reexport/src/originNone.d.ts': {
    __symbolic: 'module',
    version: METADATA_VERSION,
    metadata: {},
  },
  '/tmp/src/reexport/src/reexport2.d.ts': {
    __symbolic: 'module',
    version: METADATA_VERSION,
    metadata: {},
    exports: [{from: './originNone'}, {from: './origin30'}]
  }
};
