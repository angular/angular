/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotSummaryResolver, AotSummaryResolverHost, CompileTypeSummary, StaticReflector, StaticReflectorHost, StaticSymbol} from '@angular/compiler';
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

    it('should serialize plain data', () => {
      init();
      const data = <any>[{a: 'b'}];
      expect(JSON.parse(resolver.serializeSummaries('someSourceFile', data).source)).toEqual(data);
    });

    it('should serialize summary for .ts files and deserialize based on .d.ts files', () => {
      init();
      const serializedData = resolver.serializeSummaries(
          '/tmp/some_class.ts', [{
            isSummary: true,
            type: {
              reference: staticReflector.getStaticSymbol('/tmp/some_class.ts', 'SomeClass'),
              diDeps: [],
              lifecycleHooks: []
            }
          }]);

      // Note: this creates a new staticReflector!
      init({[serializedData.genFileUrl]: serializedData.source});

      expect(resolver.resolveSummary(
                 staticReflector.getStaticSymbol('/tmp/some_class.d.ts', 'SomeClass')))
          .toEqual({
            isSummary: true,
            type: {
              reference: staticReflector.getStaticSymbol('/tmp/some_class.d.ts', 'SomeClass'),
              diDeps: [],
              lifecycleHooks: []
            }
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