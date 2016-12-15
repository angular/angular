/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileDirectiveSummary, CompileIdentifierMetadata, CompileNgModuleSummary, CompilePipeSummary, CompileSummaryKind, CompileTypeMetadata, CompileTypeSummary, identifierModuleUrl, identifierName} from '../compile_metadata';
import {Summary, SummaryResolver} from '../summary_resolver';
import {ValueTransformer, visitValue} from '../util';

import {GeneratedFile} from './generated_file';
import {StaticSymbol, StaticSymbolCache} from './static_symbol';
import {ResolvedStaticSymbol, StaticSymbolResolver} from './static_symbol_resolver';

const STRIP_SRC_FILE_SUFFIXES = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;

export interface AotSummarySerializerHost {
  /**
   * Returns the output file path of a source file.
   * E.g.
   * `some_file.ts` -> `some_file.d.ts`
   */
  getOutputFileName(sourceFilePath: string): string;
  /**
   * Returns whether a file is a source file or not.
   */
  isSourceFile(sourceFilePath: string): boolean;
}

export function serializeSummaries(
    host: AotSummarySerializerHost, summaryResolver: SummaryResolver<StaticSymbol>,
    symbolResolver: StaticSymbolResolver,

    symbols: ResolvedStaticSymbol[], types: CompileTypeSummary[]): string {
  const serializer = new Serializer(host);

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
    if (!host.isSourceFile(symbol.filePath)) {
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
        if (!host.isSourceFile(symbol.filePath)) {
          serializer.addOrMergeSummary(summaryResolver.resolveSummary(symbol));
        }
      });
    }
  });
  return serializer.serialize();
}

export function deserializeSummaries(
    symbolCache: StaticSymbolCache, json: string): Summary<StaticSymbol>[] {
  const deserializer = new Deserializer(symbolCache);
  return deserializer.deserialize(json);
}

export function summaryFileName(fileName: string): string {
  const fileNameWithoutSuffix = fileName.replace(STRIP_SRC_FILE_SUFFIXES, '');
  return `${fileNameWithoutSuffix}.ngsummary.json`;
}

class Serializer extends ValueTransformer {
  symbols: StaticSymbol[] = [];
  private indexBySymbol = new Map<StaticSymbol, number>();
  // This now contains a `__symbol: number` in the place of
  // StaticSymbols, but otherwise has the same shape as the original objects.
  private processedSummaryBySymbol = new Map<StaticSymbol, any>();
  private processedSummaries: any[] = [];

  constructor(private host: AotSummarySerializerHost) { super(); }

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

  serialize(): string {
    return JSON.stringify({
      summaries: this.processedSummaries,
      symbols: this.symbols.map((symbol, index) => {
        return {
          __symbol: index,
          name: symbol.name,
          // We convert the source filenames tinto output filenames,
          // as the generated summary file will be used when teh current
          // compilation unit is used as a library
          filePath: this.host.getOutputFileName(symbol.filePath)
        };
      })
    });
  }

  private processValue(value: any): any { return visitValue(value, this, null); }

  visitOther(value: any, context: any): any {
    if (value instanceof StaticSymbol) {
      let index = this.indexBySymbol.get(value);
      // Note: == by purpose to compare with undefined!
      if (index == null) {
        index = this.indexBySymbol.size;
        this.indexBySymbol.set(value, index);
        this.symbols.push(value);
      }
      return {__symbol: index};
    }
  }
}

class Deserializer extends ValueTransformer {
  private symbols: StaticSymbol[];

  constructor(private symbolCache: StaticSymbolCache) { super(); }

  deserialize(json: string): Summary<StaticSymbol>[] {
    const data: {summaries: any[], symbols: any[]} = JSON.parse(json);
    this.symbols = data.symbols.map(
        serializedSymbol => this.symbolCache.get(serializedSymbol.filePath, serializedSymbol.name));
    return visitValue(data.summaries, this, null);
  }

  visitStringMap(map: {[key: string]: any}, context: any): any {
    if ('__symbol' in map) {
      return this.symbols[map['__symbol']];
    } else {
      return super.visitStringMap(map, context);
    }
  }
}