/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Summary, SummaryResolver} from '../summary_resolver';

import {StaticSymbol, StaticSymbolCache} from './static_symbol';
import {deserializeSummaries} from './summary_serializer';
import {stripGeneratedFileSuffix, summaryFileName} from './util';

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
   * Converts a file name into a representation that should be stored in a summary file.
   * This has to include changing the suffix as well.
   * E.g.
   * `some_file.ts` -> `some_file.d.ts`
   *
   * @param referringSrcFileName the soure file that refers to fileName
   */
  toSummaryFileName(fileName: string, referringSrcFileName: string): string;

  /**
   * Converts a fileName that was processed by `toSummaryFileName` back into a real fileName
   * given the fileName of the library that is referrig to it.
   */
  fromSummaryFileName(fileName: string, referringLibFileName: string): string;
}

export class AotSummaryResolver implements SummaryResolver<StaticSymbol> {
  // Note: this will only contain StaticSymbols without members!
  private summaryCache = new Map<StaticSymbol, Summary<StaticSymbol>>();
  private loadedFilePaths = new Map<string, boolean>();
  // Note: this will only contain StaticSymbols without members!
  private importAs = new Map<StaticSymbol, StaticSymbol>();
  private knownFileNameToModuleNames = new Map<string, string>();

  constructor(private host: AotSummaryResolverHost, private staticSymbolCache: StaticSymbolCache) {}

  isLibraryFile(filePath: string): boolean {
    // Note: We need to strip the .ngfactory. file path,
    // so this method also works for generated files
    // (for which host.isSourceFile will always return false).
    return !this.host.isSourceFile(stripGeneratedFileSuffix(filePath));
  }

  toSummaryFileName(filePath: string, referringSrcFileName: string) {
    return this.host.toSummaryFileName(filePath, referringSrcFileName);
  }

  fromSummaryFileName(fileName: string, referringLibFileName: string) {
    return this.host.fromSummaryFileName(fileName, referringLibFileName);
  }

  resolveSummary(staticSymbol: StaticSymbol): Summary<StaticSymbol>|null {
    const rootSymbol = staticSymbol.members.length ?
        this.staticSymbolCache.get(staticSymbol.filePath, staticSymbol.name) :
        staticSymbol;
    let summary = this.summaryCache.get(rootSymbol);
    if (!summary) {
      this._loadSummaryFile(staticSymbol.filePath);
      summary = this.summaryCache.get(staticSymbol)!;
    }
    return (rootSymbol === staticSymbol && summary) || null;
  }

  getSymbolsOf(filePath: string): StaticSymbol[]|null {
    if (this._loadSummaryFile(filePath)) {
      return Array.from(this.summaryCache.keys()).filter((symbol) => symbol.filePath === filePath);
    }
    return null;
  }

  getImportAs(staticSymbol: StaticSymbol): StaticSymbol {
    staticSymbol.assertNoMembers();
    return this.importAs.get(staticSymbol)!;
  }

  /**
   * Converts a file path to a module name that can be used as an `import`.
   */
  getKnownModuleName(importedFilePath: string): string|null {
    return this.knownFileNameToModuleNames.get(importedFilePath) || null;
  }

  addSummary(summary: Summary<StaticSymbol>) {
    this.summaryCache.set(summary.symbol, summary);
  }

  private _loadSummaryFile(filePath: string): boolean {
    let hasSummary = this.loadedFilePaths.get(filePath);
    if (hasSummary != null) {
      return hasSummary;
    }
    let json: string|null = null;
    if (this.isLibraryFile(filePath)) {
      const summaryFilePath = summaryFileName(filePath);
      try {
        json = this.host.loadSummary(summaryFilePath);
      } catch (e) {
        console.error(`Error loading summary file ${summaryFilePath}`);
        throw e;
      }
    }
    hasSummary = json != null;
    this.loadedFilePaths.set(filePath, hasSummary);
    if (json) {
      const {moduleName, summaries, importAs} =
          deserializeSummaries(this.staticSymbolCache, this, filePath, json);
      summaries.forEach((summary) => this.summaryCache.set(summary.symbol, summary));
      if (moduleName) {
        this.knownFileNameToModuleNames.set(filePath, moduleName);
      }
      importAs.forEach((importAs) => {
        this.importAs.set(importAs.symbol, importAs.importAs);
      });
    }
    return hasSummary;
  }
}
