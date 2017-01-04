/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileNgModuleSummary, CompileSummaryKind, CompileTypeSummary} from '../compile_metadata';
import {Summary, SummaryResolver} from '../summary_resolver';
import {ValueTransformer, visitValue} from '../util';

import {StaticSymbol, StaticSymbolCache} from './static_symbol';
import {ResolvedStaticSymbol, StaticSymbolResolver} from './static_symbol_resolver';


export function serializeSummaries(
    summaryResolver: SummaryResolver<StaticSymbol>, symbolResolver: StaticSymbolResolver,
    symbols: ResolvedStaticSymbol[], types: CompileTypeSummary[]):
    {json: string, exportAs: {symbol: StaticSymbol, exportAs: string}[]} {
  const serializer = new Serializer(symbolResolver, summaryResolver);

  // for symbols, we use everything except for the class metadata itself
  // (we keep the statics though), as the class metadata is contained in the
  // CompileTypeSummary.
  symbols.forEach(
      (resolvedSymbol) => serializer.addOrMergeSummary(
          {symbol: resolvedSymbol.symbol, metadata: resolvedSymbol.metadata}));
  // Add summaries that are referenced by the given symbols (transitively)
  // Note: the serializer.symbols array might be growing while
  // we execute the loop!
  for (let processedIndex = 0; processedIndex < serializer.symbols.length; processedIndex++) {
    const symbol = serializer.symbols[processedIndex];
    if (summaryResolver.isLibraryFile(symbol.filePath)) {
      let summary = summaryResolver.resolveSummary(symbol);
      if (!summary) {
        // some symbols might originate from a plain typescript library
        // that just exported .d.ts and .metadata.json files, i.e. where no summary
        // files were created.
        const resolvedSymbol = symbolResolver.resolveSymbol(symbol);
        if (resolvedSymbol) {
          summary = {symbol: resolvedSymbol.symbol, metadata: resolvedSymbol.metadata};
        }
      }
      if (summary) {
        serializer.addOrMergeSummary(summary);
      }
    }
  }

  // Add type summaries.
  // Note: We don't add the summaries of all referenced symbols as for the ResolvedSymbols,
  // as the type summaries already contain the transitive data that they require
  // (in a minimal way).
  types.forEach((typeSummary) => {
    serializer.addOrMergeSummary(
        {symbol: typeSummary.type.reference, metadata: {__symbolic: 'class'}, type: typeSummary});
    if (typeSummary.summaryKind === CompileSummaryKind.NgModule) {
      const ngModuleSummary = <CompileNgModuleSummary>typeSummary;
      ngModuleSummary.exportedDirectives.concat(ngModuleSummary.exportedPipes).forEach((id) => {
        const symbol: StaticSymbol = id.reference;
        if (summaryResolver.isLibraryFile(symbol.filePath)) {
          const summary = summaryResolver.resolveSummary(symbol);
          if (summary) {
            serializer.addOrMergeSummary(summary);
          }
        }
      });
    }
  });
  return serializer.serialize();
}

export function deserializeSummaries(symbolCache: StaticSymbolCache, json: string):
    {summaries: Summary<StaticSymbol>[], importAs: {symbol: StaticSymbol, importAs: string}[]} {
  const deserializer = new Deserializer(symbolCache);
  return deserializer.deserialize(json);
}

class Serializer extends ValueTransformer {
  // Note: This only contains symbols without members.
  symbols: StaticSymbol[] = [];
  private indexBySymbol = new Map<StaticSymbol, number>();
  // This now contains a `__symbol: number` in the place of
  // StaticSymbols, but otherwise has the same shape as the original objects.
  private processedSummaryBySymbol = new Map<StaticSymbol, any>();
  private processedSummaries: any[] = [];

  constructor(
      private symbolResolver: StaticSymbolResolver,
      private summaryResolver: SummaryResolver<StaticSymbol>) {
    super();
  }

  addOrMergeSummary(summary: Summary<StaticSymbol>) {
    let symbolMeta = summary.metadata;
    if (symbolMeta && symbolMeta.__symbolic === 'class') {
      // For classes, we only keep their statics, but not the metadata
      // of the class itself as that has been captured already via other summaries
      // (e.g. DirectiveSummary, ...).
      symbolMeta = {__symbolic: 'class', statics: symbolMeta.statics};
    }

    let processedSummary = this.processedSummaryBySymbol.get(summary.symbol);
    if (!processedSummary) {
      processedSummary = this.processValue({symbol: summary.symbol});
      this.processedSummaries.push(processedSummary);
      this.processedSummaryBySymbol.set(summary.symbol, processedSummary);
    }
    // Note: == by purpose to compare with undefined!
    if (processedSummary.metadata == null && symbolMeta != null) {
      processedSummary.metadata = this.processValue(symbolMeta);
    }
    // Note: == by purpose to compare with undefined!
    if (processedSummary.type == null && summary.type != null) {
      processedSummary.type = this.processValue(summary.type);
    }
  }

  serialize(): {json: string, exportAs: {symbol: StaticSymbol, exportAs: string}[]} {
    const exportAs: {symbol: StaticSymbol, exportAs: string}[] = [];
    const json = JSON.stringify({
      summaries: this.processedSummaries,
      symbols: this.symbols.map((symbol, index) => {
        symbol.assertNoMembers();
        let importAs: string;
        if (this.summaryResolver.isLibraryFile(symbol.filePath)) {
          importAs = `${symbol.name}_${index}`;
          exportAs.push({symbol, exportAs: importAs});
        }
        return {
          __symbol: index,
          name: symbol.name,
          // We convert the source filenames tinto output filenames,
          // as the generated summary file will be used when teh current
          // compilation unit is used as a library
          filePath: this.summaryResolver.getLibraryFileName(symbol.filePath),
          importAs: importAs
        };
      })
    });
    return {json, exportAs};
  }

  private processValue(value: any): any { return visitValue(value, this, null); }

  visitOther(value: any, context: any): any {
    if (value instanceof StaticSymbol) {
      const baseSymbol = this.symbolResolver.getStaticSymbol(value.filePath, value.name);
      let index = this.indexBySymbol.get(baseSymbol);
      // Note: == by purpose to compare with undefined!
      if (index == null) {
        index = this.indexBySymbol.size;
        this.indexBySymbol.set(baseSymbol, index);
        this.symbols.push(baseSymbol);
      }
      return {__symbol: index, members: value.members};
    }
  }
}

class Deserializer extends ValueTransformer {
  private symbols: StaticSymbol[];

  constructor(private symbolCache: StaticSymbolCache) { super(); }

  deserialize(json: string):
      {summaries: Summary<StaticSymbol>[], importAs: {symbol: StaticSymbol, importAs: string}[]} {
    const data: {summaries: any[], symbols: any[]} = JSON.parse(json);
    const importAs: {symbol: StaticSymbol, importAs: string}[] = [];
    this.symbols = [];
    data.symbols.forEach((serializedSymbol) => {
      const symbol = this.symbolCache.get(serializedSymbol.filePath, serializedSymbol.name);
      this.symbols.push(symbol);
      if (serializedSymbol.importAs) {
        importAs.push({symbol: symbol, importAs: serializedSymbol.importAs});
      }
    });
    const summaries = visitValue(data.summaries, this, null);
    return {summaries, importAs};
  }

  visitStringMap(map: {[key: string]: any}, context: any): any {
    if ('__symbol' in map) {
      const baseSymbol = this.symbols[map['__symbol']];
      const members = map['members'];
      return members.length ? this.symbolCache.get(baseSymbol.filePath, baseSymbol.name, members) :
                              baseSymbol;
    } else {
      return super.visitStringMap(map, context);
    }
  }
}