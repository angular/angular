/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileDirectiveMetadata, CompileDirectiveSummary, CompileNgModuleMetadata, CompileNgModuleSummary, CompilePipeMetadata, CompileProviderMetadata, CompileSummaryKind, CompileTypeMetadata, CompileTypeSummary} from '../compile_metadata';
import * as o from '../output/output_ast';
import {Summary, SummaryResolver} from '../summary_resolver';
import {ValueTransformer, ValueVisitor, visitValue} from '../util';

import {StaticSymbol, StaticSymbolCache} from './static_symbol';
import {ResolvedStaticSymbol, StaticSymbolResolver} from './static_symbol_resolver';
import {summaryForJitFileName, summaryForJitName} from './util';

export function serializeSummaries(
    summaryResolver: SummaryResolver<StaticSymbol>, symbolResolver: StaticSymbolResolver,
    symbols: ResolvedStaticSymbol[], types: {
      summary: CompileTypeSummary,
      metadata: CompileNgModuleMetadata | CompileDirectiveMetadata | CompilePipeMetadata |
          CompileTypeMetadata
    }[]): {
  json: string,
  exportAs: {symbol: StaticSymbol, exportAs: string}[],
  forJit: {statements: o.Statement[], exportedVars: string[]}
} {
  const toJsonSerializer = new ToJsonSerializer(symbolResolver, summaryResolver);
  const forJitSerializer = new ForJitSerializer(symbolResolver);

  // for symbols, we use everything except for the class metadata itself
  // (we keep the statics though), as the class metadata is contained in the
  // CompileTypeSummary.
  symbols.forEach(
      (resolvedSymbol) => toJsonSerializer.addOrMergeSummary(
          {symbol: resolvedSymbol.symbol, metadata: resolvedSymbol.metadata}));
  // Add summaries that are referenced by the given symbols (transitively)
  // Note: the serializer.symbols array might be growing while
  // we execute the loop!
  for (let processedIndex = 0; processedIndex < toJsonSerializer.symbols.length; processedIndex++) {
    const symbol = toJsonSerializer.symbols[processedIndex];
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
        if (summary.type) {
          forJitSerializer.addLibType(summary.type);
        }
        toJsonSerializer.addOrMergeSummary(summary);
      }
    }
  }

  // Add type summaries.
  // Note: We don't add the summaries of all referenced symbols as for the ResolvedSymbols,
  // as the type summaries already contain the transitive data that they require
  // (in a minimal way).
  types.forEach(({summary, metadata}) => {
    forJitSerializer.addSourceType(summary, metadata);
    toJsonSerializer.addOrMergeSummary(
        {symbol: summary.type.reference, metadata: null, type: summary});
    if (summary.summaryKind === CompileSummaryKind.NgModule) {
      const ngModuleSummary = <CompileNgModuleSummary>summary;
      ngModuleSummary.exportedDirectives.concat(ngModuleSummary.exportedPipes).forEach((id) => {
        const symbol: StaticSymbol = id.reference;
        if (summaryResolver.isLibraryFile(symbol.filePath)) {
          const summary = summaryResolver.resolveSummary(symbol);
          if (summary) {
            toJsonSerializer.addOrMergeSummary(summary);
          }
        }
      });
    }
  });
  const {json, exportAs} = toJsonSerializer.serialize();
  const {statements, exportedVars} = forJitSerializer.serialize(exportAs);
  return {json, forJit: {statements, exportedVars}, exportAs};
}

export function deserializeSummaries(symbolCache: StaticSymbolCache, json: string):
    {summaries: Summary<StaticSymbol>[], importAs: {symbol: StaticSymbol, importAs: string}[]} {
  const deserializer = new FromJsonDeserializer(symbolCache);
  return deserializer.deserialize(json);
}

class ToJsonSerializer extends ValueTransformer {
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
      // For classes, we keep everything except their class decorators.
      // We need to keep e.g. the ctor args, method names, method decorators
      // so that the class can be extended in another compilation unit.
      // We don't keep the class decorators as
      // 1) they refer to data
      //   that should not cause a rebuild of downstream compilation units
      //   (e.g. inline templates of @Component, or @NgModule.declarations)
      // 2) their data is already captured in TypeSummaries, e.g. DirectiveSummary.
      const clone: {[key: string]: any} = {};
      Object.keys(symbolMeta).forEach((propName) => {
        if (propName !== 'decorators') {
          clone[propName] = symbolMeta[propName];
        }
      });
      symbolMeta = clone;
    }

    let processedSummary = this.processedSummaryBySymbol.get(summary.symbol);
    if (!processedSummary) {
      processedSummary = this.processValue({symbol: summary.symbol});
      this.processedSummaries.push(processedSummary);
      this.processedSummaryBySymbol.set(summary.symbol, processedSummary);
    }
    // Note: == on purpose to compare with undefined!
    if (processedSummary.metadata == null && symbolMeta != null) {
      processedSummary.metadata = this.processValue(symbolMeta);
    }
    // Note: == on purpose to compare with undefined!
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
        let importAs: string = undefined !;
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
      // Note: == on purpose to compare with undefined!
      if (index == null) {
        index = this.indexBySymbol.size;
        this.indexBySymbol.set(baseSymbol, index);
        this.symbols.push(baseSymbol);
      }
      return {__symbol: index, members: value.members};
    }
  }
}

class ForJitSerializer {
  private data = new Map<StaticSymbol, {
    summary: CompileTypeSummary,
    metadata: CompileNgModuleMetadata|CompileDirectiveMetadata|CompilePipeMetadata|
    CompileTypeMetadata|null,
    isLibrary: boolean
  }>();

  constructor(private symbolResolver: StaticSymbolResolver) {}

  addSourceType(
      summary: CompileTypeSummary, metadata: CompileNgModuleMetadata|CompileDirectiveMetadata|
      CompilePipeMetadata|CompileTypeMetadata) {
    this.data.set(summary.type.reference, {summary, metadata, isLibrary: false});
  }

  addLibType(summary: CompileTypeSummary) {
    this.data.set(summary.type.reference, {summary, metadata: null, isLibrary: true});
  }

  serialize(exportAs: {symbol: StaticSymbol, exportAs: string}[]):
      {statements: o.Statement[], exportedVars: string[]} {
    const statements: o.Statement[] = [];
    const exportedVars: string[] = [];
    const ngModuleSymbols = new Set<StaticSymbol>();

    Array.from(this.data.values()).forEach(({summary, metadata, isLibrary}) => {
      if (summary.summaryKind === CompileSummaryKind.NgModule) {
        // collect the symbols that refer to NgModule classes.
        // Note: we can't just rely on `summary.type.summaryKind` to determine this as
        // we don't add the summaries of all referenced symbols when we serialize type summaries.
        // See serializeSummaries for details.
        ngModuleSymbols.add(summary.type.reference);
        const modSummary = <CompileNgModuleSummary>summary;
        modSummary.modules.forEach((mod) => { ngModuleSymbols.add(mod.reference); });
      }
      if (!isLibrary) {
        const fnName = summaryForJitName(summary.type.reference.name);
        statements.push(
            o.fn([], [new o.ReturnStatement(this.serializeSummaryWithDeps(summary, metadata !))],
                 new o.ArrayType(o.DYNAMIC_TYPE))
                .toDeclStmt(fnName, [o.StmtModifier.Final]));
        exportedVars.push(fnName);
      }
    });

    exportAs.forEach((entry) => {
      const symbol = entry.symbol;
      if (ngModuleSymbols.has(symbol)) {
        const jitExportAsName = summaryForJitName(entry.exportAs);
        statements.push(
            o.variable(jitExportAsName).set(this.serializeSummaryRef(symbol)).toDeclStmt());
        exportedVars.push(jitExportAsName);
      }
    });

    return {statements, exportedVars};
  }

  private serializeSummaryWithDeps(
      summary: CompileTypeSummary, metadata: CompileNgModuleMetadata|CompileDirectiveMetadata|
      CompilePipeMetadata|CompileTypeMetadata): o.Expression {
    const expressions: o.Expression[] = [this.serializeSummary(summary)];
    let providers: CompileProviderMetadata[] = [];
    if (metadata instanceof CompileNgModuleMetadata) {
      expressions.push(...
                       // For directives / pipes, we only add the declared ones,
                       // and rely on transitively importing NgModules to get the transitive
                       // summaries.
                       metadata.declaredDirectives.concat(metadata.declaredPipes)
                           .map(type => type.reference)
                           // For modules,
                           // we also add the summaries for modules
                           // from libraries.
                           // This is ok as we produce reexports for all transitive modules.
                           .concat(metadata.transitiveModule.modules.map(type => type.reference)
                                       .filter(ref => ref !== metadata.type.reference))
                           .map((ref) => this.serializeSummaryRef(ref)));
      // Note: We don't use `NgModuleSummary.providers`, as that one is transitive,
      // and we already have transitive modules.
      providers = metadata.providers;
    } else if (summary.summaryKind === CompileSummaryKind.Directive) {
      const dirSummary = <CompileDirectiveSummary>summary;
      providers = dirSummary.providers.concat(dirSummary.viewProviders);
    }
    // Note: We can't just refer to the `ngsummary.ts` files for `useClass` providers (as we do for
    // declaredDirectives / declaredPipes), as we allow
    // providers without ctor arguments to skip the `@Injectable` decorator,
    // i.e. we didn't generate .ngsummary.ts files for these.
    expressions.push(
        ...providers.filter(provider => !!provider.useClass).map(provider => this.serializeSummary({
          summaryKind: CompileSummaryKind.Injectable, type: provider.useClass
        } as CompileTypeSummary)));
    return o.literalArr(expressions);
  }

  private serializeSummaryRef(typeSymbol: StaticSymbol): o.Expression {
    const jitImportedSymbol = this.symbolResolver.getStaticSymbol(
        summaryForJitFileName(typeSymbol.filePath), summaryForJitName(typeSymbol.name));
    return o.importExpr({reference: jitImportedSymbol});
  }

  private serializeSummary(data: {[key: string]: any}): o.Expression {
    class Transformer implements ValueVisitor {
      visitArray(arr: any[], context: any): any {
        return o.literalArr(arr.map(entry => visitValue(entry, this, context)));
      }
      visitStringMap(map: {[key: string]: any}, context: any): any {
        return new o.LiteralMapExpr(Object.keys(map).map(
            (key) => new o.LiteralMapEntry(key, visitValue(map[key], this, context))));
      }
      visitPrimitive(value: any, context: any): any { return o.literal(value); }
      visitOther(value: any, context: any): any {
        if (value instanceof StaticSymbol) {
          return o.importExpr({reference: value});
        } else {
          throw new Error(`Illegal State: Encountered value ${value}`);
        }
      }
    }

    return visitValue(data, new Transformer(), null);
  }
}

class FromJsonDeserializer extends ValueTransformer {
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