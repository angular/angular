/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotSummaryResolver, AotSummaryResolverHost, CompileSummaryKind, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, StaticSymbolResolverHost} from '@angular/compiler';
import {AotSummarySerializerHost, deserializeSummaries, serializeSummaries, summaryFileName} from '@angular/compiler/src/aot/summary_serializer';

import {MockStaticSymbolResolverHost} from './static_symbol_resolver_spec';
import {MockAotSummaryResolverHost} from './summary_resolver_spec';


export function main() {
  describe('summary serializer', () => {
    let summaryResolver: AotSummaryResolver;
    let symbolResolver: StaticSymbolResolver;
    let symbolCache: StaticSymbolCache;
    let host: MockAotSummaryResolverHost;

    beforeEach(() => { symbolCache = new StaticSymbolCache(); });

    function init(
        summaries: {[filePath: string]: string} = {}, metadata: {[key: string]: any} = {}) {
      host = new MockAotSummaryResolverHost(summaries);
      summaryResolver = new AotSummaryResolver(host, symbolCache);
      symbolResolver = new StaticSymbolResolver(
          new MockStaticSymbolResolverHost(metadata), symbolCache, summaryResolver);
    }

    describe('summaryFileName', () => {
      it('should add .ngsummary.json to the filename', () => {
        init();
        expect(summaryFileName('a.ts')).toBe('a.ngsummary.json');
        expect(summaryFileName('a.d.ts')).toBe('a.ngsummary.json');
        expect(summaryFileName('a.js')).toBe('a.ngsummary.json');
      });
    });

    it('should serialize various data correctly', () => {
      init();
      const serializedData = serializeSummaries(
          host, summaryResolver, symbolResolver,
          [
            {
              symbol: symbolCache.get('/tmp/some_values.ts', 'Values'),
              metadata: {
                aNumber: 1,
                aString: 'hello',
                anArray: [1, 2],
                aStaticSymbol: symbolCache.get('/tmp/some_symbol.ts', 'someName')
              }
            },
            {
              symbol: symbolCache.get('/tmp/some_service.ts', 'SomeService'),
              metadata: {
                __symbolic: 'class',
                members: {'aMethod': {__symbolic: 'function'}},
                statics: {aStatic: true}
              }
            }
          ],
          [<any>{
            summaryKind: CompileSummaryKind.Injectable,
            type: {
              reference: symbolCache.get('/tmp/some_service.ts', 'SomeService'),
            },
          }]);


      const summaries = deserializeSummaries(symbolCache, serializedData);
      expect(summaries.length).toBe(2);

      // Note: change from .ts to .d.ts is expected
      expect(summaries[0].symbol).toBe(symbolCache.get('/tmp/some_values.d.ts', 'Values'));
      expect(summaries[0].metadata).toEqual({
        aNumber: 1,
        aString: 'hello',
        anArray: [1, 2],
        aStaticSymbol: symbolCache.get('/tmp/some_symbol.d.ts', 'someName')
      });

      expect(summaries[1].symbol).toBe(symbolCache.get('/tmp/some_service.d.ts', 'SomeService'));
      // serialization should only keep the statics...
      expect(summaries[1].metadata).toEqual({__symbolic: 'class', statics: {aStatic: true}});
      expect(summaries[1].type.type.reference)
          .toBe(symbolCache.get('/tmp/some_service.d.ts', 'SomeService'));
    });

    it('should automatically add exported directives / pipes of NgModules that are not source files',
       () => {
         init({});
         const externalSerialized = serializeSummaries(host, summaryResolver, symbolResolver, [], [
           <any>{
             summaryKind: CompileSummaryKind.Pipe,
             type: {
               reference: symbolCache.get('/tmp/external.ts', 'SomeExternalPipe'),
             }
           },
           <any>{
             summaryKind: CompileSummaryKind.Directive,
             type: {
               reference: symbolCache.get('/tmp/external.ts', 'SomeExternalDir'),
             }
           }
         ]);
         init({
           '/tmp/external.ngsummary.json': externalSerialized,
         });

         const serialized = serializeSummaries(
             host, summaryResolver, symbolResolver, [], [<any>{
               summaryKind: CompileSummaryKind.NgModule,
               type: {reference: symbolCache.get('/tmp/some_module.ts', 'SomeModule')},
               exportedPipes: [
                 {reference: symbolCache.get('/tmp/some_pipe.ts', 'SomePipe')},
                 {reference: symbolCache.get('/tmp/external.d.ts', 'SomeExternalPipe')}
               ],
               exportedDirectives: [
                 {reference: symbolCache.get('/tmp/some_dir.ts', 'SomeDir')},
                 {reference: symbolCache.get('/tmp/external.d.ts', 'SomeExternalDir')}
               ]
             }]);

         const summaries = deserializeSummaries(symbolCache, serialized);
         expect(summaries.length).toBe(3);
         expect(summaries[0].symbol).toBe(symbolCache.get('/tmp/some_module.d.ts', 'SomeModule'));
         expect(summaries[1].symbol).toBe(symbolCache.get('/tmp/external.d.ts', 'SomeExternalDir'));
         expect(summaries[2].symbol)
             .toBe(symbolCache.get('/tmp/external.d.ts', 'SomeExternalPipe'));
       });

    it('should automatically add the metadata of referenced symbols that are not in the soure files',
       () => {
         const externalSerialized = serializeSummaries(
             host, summaryResolver, symbolResolver,
             [
               {
                 symbol: symbolCache.get('/tmp/external.ts', 'PROVIDERS'),
                 metadata: [symbolCache.get('/tmp/external_svc.ts', 'SomeService')]
               },
               {
                 symbol: symbolCache.get('/tmp/external_svc.ts', 'SomeService'),
                 metadata: {__symbolic: 'class'}
               }
             ],
             [<any>{
               summaryKind: CompileSummaryKind.Injectable,
               type: {
                 reference: symbolCache.get('/tmp/external_svc.ts', 'SomeService'),
               }
             }]);
         init(
             {
               '/tmp/external.ngsummary.json': externalSerialized,
             },
             {
               '/tmp/local.ts': `
          export var local = 'a';
        `,
               '/tmp/non_summary.d.ts':
                   {__symbolic: 'module', version: 3, metadata: {'external': 'b'}}
             });
         const serialized = serializeSummaries(
             host, summaryResolver, symbolResolver, [{
               symbol: symbolCache.get('/tmp/test.ts', 'main'),
               metadata: {
                 local: symbolCache.get('/tmp/local.ts', 'local'),
                 external: symbolCache.get('/tmp/external.d.ts', 'PROVIDERS'),
                 externalNonSummary: symbolCache.get('/tmp/non_summary.d.ts', 'external')
               }
             }],
             []);

         const summaries = deserializeSummaries(symbolCache, serialized);
         // Note: local should not show up!
         expect(summaries.length).toBe(4);
         expect(summaries[0].symbol).toBe(symbolCache.get('/tmp/test.d.ts', 'main'));
         expect(summaries[0].metadata).toEqual({
           local: symbolCache.get('/tmp/local.d.ts', 'local'),
           external: symbolCache.get('/tmp/external.d.ts', 'PROVIDERS'),
           externalNonSummary: symbolCache.get('/tmp/non_summary.d.ts', 'external')
         });
         expect(summaries[1].symbol).toBe(symbolCache.get('/tmp/external.d.ts', 'PROVIDERS'));
         expect(summaries[1].metadata).toEqual([symbolCache.get(
             '/tmp/external_svc.d.ts', 'SomeService')]);
         // there was no summary for non_summary, but it should have
         // been serialized as well.
         expect(summaries[2].symbol).toBe(symbolCache.get('/tmp/non_summary.d.ts', 'external'));
         expect(summaries[2].metadata).toEqual('b');
         // SomService is a transitive dep, but sould have been serialized as well.
         expect(summaries[3].symbol).toBe(symbolCache.get('/tmp/external_svc.d.ts', 'SomeService'));
         expect(summaries[3].type.type.reference)
             .toBe(symbolCache.get('/tmp/external_svc.d.ts', 'SomeService'));
       });
  });
}
