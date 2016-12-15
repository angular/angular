/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotSummaryResolver, AotSummaryResolverHost, CompileSummaryKind, CompileTypeSummary, ResolvedStaticSymbol, StaticSymbol, StaticSymbolCache, StaticSymbolResolver} from '@angular/compiler';
import {AotSummarySerializerHost, deserializeSummaries, serializeSummaries} from '@angular/compiler/src/aot/summary_serializer';
import * as path from 'path';

import {MockStaticSymbolResolverHost, MockSummaryResolver} from './static_symbol_resolver_spec';

const EXT = /\.ts$|.d.ts$/;

export function main() {
  describe('AotSummaryResolver', () => {
    let summaryResolver: AotSummaryResolver;
    let symbolCache: StaticSymbolCache;
    let host: MockAotSummaryResolverHost;

    beforeEach(() => { symbolCache = new StaticSymbolCache(); });

    function init(summaries: {[filePath: string]: string} = {}) {
      host = new MockAotSummaryResolverHost(summaries);
      summaryResolver = new AotSummaryResolver(host, symbolCache);
    }

    function serialize(symbols: ResolvedStaticSymbol[], types: CompileTypeSummary[]): string {
      // Note: Don't use the top level host / summaryResolver as they might not be created yet
      const mockSummaryResolver = new MockSummaryResolver([]);
      const symbolResolver = new StaticSymbolResolver(
          new MockStaticSymbolResolverHost({}), symbolCache, mockSummaryResolver);
      return serializeSummaries(
          new MockAotSummarySerializerHost(), mockSummaryResolver, symbolResolver, symbols, types);
    }

    it('should load serialized summary files', () => {
      const asymbol = symbolCache.get('/a.d.ts', 'a');
      init({'/a.ngsummary.json': serialize([{symbol: asymbol, metadata: 1}], [])});
      expect(summaryResolver.resolveSummary(asymbol)).toEqual({symbol: asymbol, metadata: 1});
    });

    it('should not load summaries for source files', () => {
      init({});
      spyOn(host, 'loadSummary').and.callThrough();

      expect(summaryResolver.resolveSummary(symbolCache.get('/a.ts', 'a'))).toBeFalsy();
      expect(host.loadSummary).not.toHaveBeenCalled();
    });

    it('should cache summaries', () => {
      const asymbol = symbolCache.get('/a.d.ts', 'a');
      init({'/a.ngsummary.json': serialize([{symbol: asymbol, metadata: 1}], [])});
      expect(summaryResolver.resolveSummary(asymbol)).toBe(summaryResolver.resolveSummary(asymbol));
    });

    it('should return all sumbols in a summary', () => {
      const asymbol = symbolCache.get('/a.d.ts', 'a');
      init({'/a.ngsummary.json': serialize([{symbol: asymbol, metadata: 1}], [])});
      expect(summaryResolver.getSymbolsOf('/a.d.ts')).toEqual([asymbol]);

    });
  });
}


export class MockAotSummarySerializerHost implements AotSummarySerializerHost {
  fileNameToModuleName(fileName: string): string {
    return './' + path.basename(fileName).replace(EXT, '');
  }

  getOutputFileName(sourceFileName: string): string {
    return sourceFileName.replace(EXT, '') + '.d.ts';
  }

  isSourceFile(filePath: string) { return !filePath.endsWith('.d.ts'); }
}

export class MockAotSummaryResolverHost extends MockAotSummarySerializerHost implements
    AotSummaryResolverHost {
  constructor(private summaries: {[fileName: string]: string}) { super(); }

  loadSummary(filePath: string): string { return this.summaries[filePath]; }
}