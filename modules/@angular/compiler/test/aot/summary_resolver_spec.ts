/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotSummaryResolver, AotSummaryResolverHost, CompileNgModuleSummary, CompileSummaryKind, CompileTypeSummary, StaticReflector, StaticReflectorHost, StaticSymbol} from '@angular/compiler';
import * as path from 'path';

import {MockStaticReflectorHost} from './static_reflector_spec';

const EXT = /\.ts$|.d.ts$/;

export function main() {
  describe('AotSummaryResolver', () => {
    let resolver: AotSummaryResolver;
    let staticReflector: StaticReflector;

    function init(summaries: {[filePath: string]: string} = {}) {
      // Note: We don't give the static reflector metadata files,
      // so that we can test that we can deserialize summary files
      // without reading metadata files. This is important
      // as summary files can contain references to files of transitive compilation
      // dependencies, and we don't want to read their metadata files.
      staticReflector = new StaticReflector(new MockStaticReflectorHost({}));
      const host = new MockAotSummaryResolverHost(summaries);
      resolver = new AotSummaryResolver(host, staticReflector, {excludeFilePattern: /\.d\.ts$/});
    }

    it('should add .ngsummary.json to the filename', () => {
      init();
      expect(resolver.serializeSummaries('a.ts', []).genFileUrl).toBe('a.ngsummary.json');
      expect(resolver.serializeSummaries('a.d.ts', []).genFileUrl).toBe('a.ngsummary.json');
      expect(resolver.serializeSummaries('a.js', []).genFileUrl).toBe('a.ngsummary.json');
    });

    it('should serialize various data correctly', () => {
      init();
      const serializedData = resolver.serializeSummaries(
          '/tmp/some_pipe.ts', [<any>{
            summaryKind: CompileSummaryKind.Pipe,
            type: {
              reference: staticReflector.getStaticSymbol('/tmp/some_pipe.ts', 'SomePipe'),
            },
            aNumber: 1,
            aString: 'hello',
            anArray: [1, 2],
            aStaticSymbol:
                staticReflector.getStaticSymbol('/tmp/some_symbol.ts', 'someName', ['someMember'])
          }]);

      // Note: this creates a new staticReflector!
      init({[serializedData.genFileUrl]: serializedData.source});

      const deserialized = resolver.resolveSummary(
          staticReflector.getStaticSymbol('/tmp/some_pipe.d.ts', 'SomePipe'));
      expect(deserialized.aNumber).toBe(1);
      expect(deserialized.aString).toBe('hello');
      expect(deserialized.anArray).toEqual([1, 2]);
      expect(deserialized.aStaticSymbol instanceof StaticSymbol).toBe(true);
      // Note: change from .ts to .d.ts is expected
      expect(deserialized.aStaticSymbol)
          .toEqual(
              staticReflector.getStaticSymbol('/tmp/some_symbol.d.ts', 'someName', ['someMember']));
    });

    it('should store reexports in the same file', () => {
      init();
      const reexportedData = resolver.serializeSummaries(
          '/tmp/some_pipe.ts', [{
            summaryKind: CompileSummaryKind.Pipe,
            type: {
              reference: staticReflector.getStaticSymbol('/tmp/some_pipe.ts', 'SomeReexportedPipe'),
              diDeps: [],
              lifecycleHooks: []
            },
          }]);

      init({[reexportedData.genFileUrl]: reexportedData.source});
      const serializedData = resolver.serializeSummaries('/tmp/some_module.ts', [
        <CompileNgModuleSummary>{
          summaryKind: CompileSummaryKind.NgModule,
          type: {
            reference: staticReflector.getStaticSymbol('/tmp/some_module.ts', 'SomeModule'),
            diDeps: [],
            lifecycleHooks: []
          },
          exportedPipes: [{
            reference: staticReflector.getStaticSymbol('/tmp/some_pipe.d.ts', 'SomeReexportedPipe')
          }],
          exportedDirectives: [],
          providers: [],
          entryComponents: [],
          modules: []
        }
      ]);

      init({[serializedData.genFileUrl]: serializedData.source});

      resolver.resolveSummary(
          staticReflector.getStaticSymbol('/tmp/some_module.d.ts', 'SomeModule'));
      expect(resolver.resolveSummary(
                 staticReflector.getStaticSymbol('/tmp/some_pipe.d.ts', 'SomeReexportedPipe')))
          .toEqual({
            summaryKind: CompileSummaryKind.Pipe,
            type: {
              reference:
                  staticReflector.getStaticSymbol('/tmp/some_pipe.d.ts', 'SomeReexportedPipe'),
              diDeps: [],
              lifecycleHooks: []
            },
          });
    });

  });
}

class MockAotSummaryResolverHost implements AotSummaryResolverHost {
  constructor(private summaries: {[fileName: string]: string}) {}

  loadSummary(filePath: string): string {
    const result = this.summaries[filePath];
    if (!result) {
      throw new Error(`Could not find summary for ${filePath}`);
    }
    return result;
  }

  fileNameToModuleName(fileName: string): string {
    return './' + path.basename(fileName).replace(EXT, '');
  }

  getOutputFileName(sourceFileName: string): string {
    return sourceFileName.replace(EXT, '') + '.d.ts';
  }
}