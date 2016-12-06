/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileSummaryKind, CompileTypeSummary} from '../compile_metadata';
import {Summary, SummaryResolver} from '../summary_resolver';

import {StaticSymbol, StaticSymbolCache} from './static_symbol';
import {ResolvedStaticSymbol} from './static_symbol_resolver';
import {deserializeSummaries, summaryFileName} from './summary_serializer';

const STRIP_SRC_FILE_SUFFIXES = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;

export interface AotSummaryResolverHost {
  /**
   * Loads an NgModule/Directive/Pipe summary file
   */
  loadSummary(filePath: string): string /*|null*/;

  /**
   * Returns whether a file is a source file or not.
   */
  isSourceFile(sourceFilePath: string): boolean;
}

export class AotSummaryResolver implements SummaryResolver<StaticSymbol> {
  private summaryCache = new Map<StaticSymbol, Summary<StaticSymbol>>();
  private loadedFilePaths = new Set<string>();

  constructor(private host: AotSummaryResolverHost, private staticSymbolCache: StaticSymbolCache) {}

  private _assertNoMembers(symbol: StaticSymbol) {
    if (symbol.members.length) {
      throw new Error(
          `Internal state: StaticSymbols in summaries can't have members! ${JSON.stringify(symbol)}`);
    }
  }

  resolveSummary(staticSymbol: StaticSymbol): Summary<StaticSymbol> {
    this._assertNoMembers(staticSymbol);
    let summary = this.summaryCache.get(staticSymbol);
    if (!summary) {
      this._loadSummaryFile(staticSymbol.filePath);
      summary = this.summaryCache.get(staticSymbol);
    }
    return summary;
  }

  getSymbolsOf(filePath: string): StaticSymbol[] {
    this._loadSummaryFile(filePath);
    return Array.from(this.summaryCache.keys()).filter((symbol) => symbol.filePath === filePath);
  }

  private _loadSummaryFile(filePath: string) {
    if (this.loadedFilePaths.has(filePath)) {
      return;
    }
    this.loadedFilePaths.add(filePath);
    if (!this.host.isSourceFile(filePath)) {
      const summaryFilePath = summaryFileName(filePath);
      let json: string;
      try {
        json = this.host.loadSummary(summaryFilePath);
      } catch (e) {
        console.error(`Error loading summary file ${summaryFilePath}`);
        throw e;
      }
      if (json) {
        const readSummaries = deserializeSummaries(this.staticSymbolCache, json);
        readSummaries.forEach((summary) => { this.summaryCache.set(summary.symbol, summary); });
      }
    }
  }
}
