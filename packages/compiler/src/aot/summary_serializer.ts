/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileDirectiveMetadata, CompileDirectiveSummary, CompileNgModuleMetadata, CompileNgModuleSummary, CompilePipeMetadata, CompileProviderMetadata, CompileSummaryKind, CompileTypeMetadata, CompileTypeSummary} from '../compile_metadata';
import * as o from '../output/output_ast';
import {Summary, SummaryResolver} from '../summary_resolver';
import {OutputContext, ValueTransformer, ValueVisitor, visitValue} from '../util';

import {StaticSymbol, StaticSymbolCache} from './static_symbol';
import {ResolvedStaticSymbol, StaticSymbolResolver, unwrapResolvedMetadata} from './static_symbol_resolver';
import {isLoweredSymbol, ngfactoryFilePath, summaryForJitFileName, summaryForJitName} from './util';

export function serializeSummaries(
    srcFileName: string, forJitCtx: OutputContext|null,
    summaryResolver: SummaryResolver<StaticSymbol>, symbolResolver: StaticSymbolResolver,
    symbols: ResolvedStaticSymbol[], types: {
      summary: CompileTypeSummary,
      metadata: CompileNgModuleMetadata|CompileDirectiveMetadata|CompilePipeMetadata|
      CompileTypeMetadata
    }[],
    createExternalSymbolReexports =
        false): {json: string, exportAs: {symbol: StaticSymbol, exportAs: string}[]} {
  const toJsonSerializer = new ToJsonSerializer(symbolResolver, summaryResolver, srcFileName);

  // for symbols, we use everything except for the class metadata itself
  // (we keep the statics though), as the class metadata is contained in the
  // CompileTypeSummary.
  symbols.forEach(
      (resolvedSymbol) => toJsonSerializer.addSummary(
          {symbol: resolvedSymbol.symbol, metadata: resolvedSymbol.metadata}));

  // Add type summaries.
  types.forEach(({summary, metadata}) => {
    toJsonSerializer.addSummary(
        {symbol: summary.type.reference, metadata: undefined, type: summary});
  });
  const {json, exportAs} = toJsonSerializer.serialize(createExternalSymbolReexports);
  if (forJitCtx) {
    const forJitSerializer = new ForJitSerializer(forJitCtx, symbolResolver, summaryResolver);
    types.forEach(({summary, metadata}) => {
      forJitSerializer.addSourceType(summary, metadata);
    });
    toJsonSerializer.unprocessedSymbolSummariesBySymbol.forEach((summary) => {
      if (summaryResolver.isLibraryFile(summary.symbol.filePath) && summary.type) {
        forJitSerializer.addLibType(summary.type);
      }
    });
    forJitSerializer.serialize(exportAs);
  }
  return {json, exportAs};
}

export function deserializeSummaries(
    symbolCache: StaticSymbolCache, summaryResolver: SummaryResolver<StaticSymbol>,
    libraryFileName: string, json: string): {
  moduleName: string|null,
  summaries: Summary<StaticSymbol>[],
  importAs: {symbol: StaticSymbol, importAs: StaticSymbol}[]
} {
  const deserializer = new FromJsonDeserializer(symbolCache, summaryResolver);
  return deserializer.deserialize(libraryFileName, json);
}

export function createForJitStub(outputCtx: OutputContext, reference: StaticSymbol) {
  return createSummaryForJitFunction(outputCtx, reference, o.NULL_EXPR);
}

function createSummaryForJitFunction(
    outputCtx: OutputContext, reference: StaticSymbol, value: o.Expression) {
  const fnName = summaryForJitName(reference.name);
  outputCtx.statements.push(
      o.fn([], [new o.ReturnStatement(value)], new o.ArrayType(o.DYNAMIC_TYPE)).toDeclStmt(fnName, [
        o.StmtModifier.Final, o.StmtModifier.Exported
      ]));
}

const enum SerializationFlags {
  None = 0,
  ResolveValue = 1,
}

class ToJsonSerializer extends ValueTransformer {
  // Note: This only contains symbols without members.
  private symbols: StaticSymbol[] = [];
  private indexBySymbol = new Map<StaticSymbol, number>();
  private reexportedBy = new Map<StaticSymbol, StaticSymbol>();
  // This now contains a `__symbol: number` in the place of
  // StaticSymbols, but otherwise has the same shape as the original objects.
  private processedSummaryBySymbol = new Map<StaticSymbol, any>();
  private processedSummaries: any[] = [];
  private moduleName: string|null;

  unprocessedSymbolSummariesBySymbol = new Map<StaticSymbol, Summary<StaticSymbol>>();

  constructor(
      private symbolResolver: StaticSymbolResolver,
      private summaryResolver: SummaryResolver<StaticSymbol>, private srcFileName: string) {
    super();
    this.moduleName = symbolResolver.getKnownModuleName(srcFileName);
  }

  addSummary(summary: Summary<StaticSymbol>) {
    let unprocessedSummary = this.unprocessedSymbolSummariesBySymbol.get(summary.symbol);
    let processedSummary = this.processedSummaryBySymbol.get(summary.symbol);
    if (!unprocessedSummary) {
      unprocessedSummary = {symbol: summary.symbol, metadata: undefined};
      this.unprocessedSymbolSummariesBySymbol.set(summary.symbol, unprocessedSummary);
      processedSummary = {symbol: this.processValue(summary.symbol, SerializationFlags.None)};
      this.processedSummaries.push(processedSummary);
      this.processedSummaryBySymbol.set(summary.symbol, processedSummary);
    }
    if (!unprocessedSummary.metadata && summary.metadata) {
      let metadata = summary.metadata || {};
      if (metadata.__symbolic === 'class') {
        // For classes, we keep everything except their class decorators.
        // We need to keep e.g. the ctor args, method names, method decorators
        // so that the class can be extended in another compilation unit.
        // We don't keep the class decorators as
        // 1) they refer to data
        //   that should not cause a rebuild of downstream compilation units
        //   (e.g. inline templates of @Component, or @NgModule.declarations)
        // 2) their data is already captured in TypeSummaries, e.g. DirectiveSummary.
        const clone: {[key: string]: any} = {};
        Object.keys(metadata).forEach((propName) => {
          if (propName !== 'decorators') {
            clone[propName] = metadata[propName];
          }
        });
        metadata = clone;
      } else if (isCall(metadata)) {
        if (!isFunctionCall(metadata) && !isMethodCallOnVariable(metadata)) {
          // Don't store complex calls as we won't be able to simplify them anyways later on.
          metadata = {
            __symbolic: 'error',
            message: 'Complex function calls are not supported.',
          };
        }
      }
      // Note: We need to keep storing ctor calls for e.g.
      // `export const x = new InjectionToken(...)`
      unprocessedSummary.metadata = metadata;
      processedSummary.metadata = this.processValue(metadata, SerializationFlags.ResolveValue);
      if (metadata instanceof StaticSymbol &&
          this.summaryResolver.isLibraryFile(metadata.filePath)) {
        const declarationSymbol = this.symbols[this.indexBySymbol.get(metadata)!];
        if (!isLoweredSymbol(declarationSymbol.name)) {
          // Note: symbols that were introduced during codegen in the user file can have a reexport
          // if a user used `export *`. However, we can't rely on this as tsickle will change
          // `export *` into named exports, using only the information from the typechecker.
          // As we introduce the new symbols after typecheck, Tsickle does not know about them,
          // and omits them when expanding `export *`.
          // So we have to keep reexporting these symbols manually via .ngfactory files.
          this.reexportedBy.set(declarationSymbol, summary.symbol);
        }
      }
    }
    if (!unprocessedSummary.type && summary.type) {
      unprocessedSummary.type = summary.type;
      // Note: We don't add the summaries of all referenced symbols as for the ResolvedSymbols,
      // as the type summaries already contain the transitive data that they require
      // (in a minimal way).
      processedSummary.type = this.processValue(summary.type, SerializationFlags.None);
      // except for reexported directives / pipes, so we need to store
      // their summaries explicitly.
      if (summary.type.summaryKind === CompileSummaryKind.NgModule) {
        const ngModuleSummary = <CompileNgModuleSummary>summary.type;
        ngModuleSummary.exportedDirectives.concat(ngModuleSummary.exportedPipes).forEach((id) => {
          const symbol: StaticSymbol = id.reference;
          if (this.summaryResolver.isLibraryFile(symbol.filePath) &&
              !this.unprocessedSymbolSummariesBySymbol.has(symbol)) {
            const summary = this.summaryResolver.resolveSummary(symbol);
            if (summary) {
              this.addSummary(summary);
            }
          }
        });
      }
    }
  }

  /**
   * @param createExternalSymbolReexports Whether external static symbols should be re-exported.
   * This can be enabled if external symbols should be re-exported by the current module in
   * order to avoid dynamically generated module dependencies which can break strict dependency
   * enforcements (as in Google3). Read more here: https://github.com/angular/angular/issues/25644
   */
  serialize(createExternalSymbolReexports: boolean):
      {json: string, exportAs: {symbol: StaticSymbol, exportAs: string}[]} {
    const exportAs: {symbol: StaticSymbol, exportAs: string}[] = [];
    const json = JSON.stringify({
      moduleName: this.moduleName,
      summaries: this.processedSummaries,
      symbols: this.symbols.map((symbol, index) => {
        symbol.assertNoMembers();
        let importAs: string|number = undefined!;
        if (this.summaryResolver.isLibraryFile(symbol.filePath)) {
          const reexportSymbol = this.reexportedBy.get(symbol);
          if (reexportSymbol) {
            // In case the given external static symbol is already manually exported by the
            // user, we just proxy the external static symbol reference to the manual export.
            // This ensures that the AOT compiler imports the external symbol through the
            // user export and does not introduce another dependency which is not needed.
            importAs = this.indexBySymbol.get(reexportSymbol)!;
          } else if (createExternalSymbolReexports) {
            // In this case, the given external static symbol is *not* manually exported by
            // the user, and we manually create a re-export in the factory file so that we
            // don't introduce another module dependency. This is useful when running within
            // Bazel so that the AOT compiler does not introduce any module dependencies
            // which can break the strict dependency enforcement. (e.g. as in Google3)
            // Read more about this here: https://github.com/angular/angular/issues/25644
            const summary = this.unprocessedSymbolSummariesBySymbol.get(symbol);
            if (!summary || !summary.metadata || summary.metadata.__symbolic !== 'interface') {
              importAs = `${symbol.name}_${index}`;
              exportAs.push({symbol, exportAs: importAs});
            }
          }
        }
        return {
          __symbol: index,
          name: symbol.name,
          filePath: this.summaryResolver.toSummaryFileName(symbol.filePath, this.srcFileName),
          importAs: importAs
        };
      })
    });
    return {json, exportAs};
  }

  private processValue(value: any, flags: SerializationFlags): any {
    return visitValue(value, this, flags);
  }

  override visitOther(value: any, context: any): any {
    if (value instanceof StaticSymbol) {
      let baseSymbol = this.symbolResolver.getStaticSymbol(value.filePath, value.name);
      const index = this.visitStaticSymbol(baseSymbol, context);
      return {__symbol: index, members: value.members};
    }
  }

  /**
   * Strip line and character numbers from ngsummaries.
   * Emitting them causes white spaces changes to retrigger upstream
   * recompilations in bazel.
   * TODO: find out a way to have line and character numbers in errors without
   * excessive recompilation in bazel.
   */
  override visitStringMap(map: {[key: string]: any}, context: any): any {
    if (map['__symbolic'] === 'resolved') {
      return visitValue(map['symbol'], this, context);
    }
    if (map['__symbolic'] === 'error') {
      delete map['line'];
      delete map['character'];
    }
    return super.visitStringMap(map, context);
  }

  /**
   * Returns null if the options.resolveValue is true, and the summary for the symbol
   * resolved to a type or could not be resolved.
   */
  private visitStaticSymbol(baseSymbol: StaticSymbol, flags: SerializationFlags): number {
    let index: number|undefined|null = this.indexBySymbol.get(baseSymbol);
    let summary: Summary<StaticSymbol>|null = null;
    if (flags & SerializationFlags.ResolveValue &&
        this.summaryResolver.isLibraryFile(baseSymbol.filePath)) {
      if (this.unprocessedSymbolSummariesBySymbol.has(baseSymbol)) {
        // the summary for this symbol was already added
        // -> nothing to do.
        return index!;
      }
      summary = this.loadSummary(baseSymbol);
      if (summary && summary.metadata instanceof StaticSymbol) {
        // The summary is a reexport
        index = this.visitStaticSymbol(summary.metadata, flags);
        // reset the summary as it is just a reexport, so we don't want to store it.
        summary = null;
      }
    } else if (index != null) {
      // Note: == on purpose to compare with undefined!
      // No summary and the symbol is already added -> nothing to do.
      return index;
    }
    // Note: == on purpose to compare with undefined!
    if (index == null) {
      index = this.symbols.length;
      this.symbols.push(baseSymbol);
    }
    this.indexBySymbol.set(baseSymbol, index);
    if (summary) {
      this.addSummary(summary);
    }
    return index;
  }

  private loadSummary(symbol: StaticSymbol): Summary<StaticSymbol>|null {
    let summary = this.summaryResolver.resolveSummary(symbol);
    if (!summary) {
      // some symbols might originate from a plain typescript library
      // that just exported .d.ts and .metadata.json files, i.e. where no summary
      // files were created.
      const resolvedSymbol = this.symbolResolver.resolveSymbol(symbol);
      if (resolvedSymbol) {
        summary = {symbol: resolvedSymbol.symbol, metadata: resolvedSymbol.metadata};
      }
    }
    return summary;
  }
}

class ForJitSerializer {
  private data: Array<{
    summary: CompileTypeSummary,
    metadata: CompileNgModuleMetadata|CompileDirectiveMetadata|CompilePipeMetadata|
    CompileTypeMetadata|null,
    isLibrary: boolean
  }> = [];

  constructor(
      private outputCtx: OutputContext, private symbolResolver: StaticSymbolResolver,
      private summaryResolver: SummaryResolver<StaticSymbol>) {}

  addSourceType(
      summary: CompileTypeSummary,
      metadata: CompileNgModuleMetadata|CompileDirectiveMetadata|CompilePipeMetadata|
      CompileTypeMetadata) {
    this.data.push({summary, metadata, isLibrary: false});
  }

  addLibType(summary: CompileTypeSummary) {
    this.data.push({summary, metadata: null, isLibrary: true});
  }

  serialize(exportAsArr: {symbol: StaticSymbol, exportAs: string}[]): void {
    const exportAsBySymbol = new Map<StaticSymbol, string>();
    for (const {symbol, exportAs} of exportAsArr) {
      exportAsBySymbol.set(symbol, exportAs);
    }
    const ngModuleSymbols = new Set<StaticSymbol>();

    for (const {summary, metadata, isLibrary} of this.data) {
      if (summary.summaryKind === CompileSummaryKind.NgModule) {
        // collect the symbols that refer to NgModule classes.
        // Note: we can't just rely on `summary.type.summaryKind` to determine this as
        // we don't add the summaries of all referenced symbols when we serialize type summaries.
        // See serializeSummaries for details.
        ngModuleSymbols.add(summary.type.reference);
        const modSummary = <CompileNgModuleSummary>summary;
        for (const mod of modSummary.modules) {
          ngModuleSymbols.add(mod.reference);
        }
      }
      if (!isLibrary) {
        const fnName = summaryForJitName(summary.type.reference.name);
        createSummaryForJitFunction(
            this.outputCtx, summary.type.reference,
            this.serializeSummaryWithDeps(summary, metadata!));
      }
    }

    ngModuleSymbols.forEach((ngModuleSymbol) => {
      if (this.summaryResolver.isLibraryFile(ngModuleSymbol.filePath)) {
        let exportAs = exportAsBySymbol.get(ngModuleSymbol) || ngModuleSymbol.name;
        const jitExportAsName = summaryForJitName(exportAs);
        this.outputCtx.statements.push(o.variable(jitExportAsName)
                                           .set(this.serializeSummaryRef(ngModuleSymbol))
                                           .toDeclStmt(null, [o.StmtModifier.Exported]));
      }
    });
  }

  private serializeSummaryWithDeps(
      summary: CompileTypeSummary,
      metadata: CompileNgModuleMetadata|CompileDirectiveMetadata|CompilePipeMetadata|
      CompileTypeMetadata): o.Expression {
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
          summaryKind: CompileSummaryKind.Injectable,
          type: provider.useClass
        } as CompileTypeSummary)));
    return o.literalArr(expressions);
  }

  private serializeSummaryRef(typeSymbol: StaticSymbol): o.Expression {
    const jitImportedSymbol = this.symbolResolver.getStaticSymbol(
        summaryForJitFileName(typeSymbol.filePath), summaryForJitName(typeSymbol.name));
    return this.outputCtx.importExpr(jitImportedSymbol);
  }

  private serializeSummary(data: {[key: string]: any}): o.Expression {
    const outputCtx = this.outputCtx;

    class Transformer implements ValueVisitor {
      visitArray(arr: any[], context: any): any {
        return o.literalArr(arr.map(entry => visitValue(entry, this, context)));
      }
      visitStringMap(map: {[key: string]: any}, context: any): any {
        return new o.LiteralMapExpr(Object.keys(map).map(
            (key) => new o.LiteralMapEntry(key, visitValue(map[key], this, context), false)));
      }
      visitPrimitive(value: any, context: any): any {
        return o.literal(value);
      }
      visitOther(value: any, context: any): any {
        if (value instanceof StaticSymbol) {
          return outputCtx.importExpr(value);
        } else {
          throw new Error(`Illegal State: Encountered value ${value}`);
        }
      }
    }

    return visitValue(data, new Transformer(), null);
  }
}

class FromJsonDeserializer extends ValueTransformer {
  // TODO(issue/24571): remove '!'.
  private symbols!: StaticSymbol[];

  constructor(
      private symbolCache: StaticSymbolCache,
      private summaryResolver: SummaryResolver<StaticSymbol>) {
    super();
  }

  deserialize(libraryFileName: string, json: string): {
    moduleName: string|null,
    summaries: Summary<StaticSymbol>[],
    importAs: {symbol: StaticSymbol, importAs: StaticSymbol}[]
  } {
    const data = JSON.parse(json) as {moduleName: string | null, summaries: any[], symbols: any[]};
    const allImportAs: {symbol: StaticSymbol, importAs: StaticSymbol}[] = [];
    this.symbols = data.symbols.map(
        (serializedSymbol) => this.symbolCache.get(
            this.summaryResolver.fromSummaryFileName(serializedSymbol.filePath, libraryFileName),
            serializedSymbol.name));
    data.symbols.forEach((serializedSymbol, index) => {
      const symbol = this.symbols[index];
      const importAs = serializedSymbol.importAs;
      if (typeof importAs === 'number') {
        allImportAs.push({symbol, importAs: this.symbols[importAs]});
      } else if (typeof importAs === 'string') {
        allImportAs.push(
            {symbol, importAs: this.symbolCache.get(ngfactoryFilePath(libraryFileName), importAs)});
      }
    });
    const summaries = visitValue(data.summaries, this, null) as Summary<StaticSymbol>[];
    return {moduleName: data.moduleName, summaries, importAs: allImportAs};
  }

  override visitStringMap(map: {[key: string]: any}, context: any): any {
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

function isCall(metadata: any): boolean {
  return metadata && metadata.__symbolic === 'call';
}

function isFunctionCall(metadata: any): boolean {
  return isCall(metadata) && unwrapResolvedMetadata(metadata.expression) instanceof StaticSymbol;
}

function isMethodCallOnVariable(metadata: any): boolean {
  return isCall(metadata) && metadata.expression && metadata.expression.__symbolic === 'select' &&
      unwrapResolvedMetadata(metadata.expression.expression) instanceof StaticSymbol;
}
