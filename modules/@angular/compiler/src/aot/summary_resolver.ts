/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileDirectiveSummary, CompileIdentifierMetadata, CompileNgModuleSummary, CompilePipeSummary, CompileSummaryKind, CompileTypeMetadata, CompileTypeSummary, identifierModuleUrl, identifierName} from '../compile_metadata';
import {SummaryResolver} from '../summary_resolver';

import {GeneratedFile} from './generated_file';
import {StaticReflector} from './static_reflector';
import {StaticSymbol} from './static_symbol';
import {filterFileByPatterns} from './utils';

const STRIP_SRC_FILE_SUFFIXES = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;

export interface AotSummaryResolverHost {
  /**
   * Loads an NgModule/Directive/Pipe summary file
   */
  loadSummary(filePath: string): string;

  /**
   * Returns the output file path of a source file.
   * E.g.
   * `some_file.ts` -> `some_file.d.ts`
   */
  getOutputFileName(sourceFilePath: string): string;
}

export interface AotSummaryResolverOptions {
  includeFilePattern?: RegExp;
  excludeFilePattern?: RegExp;
}

export class AotSummaryResolver implements SummaryResolver {
  private summaryCache: {[cacheKey: string]: CompileTypeSummary} = {};

  constructor(
      private host: AotSummaryResolverHost, private staticReflector: StaticReflector,
      private options: AotSummaryResolverOptions) {}

  serializeSummaries(srcFileUrl: string, summaries: CompileTypeSummary[]): GeneratedFile {
    const jsonReplacer = (key: string, value: any) => {
      if (value instanceof StaticSymbol) {
        // We convert the source filenames into output filenames,
        // as the generated summary file will be used when the current
        // compilation unit is used as a library
        return {
          '__symbolic__': 'symbol',
          'name': value.name,
          'path': this.host.getOutputFileName(value.filePath),
          'members': value.members
        };
      }
      return value;
    };
    const allSummaries = summaries.slice();
    summaries.forEach((summary) => {
      if (summary.summaryKind === CompileSummaryKind.NgModule) {
        const moduleMeta = <CompileNgModuleSummary>summary;
        moduleMeta.exportedDirectives.concat(moduleMeta.exportedPipes).forEach((id) => {
          if (!filterFileByPatterns(id.reference.filePath, this.options)) {
            allSummaries.push(this.resolveSummary(id.reference));
          }
        });
      }
    });

    return new GeneratedFile(
        srcFileUrl, summaryFileName(srcFileUrl), JSON.stringify(allSummaries, jsonReplacer));
  }

  private _cacheKey(symbol: StaticSymbol) { return `${symbol.filePath}|${symbol.name}`; }

  resolveSummary(staticSymbol: StaticSymbol): any {
    const filePath = staticSymbol.filePath;
    const name = staticSymbol.name;
    const cacheKey = this._cacheKey(staticSymbol);
    if (!filterFileByPatterns(filePath, this.options)) {
      let summary = this.summaryCache[cacheKey];
      const summaryFilePath = summaryFileName(filePath);
      if (!summary) {
        try {
          const jsonReviver = (key: string, value: any) => {
            if (value && value['__symbolic__'] === 'symbol') {
              // Note: We can't use staticReflector.findDeclaration here:
              // Summary files can contain symbols of transitive compilation units
              // (via the providers), and findDeclaration needs .metadata.json / .d.ts files,
              // but we don't want to depend on these for transitive dependencies.
              return this.staticReflector.getStaticSymbol(
                  value['path'], value['name'], value['members']);
            } else {
              return value;
            }
          };
          const readSummaries: CompileTypeSummary[] =
              JSON.parse(this.host.loadSummary(summaryFilePath), jsonReviver);
          readSummaries.forEach((summary) => {
            const filePath = summary.type.reference.filePath;
            this.summaryCache[this._cacheKey(summary.type.reference)] = summary;
          });
          summary = this.summaryCache[cacheKey];
        } catch (e) {
          console.error(`Error loading summary file ${summaryFilePath}`);
          throw e;
        }
      }
      if (!summary) {
        throw new Error(
            `Could not find the symbol ${name} in the summary file ${summaryFilePath}!`);
      }
      return summary;
    } else {
      return null;
    }
  }
}

function summaryFileName(fileName: string): string {
  const fileNameWithoutSuffix = fileName.replace(STRIP_SRC_FILE_SUFFIXES, '');
  return `${fileNameWithoutSuffix}.ngsummary.json`;
}
