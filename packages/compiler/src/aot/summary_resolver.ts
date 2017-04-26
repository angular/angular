/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Summary, SummaryResolver} from '../summary_resolver';

import {StaticSymbol, StaticSymbolCache} from './static_symbol';
import {deserializeSummaries} from './summary_serializer';
import {ngfactoryFilePath, stripGeneratedFileSuffix, summaryFileName} from './util';

export interface AotSummaryResolverHost {
  /**
   * Loads an NgModule/Directive/Pipe summary file
   */
  loadSummary(filePath: string): string|null;

  /**
   * Returns whether a file is a source file or not.
   */
  isSourceFile(sourceFilePath: string): boolean;
  /**
   * Returns the output file path of a source file.
   * E.g.
   * `some_file.ts` -> `some_file.d.ts`
   */
  getOutputFileName(sourceFilePath: string): string;
}

export class AotSummaryResolver implements SummaryResolver<StaticSymbol> {
  // Note: this will only contain StaticSymbols without members!
  private summaryCache = new Map<StaticSymbol, Summary<StaticSymbol>>();
  private loadedFilePaths = new Set<string>();
  // Note: this will only contain StaticSymbols without members!
  private importAs = new Map<StaticSymbol, StaticSymbol>();

  constructor(private host: AotSummaryResolverHost, private staticSymbolCache: StaticSymbolCache) {}

  isLibraryFile(filePath: string): boolean {
    // Note: We need to strip the .ngfactory. file path,
    // so this method also works for generated files
    // (for which host.isSourceFile will always return false).
    return !this.host.isSourceFile(stripGeneratedFileSuffix(filePath));
  }

  getLibraryFileName(filePath: string) { return this.host.getOutputFileName(filePath); }

  resolveSummary(staticSymbol: StaticSymbol): Summary<StaticSymbol> {
    staticSymbol.assertNoMembers();
    let summary = this.summaryCache.get(staticSymbol);
    if (!summary) {
      this._loadSummaryFile(staticSymbol.filePath);
      summary = this.summaryCache.get(staticSymbol) !;
    }
    return summary;
  }

  getSymbolsOf(filePath: string): StaticSymbol[] {
    this._loadSummaryFile(filePath);
    return Array.from(this.summaryCache.keys()).filter((symbol) => symbol.filePath === filePath);
  }

  getImportAs(staticSymbol: StaticSymbol): StaticSymbol {
    staticSymbol.assertNoMembers();
    return this.importAs.get(staticSymbol) !;
  }

  addSummary(summary: Summary<StaticSymbol>) { this.summaryCache.set(summary.symbol, summary); }

  private _loadSummaryFile(filePath: string) {
    if (this.loadedFilePaths.has(filePath)) {
      return;
    }
    this.loadedFilePaths.add(filePath);
    if (this.isLibraryFile(filePath)) {
      const summaryFilePath = summaryFileName(filePath);
      let json: string|null;
      try {
        json = this.host.loadSummary(summaryFilePath);
      } catch (e) {
        console.error(`Error loading summary file ${summaryFilePath}`);
        throw e;
      }
      if (json) {
        const {summaries, importAs} = deserializeSummaries(this.staticSymbolCache, json);
        summaries.forEach((summary) => this.summaryCache.set(summary.symbol, summary));
        importAs.forEach((importAs) => {
          this.importAs.set(
              importAs.symbol,
              this.staticSymbolCache.get(ngfactoryFilePath(filePath), importAs.importAs));
        });
      }
    }
  }
}
