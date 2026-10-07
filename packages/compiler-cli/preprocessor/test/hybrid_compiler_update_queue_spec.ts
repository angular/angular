/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HybridCompiler, type IAnalyzer} from '../src/hybrid_compiler.js';
import {getOrCreateFileAnalysis} from '../src/file_analysis.js';
import {
  FileUpdateType,
  type AnalysisResult,
  type CompilationChunk,
  type FileInvalidation,
  type TemplateUsage,
} from '../src/types.js';

function resultFor(filePath: string): AnalysisResult {
  return {
    fileId: 0,
    filePath,
    importsEnd: 0,
    classes: [],
    imports: [],
    typeOnlyExports: [],
    diagnostics: [],
    signalDebugNames: [],
  };
}

/**
 * An analyzer whose incremental entry points are scripted per call, so a test can make one
 * update fail (the way a delta surfaces an unrecoverable parse error, or a transport rejects
 * an invalidation) and observe what the compiler does with the updates that follow.
 */
class ScriptedAnalyzer implements IAnalyzer {
  /** Every call that reached the analyzer, in order. */
  readonly calls: string[] = [];
  /** Per-call behavior for the delta pass; calls past the end stream `deltaFiles` and succeed. */
  deltaScript: Array<{files: string[]; error?: Error}> = [];
  deltaFiles: string[] = [];
  /** Per-call rejection for `updateFileContent` / `invalidateFiles`; `undefined` succeeds. */
  updateErrors: Array<Error | undefined> = [];
  invalidateErrors: Array<Error | undefined> = [];

  private deltaCount = 0;
  private updateCount = 0;
  private invalidateCount = 0;

  async *analyze(): AsyncGenerator<CompilationChunk> {}
  async *analyzeOptimized(): AsyncGenerator<CompilationChunk> {}

  analyzeDelta(): AsyncIterable<CompilationChunk> {
    this.calls.push('analyzeDelta');
    return this.runDelta();
  }

  analyzeOptimizedDelta(): AsyncIterable<CompilationChunk> {
    this.calls.push('analyzeOptimizedDelta');
    return this.runDelta();
  }

  private async *runDelta(): AsyncGenerator<CompilationChunk> {
    const step = this.deltaScript[this.deltaCount++] ?? {files: this.deltaFiles};
    for (const filePath of step.files) {
      yield {files: [resultFor(filePath)]};
    }
    if (step.error) {
      throw step.error;
    }
  }

  async updateFileContent(updates: {filePath: string; content: string}[]): Promise<string[]> {
    this.calls.push(`updateFileContent(${updates.map((u) => u.content).join(',')})`);
    const error = this.updateErrors[this.updateCount++];
    if (error) {
      throw error;
    }
    return updates.map((u) => u.filePath);
  }

  async invalidateFiles(updates: FileInvalidation[]): Promise<string[]> {
    this.calls.push(`invalidateFiles(${updates.map((u) => u.filePath).join(',')})`);
    const error = this.invalidateErrors[this.invalidateCount++];
    if (error) {
      throw error;
    }
    return updates.map((u) => u.filePath);
  }

  async getMetadataForFile(filePath: string): Promise<AnalysisResult | null> {
    return null;
  }
  async getTsFileForTemplate(templatePath: string): Promise<TemplateUsage[] | null> {
    return null;
  }
  async getFileContent(filePath: string): Promise<string> {
    return '';
  }
  getMetadataForFileSync(filePath: string): AnalysisResult | null {
    return null;
  }
  getFileContentSync(filePath: string): string {
    return '';
  }
  getTsFileForTemplateSync(templatePath: string): TemplateUsage[] | null {
    return null;
  }
  close(): void {}
}

const syntaxError = () => new Error('Syntax errors in /app/a.ts: \nUnexpected token');

for (const {optimize} of [{optimize: true}, {optimize: false}]) {
  describe(`HybridCompiler update queue (optimize: ${optimize})`, () => {
    const deltaCall = optimize ? 'analyzeOptimizedDelta' : 'analyzeDelta';

    it('rejects a failed update to its caller but still runs the next update', async () => {
      const analyzer = new ScriptedAnalyzer();
      analyzer.deltaScript = [{files: [], error: syntaxError()}];
      const compiler = new HybridCompiler(analyzer, {optimize});

      let err: any;
      try {
        await compiler.updateFileContent([{filePath: '/app/a.ts', content: 'broken'}]);
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.message).toContain('Syntax errors in /app/a.ts');

      await compiler.updateFileContent([{filePath: '/app/a.ts', content: 'fixed'}]);
      await compiler.ensureReady();

      expect(analyzer.calls).toEqual([
        'updateFileContent(broken)',
        deltaCall,
        'updateFileContent(fixed)',
        deltaCall,
      ]);
    });

    it('keeps serializing updates queued behind one that fails', async () => {
      const analyzer = new ScriptedAnalyzer();
      analyzer.deltaScript = [{files: [], error: syntaxError()}];
      const compiler = new HybridCompiler(analyzer, {optimize});

      const first = compiler.updateFileContent([{filePath: '/app/a.ts', content: 'broken'}]);
      const second = compiler.updateFileContent([{filePath: '/app/a.ts', content: 'fixed'}]);
      const ready = compiler.ensureReady();

      let err: any;
      try {
        await first;
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.message).toContain('Syntax errors in /app/a.ts');

      await second;
      await ready;

      expect(analyzer.calls).toEqual([
        'updateFileContent(broken)',
        deltaCall,
        'updateFileContent(fixed)',
        deltaCall,
      ]);
    });

    it('still runs later updates after invalidateFiles is rejected', async () => {
      const analyzer = new ScriptedAnalyzer();
      analyzer.invalidateErrors = [new Error('WasmInner does not support invalidateFiles')];
      const compiler = new HybridCompiler(analyzer, {optimize});

      let err: any;
      try {
        await compiler.invalidateFiles([
          {filePath: '/app/a.ts', updateType: FileUpdateType.Changed},
        ]);
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.message).toContain('does not support invalidateFiles');

      await compiler.ensureReady();
      await compiler.updateFileContent([{filePath: '/app/a.ts', content: 'next'}]);
      await compiler.invalidateFiles([{filePath: '/app/b.ts', updateType: FileUpdateType.Deleted}]);

      expect(analyzer.calls).toEqual([
        'invalidateFiles(/app/a.ts)',
        'updateFileContent(next)',
        deltaCall,
        'invalidateFiles(/app/b.ts)',
        deltaCall,
      ]);
    });

    it('drops cached analyses the failed delta never got to stream', async () => {
      const analyzer = new ScriptedAnalyzer();
      analyzer.deltaScript = [{files: ['/app/a.ts'], error: syntaxError()}];
      const compiler = new HybridCompiler(analyzer, {optimize});
      for (const filePath of ['/app/a.ts', '/app/b.ts', '/app/c.ts']) {
        getOrCreateFileAnalysis(compiler.fileCache, filePath);
      }

      let err: any;
      try {
        await compiler.updateFileContent([{filePath: '/app/a.ts', content: 'broken'}]);
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.message).toContain('Syntax errors in /app/a.ts');

      expect([...compiler.fileCache.keys()]).toEqual([]);
    });

    it('drops cached analyses when the analyzer rejects the update itself', async () => {
      const analyzer = new ScriptedAnalyzer();
      analyzer.updateErrors = [new Error('sidecar transport closed')];
      const compiler = new HybridCompiler(analyzer, {optimize});
      for (const filePath of ['/app/a.ts', '/app/b.ts']) {
        getOrCreateFileAnalysis(compiler.fileCache, filePath);
      }

      let err: any;
      try {
        await compiler.updateFileContent([{filePath: '/app/a.ts', content: 'broken'}]);
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.message).toContain('sidecar transport closed');

      expect([...compiler.fileCache.keys()]).toEqual([]);
      expect(analyzer.calls).toEqual(['updateFileContent(broken)']);
    });

    it('skips getFileContent and sets preparedTcbData to null for non-components', async () => {
      const analyzer = new ScriptedAnalyzer();
      let getFileContentCalled = false;
      analyzer.getFileContent = async () => {
        getFileContentCalled = true;
        return 'export class MyService {}';
      };
      analyzer.getMetadataForFile = async (filePath: string) => {
        const res = resultFor(filePath);
        res.classes = [
          {
            className: 'MyService',
            span: {start: 0, end: 10},
          } as any,
        ];
        return res;
      };
      const compiler = new HybridCompiler(analyzer, {optimize});
      const analysis = await compiler.ensureBound('/app/service.ts');
      expect(analysis.preparedTcbData).toBeNull();
      expect(getFileContentCalled).toBe(false);
    });
  });
}
