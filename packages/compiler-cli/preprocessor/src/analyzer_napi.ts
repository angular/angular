/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type * as nga from './types.js';
import type {IAnalyzer} from './hybrid_compiler.js';

export class NapiAnalyzer implements IAnalyzer {
  private analyzer: nga.Analyzer | nga.TestAnalyzer;

  constructor(analyzer: nga.Analyzer | nga.TestAnalyzer) {
    this.analyzer = analyzer;
  }

  /**
   * Creates an analyzer, resolving whichever engine is available.
   *
   * Retained for compatibility; prefer `loadAnalyzer` from `./analyzer_loader.js`,
   * whose options are richer and whose return type reflects that the result may be
   * wasm-backed rather than N-API-backed.
   *
   * The loader is reached through a dynamic `import()` so that merely importing this
   * module does not pull engine resolution into module evaluation.
   */
  public static async create(
    tsconfigPath: string,
    options: import('./analyzer_loader.js').LoadAnalyzerOptions = {},
  ): Promise<IAnalyzer> {
    const {loadAnalyzer} = await import('./analyzer_loader.js');
    return loadAnalyzer(tsconfigPath, options);
  }

  private async *consumeIterator(iterator: {
    next(): Promise<nga.CompilationChunk | null | undefined>;
  }): AsyncGenerator<nga.CompilationChunk, void, unknown> {
    while (true) {
      const res = await iterator.next();
      if (res === null || res === undefined) {
        break;
      }
      yield res;
    }
  }

  analyze(): AsyncGenerator<nga.CompilationChunk, void, unknown> {
    return this.consumeIterator(this.analyzer.analyze());
  }

  analyzeOptimized(): AsyncGenerator<nga.CompilationChunk, void, unknown> {
    return this.consumeIterator(this.analyzer.analyzeOptimized());
  }

  analyzeDelta(): AsyncGenerator<nga.CompilationChunk, void, unknown> {
    return this.consumeIterator(this.analyzer.analyzeDelta());
  }

  analyzeOptimizedDelta(): AsyncGenerator<nga.CompilationChunk, void, unknown> {
    return this.consumeIterator(this.analyzer.analyzeOptimizedDelta());
  }

  async getMetadataForFile(filePath: string): Promise<nga.AnalysisResult | null> {
    return this.analyzer.getMetadataForFile(filePath) ?? null;
  }

  async updateFileContent(updates: {filePath: string; content: string}[]): Promise<string[]> {
    return this.analyzer.updateFileContent(updates);
  }

  async invalidateFiles(updates: nga.FileInvalidation[]): Promise<string[]> {
    return this.analyzer.invalidateFiles(updates);
  }

  async getTsFileForTemplate(templatePath: string): Promise<nga.TemplateUsage[] | null> {
    return this.analyzer.getTsFileForTemplate(templatePath);
  }

  async getFileContent(filePath: string): Promise<string> {
    return this.analyzer.getFileContent(filePath);
  }

  getMetadataForFileSync(filePath: string): nga.AnalysisResult | null {
    return this.analyzer.getMetadataForFile(filePath) ?? null;
  }

  getFileContentSync(filePath: string): string {
    return this.analyzer.getFileContent(filePath);
  }

  getTsFileForTemplateSync(templatePath: string): nga.TemplateUsage[] | null {
    return this.analyzer.getTsFileForTemplate(templatePath);
  }

  close(): void {}
}
