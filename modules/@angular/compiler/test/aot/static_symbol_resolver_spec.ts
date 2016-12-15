/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol, StaticSymbolCache, StaticSymbolResolver, StaticSymbolResolverHost, Summary, SummaryResolver} from '@angular/compiler';
import {MetadataCollector} from '@angular/tsc-wrapped';
import * as ts from 'typescript';



// This matches .ts files but not .d.ts files.
const TS_EXT = /(^.|(?!\.d)..)\.ts$/;

describe('StaticSymbolResolver', () => {
  const noContext = new StaticSymbol('', '');
  let host: StaticSymbolResolverHost;
  let symbolResolver: StaticSymbolResolver;
  let symbolCache: StaticSymbolCache;

  beforeEach(() => { symbolCache = new StaticSymbolCache(); });

  function init(
      testData: {[key: string]: any} = DEFAULT_TEST_DATA, summaries: Summary<StaticSymbol>[] = []) {
    host = new MockStaticSymbolResolverHost(testData);
    symbolResolver =
        new StaticSymbolResolver(host, symbolCache, new MockSummaryResolver(summaries));
  }

  beforeEach(() => init());

  it('should throw an exception for unsupported metadata versions', () => {
    expect(
        () => symbolResolver.resolveSymbol(
            symbolResolver.getSymbolByModule('src/version-error', 'e')))
        .toThrow(new Error(
            'Metadata version mismatch for module /tmp/src/version-error.d.ts, found version 100, expected 3'));
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

  it('should use summaries in resolveSymbol and prefer them over regular metadata', () => {
    const someSymbol = symbolCache.get('/test.ts', 'a');
    init({'/test.ts': 'export var a = 2'}, [{symbol: someSymbol, metadata: 1}]);
    expect(symbolResolver.resolveSymbol(someSymbol).metadata).toBe(1);
  });

  it('should be able to get all exported symbols of a file', () => {
    expect(symbolResolver.getSymbolsOf('/tmp/src/reexport/src/origin1.d.ts')).toEqual([
      symbolResolver.getStaticSymbol('/tmp/src/reexport/src/origin1.d.ts', 'One'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/src/origin1.d.ts', 'Two'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/src/origin1.d.ts', 'Three'),
    ]);
  });

  it('should be able to get all reexported symbols of a file', () => {
    expect(symbolResolver.getSymbolsOf('/tmp/src/reexport/reexport.d.ts')).toEqual([
      symbolResolver.getStaticSymbol('/tmp/src/reexport/reexport.d.ts', 'One'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/reexport.d.ts', 'Two'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/reexport.d.ts', 'Four'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/reexport.d.ts', 'Five'),
      symbolResolver.getStaticSymbol('/tmp/src/reexport/reexport.d.ts', 'Thirty')
    ]);
  });

  it('should merge the exported symbols of a file with the exported symbols of its summary', () => {
    const someSymbol = symbolCache.get('/test.ts', 'a');
    init(
        {'/test.ts': 'export var b = 2'},
        [{symbol: symbolCache.get('/test.ts', 'a'), metadata: 1}]);
    expect(symbolResolver.getSymbolsOf('/test.ts')).toEqual([
      symbolCache.get('/test.ts', 'a'), symbolCache.get('/test.ts', 'b')
    ]);
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
    expect(symbolResolver.resolveSymbol(symbolCache.get('/test.ts', 'x')).metadata).toEqual([
      symbolCache.get('/test2.ts', 'y')
    ]);
    expect(symbolResolver.resolveSymbol(symbolCache.get('/test.ts', 'simpleFn')).metadata).toEqual({
      __symbolic: 'function',
      parameters: ['fnArg'],
      value: [
        symbolCache.get('/test.ts', 'a'), symbolCache.get('/test2.ts', 'y'),
        Object({__symbolic: 'reference', name: 'fnArg'})
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
  constructor(private summaries: Summary<StaticSymbol>[] = []) {}

  resolveSummary(reference: StaticSymbol): Summary<StaticSymbol> {
    return this.summaries.find(summary => summary.symbol === reference);
  };
  getSymbolsOf(filePath: string): StaticSymbol[] {
    return this.summaries.filter(summary => summary.symbol.filePath === filePath)
        .map(summary => summary.symbol);
  }
}

export class MockStaticSymbolResolverHost implements StaticSymbolResolverHost {
  private collector = new MetadataCollector();

  constructor(private data: {[key: string]: any}) {}

  // In tests, assume that symbols are not re-exported
  moduleNameToFileName(modulePath: string, containingFile?: string): string {
    function splitPath(path: string): string[] { return path.split(/\/|\\/g); }

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
      const baseName = pathTo(containingFile, modulePath);
      const tsName = baseName + '.ts';
      if (this._getMetadataFor(tsName)) {
        return tsName;
      }
      return baseName + '.d.ts';
    }
    return '/tmp/' + modulePath + '.d.ts';
  }

  getMetadataFor(moduleId: string): any { return this._getMetadataFor(moduleId); }

  private _getMetadataFor(filePath: string): any {
    if (this.data[filePath] && filePath.match(TS_EXT)) {
      const text = this.data[filePath];
      if (typeof text === 'string') {
        const sf = ts.createSourceFile(
            filePath, this.data[filePath], ts.ScriptTarget.ES5, /* setParentNodes */ true);
        const diagnostics: ts.Diagnostic[] = (<any>sf).parseDiagnostics;
        if (diagnostics && diagnostics.length) {
          throw Error(`Error encountered during parse of file ${filePath}`);
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
    version: 3,
    metadata: {},
    exports: [
      {from: './src/origin1', export: ['One', 'Two', {name: 'Three', as: 'Four'}]},
      {from: './src/origin5'}, {from: './src/reexport2'}
    ]
  },
  '/tmp/src/reexport/src/origin1.d.ts': {
    __symbolic: 'module',
    version: 3,
    metadata: {
      One: {__symbolic: 'class'},
      Two: {__symbolic: 'class'},
      Three: {__symbolic: 'class'},
    },
  },
  '/tmp/src/reexport/src/origin5.d.ts': {
    __symbolic: 'module',
    version: 3,
    metadata: {
      Five: {__symbolic: 'class'},
    },
  },
  '/tmp/src/reexport/src/origin30.d.ts': {
    __symbolic: 'module',
    version: 3,
    metadata: {
      Thirty: {__symbolic: 'class'},
    },
  },
  '/tmp/src/reexport/src/originNone.d.ts': {
    __symbolic: 'module',
    version: 3,
    metadata: {},
  },
  '/tmp/src/reexport/src/reexport2.d.ts': {
    __symbolic: 'module',
    version: 3,
    metadata: {},
    exports: [{from: './originNone'}, {from: './origin30'}]
  }
};
