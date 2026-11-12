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
  type FileUpdate,
  type ModuleRef,
  type ResolvedResource,
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

  // Optional engine capabilities a test may opt into.
  canonicalPaths?: IAnalyzer['canonicalPaths'];
  clearResolutionCache?: IAnalyzer['clearResolutionCache'];

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

  async updateFileContent(updates: FileUpdate[]): Promise<string[]> {
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

  async setEntryPoints(entryPoints: ModuleRef[]): Promise<string[]> {
    this.calls.push(
      `setEntryPoints(${entryPoints.map((e) => (typeof e === 'string' ? e : e.id)).join(',')})`,
    );
    return [];
  }

  async getMetadataForFile(file: ModuleRef): Promise<AnalysisResult | null> {
    return null;
  }
  async getTsFileForTemplate(templatePath: string): Promise<TemplateUsage[] | null> {
    return null;
  }
  async getFileContent(filePath: string): Promise<string> {
    return '';
  }
  async readResource(containingFile: string, url: string): Promise<ResolvedResource | null> {
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

    it('records changes under the paths results carry', async () => {
      // The host reports paths through a symlinked directory; results use the resolved one.
      const canonicalize = (paths: string[]) => paths.map((p) => p.replace('/link/', '/real/'));
      const analyzer = new ScriptedAnalyzer();
      analyzer.canonicalPaths = async (paths) => canonicalize(paths);
      const compiler = new HybridCompiler(analyzer, {optimize});
      const recordChanges = spyOn(compiler.incremental, 'recordChanges').and.callThrough();

      await compiler.updateFileContent([{filePath: '/link/a.ts', content: 'next'}]);
      await compiler.invalidateFiles([
        {filePath: '/link/b.html', updateType: FileUpdateType.Changed},
        {filePath: '/link/c.ts', updateType: FileUpdateType.Deleted},
      ]);

      expect(recordChanges.calls.allArgs()).toEqual([
        [['/real/a.ts'], []],
        [['/real/b.html'], ['/real/c.ts']],
      ]);
    });

    it('queues clearResolutionCache, evicts stale file caches, and records incremental changes', async () => {
      const analyzer = new ScriptedAnalyzer();
      analyzer.clearResolutionCache = async () => {
        analyzer.calls.push('clearResolutionCache');
        return ['/app/a.ts', '/node_modules/lib/index.d.ts'];
      };
      const compiler = new HybridCompiler(analyzer, {optimize});
      const recordChanges = spyOn(compiler.incremental, 'recordChanges').and.callThrough();
      getOrCreateFileAnalysis(compiler.fileCache, '/app/a.ts');
      getOrCreateFileAnalysis(compiler.fileCache, '/node_modules/lib/index.d.ts');
      getOrCreateFileAnalysis(compiler.fileCache, '/app/keep.ts');

      await compiler.clearResolutionCache();

      expect(analyzer.calls).toEqual(['clearResolutionCache', deltaCall]);
      expect([...compiler.fileCache.keys()]).toEqual(['/app/keep.ts']);
      // An evicted declaration file did not change, so it is not recorded as one: that would
      // make the next build re-emit every file.
      expect(recordChanges.calls.allArgs()).toEqual([[['/app/a.ts'], []]]);
    });

    it('records no incremental change when clearResolutionCache only evicts declaration files', async () => {
      const analyzer = new ScriptedAnalyzer();
      analyzer.clearResolutionCache = async () => ['/node_modules/lib/index.d.ts'];
      const compiler = new HybridCompiler(analyzer, {optimize});
      const recordChanges = spyOn(compiler.incremental, 'recordChanges').and.callThrough();

      await compiler.clearResolutionCache();

      expect(recordChanges).not.toHaveBeenCalled();
    });

    it('queues setEntryPoints, evicts stale file caches, and records incremental changes', async () => {
      const analyzer = new ScriptedAnalyzer();
      const received: ModuleRef[][] = [];
      analyzer.setEntryPoints = async (entryPoints) => {
        analyzer.calls.push('setEntryPoints');
        received.push(entryPoints);
        return ['/app/a.ts', 'virtual:entry'];
      };
      const compiler = new HybridCompiler(analyzer, {optimize});
      const recordChanges = spyOn(compiler.incremental, 'recordChanges').and.callThrough();
      getOrCreateFileAnalysis(compiler.fileCache, '/app/a.ts');
      getOrCreateFileAnalysis(compiler.fileCache, 'virtual:entry');
      getOrCreateFileAnalysis(compiler.fileCache, '/app/keep.ts');

      const entryPoints: ModuleRef[] = ['/app/a.ts', {id: 'virtual:entry', idKind: 'virtual'}];
      await compiler.setEntryPoints(entryPoints);

      expect(received).toEqual([entryPoints]);
      expect(analyzer.calls).toEqual(['setEntryPoints', deltaCall]);
      expect([...compiler.fileCache.keys()]).toEqual(['/app/keep.ts']);
      expect(recordChanges.calls.allArgs()).toEqual([[['/app/a.ts', 'virtual:entry'], []]]);
    });

    it('records no incremental change when setEntryPoints evicts nothing', async () => {
      const analyzer = new ScriptedAnalyzer();
      const compiler = new HybridCompiler(analyzer, {optimize});
      const recordChanges = spyOn(compiler.incremental, 'recordChanges').and.callThrough();

      await compiler.setEntryPoints(['/app/main.ts']);

      expect(analyzer.calls).toEqual(['setEntryPoints(/app/main.ts)', deltaCall]);
      expect(recordChanges).not.toHaveBeenCalled();
    });

    it('forwards idKind and records a virtual ID as the host reported it', async () => {
      // An opaque ID is not a path, so the engine's canonical form of the string is not used.
      const analyzer = new ScriptedAnalyzer();
      analyzer.canonicalPaths = async (paths) => paths.map((p) => p.replace('/link/', '/real/'));
      const updateFileContent = spyOn(analyzer, 'updateFileContent').and.callThrough();
      const invalidateFiles = spyOn(analyzer, 'invalidateFiles').and.callThrough();
      const compiler = new HybridCompiler(analyzer, {optimize});
      const recordChanges = spyOn(compiler.incremental, 'recordChanges').and.callThrough();

      const update: FileUpdate = {filePath: 'virtual:/link/a', content: 'next', idKind: 'virtual'};
      const invalidations: FileInvalidation[] = [
        {filePath: 'virtual:/link/b', updateType: FileUpdateType.Changed, idKind: 'virtual'},
        {filePath: '/link/c.ts', updateType: FileUpdateType.Changed},
      ];
      await compiler.updateFileContent([update]);
      await compiler.invalidateFiles(invalidations);

      expect(updateFileContent).toHaveBeenCalledOnceWith([update]);
      expect(invalidateFiles).toHaveBeenCalledOnceWith(invalidations);
      expect(recordChanges.calls.allArgs()).toEqual([
        [['virtual:/link/a'], []],
        [['virtual:/link/b', '/real/c.ts'], []],
      ]);
    });

    it('re-streams every known file for an unknown path resource but not for a virtual ID', async () => {
      const analyzer = new ScriptedAnalyzer();
      const fullChunks = async function* (): AsyncGenerator<CompilationChunk> {
        yield {files: [resultFor('/app/a.ts'), resultFor('/app/b.ts')]};
      };
      analyzer.analyze = fullChunks;
      analyzer.analyzeOptimized = fullChunks;
      const compiler = new HybridCompiler(analyzer, {optimize});
      for await (const _chunk of optimize ? compiler.analyzeOptimized() : compiler.analyze()) {
        // Record the files of the program.
      }

      const restreamedAfter = async (update: FileInvalidation): Promise<string[]> => {
        await compiler.invalidateFiles([update]);
        const delta = optimize ? compiler.analyzeOptimizedDelta() : compiler.analyzeDelta();
        const files: string[] = [];
        for await (const chunk of delta) {
          files.push(...chunk.files.map((file) => file.filePath));
        }
        return files;
      };

      // Unlike an unknown path resource, a virtual ID does not make every known file reprocess.
      expect(
        await restreamedAfter({
          filePath: 'virtual:theme',
          updateType: FileUpdateType.Changed,
          idKind: 'virtual',
        }),
      ).toEqual([]);
      expect(
        await restreamedAfter({filePath: '/app/theme.css', updateType: FileUpdateType.Changed}),
      ).toEqual(['/app/a.ts', '/app/b.ts']);
    });
  });
}
