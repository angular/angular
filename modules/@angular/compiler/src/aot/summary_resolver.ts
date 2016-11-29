/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileIdentifierMetadata, CompileTypeMetadata, CompileTypeSummary, identifierModuleUrl, identifierName} from '../compile_metadata';
import {SummaryResolver} from '../summary_resolver';

import {GeneratedFile} from './generated_file';
import {StaticReflector} from './static_reflector';
import {StaticSymbol, isStaticSymbol} from './static_symbol';
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
  private summaryCache: {[srcFilePath: string]: CompileTypeSummary[]} = {};

  constructor(
      private host: AotSummaryResolverHost, private staticReflector: StaticReflector,
      private options: AotSummaryResolverOptions) {}

  serializeSummaries(srcFileUrl: string, summaries: CompileTypeSummary[]): GeneratedFile {
    const jsonReplacer = (key: string, value: any) => {
      if (key === 'reference' && isStaticSymbol(value)) {
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

    return new GeneratedFile(
        srcFileUrl, summaryFileName(srcFileUrl), JSON.stringify(summaries, jsonReplacer));
  }

  resolveSummary(staticSymbol: StaticSymbol): any {
    const filePath = staticSymbol.filePath;
    const name = staticSymbol.name;
    if (!filterFileByPatterns(filePath, this.options)) {
      let summaries = this.summaryCache[filePath];
      const summaryFilePath = summaryFileName(filePath);
      if (!summaries) {
        try {
          const jsonReviver = (key: string, value: any) => {
            if (key === 'reference' && value && value['__symbolic__'] === 'symbol') {
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
          summaries = JSON.parse(this.host.loadSummary(summaryFilePath), jsonReviver);
        } catch (e) {
          console.error(`Error loading summary file ${summaryFilePath}`);
          throw e;
        }
        this.summaryCache[filePath] = summaries;
      }
      const result = summaries.find((summary) => summary.type.reference === staticSymbol);
      if (!result) {
        throw new Error(
            `Could not find the symbol ${name} in the summary file ${summaryFilePath}!`);
      }
      return result;
    } else {
      return null;
    }
  }
}

function summaryFileName(fileName: string): string {
  const fileNameWithoutSuffix = fileName.replace(STRIP_SRC_FILE_SUFFIXES, '');
  return `${fileNameWithoutSuffix}.ngsummary.json`;
}
