/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as child_process from 'child_process';
import * as readline from 'readline';
import type {AnalysisResult, FileInvalidation, CompilationChunk, TemplateUsage} from './types.js';
import type {IAnalyzer} from './hybrid_compiler.js';

interface SidecarResponse {
  id: number;
  result?: any;
  error?: string;
}

export class SidecarAnalyzer implements IAnalyzer {
  private sidecarProcess: child_process.ChildProcess;
  private pendingRequests = new Map<
    number,
    {method: string; resolve: (val: any) => void; reject: (err: any) => void}
  >();
  private requestId = 0;
  private resultQueue: CompilationChunk[] = [];
  private nextResolve: ((val: CompilationChunk | null) => void) | null = null;
  private isAnalyzing = false;
  private activeError: Error | null = null;
  /**
   * Why the sidecar can no longer answer requests, once it has exited or failed to start. Set at
   * most once; from then on every request is rejected with it instead of being written to a pipe
   * nobody reads.
   */
  private terminationReason: string | null = null;

  constructor(sidecarPath: string) {
    this.sidecarProcess = child_process.spawn(sidecarPath);

    if (this.sidecarProcess.stdout) {
      const rl = readline.createInterface({
        input: this.sidecarProcess.stdout,
        crlfDelay: Infinity,
      });

      rl.on('line', (line: string) => {
        if (line.trim() === '') return;
        try {
          const parsed = JSON.parse(line) as Record<string, any>;
          if (parsed && typeof parsed === 'object') {
            if ('id' in parsed && parsed['id'] !== undefined && parsed['id'] !== null) {
              const req = this.pendingRequests.get(parsed['id'] as number);
              if (req) {
                if (parsed['error']) {
                  req.reject(new Error(parsed['error'] as string));
                } else {
                  req.resolve(parsed['result']);
                }
                this.pendingRequests.delete(parsed['id'] as number);
              }
            } else if (parsed['method'] === 'analysisResult') {
              this.handleAnalysisResult(parsed['params'] as CompilationChunk);
            } else if (parsed['method'] === 'analysisError') {
              this.handleAnalysisError(parsed['params'] as string);
            } else if (parsed['method'] === 'analysisComplete') {
              this.handleAnalysisComplete();
            }
          }
        } catch (e) {
          console.error(`Failed to parse sidecar output line: ${line}`);
        }
      });
    }

    this.sidecarProcess.stderr?.on('data', (data) => {
      console.error(`Sidecar error: ${data}`);
    });

    // A write racing the child's exit fails with EPIPE; without a listener that is an uncaught
    // exception in the host. The request it carried is settled when the process closes.
    this.sidecarProcess.stdin?.on('error', (err) => {
      console.error(`Sidecar stdin error: ${err.message}`);
    });

    this.sidecarProcess.on('error', (err) => {
      console.error(`Sidecar process error: ${err.message}`);
      // `error` is also emitted for a failed `kill()` of a live process, which can still answer.
      // Only a process that never started is known to be unable to.
      if (this.sidecarProcess.pid === undefined) {
        this.terminate(`Sidecar process failed to start (${err.message})`);
      }
    });

    this.sidecarProcess.on('exit', (code) => {
      // stderr, like the sibling handlers above: this module is library code that can run
      // inside a stdio-transport language server, where stdout carries the LSP framing.
      console.error(`Sidecar exited with code ${code}`);
      if (this.onExit) this.onExit();
    });

    // `close`, not `exit`: it fires only after stdout has ended, so every response the child wrote
    // before exiting has already been dispatched by the line reader above, and what is still
    // pending here is exactly what will never be answered.
    this.sidecarProcess.on('close', (code, signal) => {
      this.terminate(
        signal !== null
          ? `Sidecar process was killed by ${signal}`
          : `Sidecar process exited with code ${code}`,
      );
    });
  }

  /**
   * Settles everything still waiting on the sidecar once it can no longer respond: each pending
   * RPC is rejected, and an in-flight analysis stream fails as if the sidecar had reported an
   * `analysisError`. Only the first cause is recorded.
   */
  private terminate(reason: string): void {
    if (this.terminationReason !== null) {
      return;
    }
    this.terminationReason = reason;

    const pending = [...this.pendingRequests.values()];
    this.pendingRequests.clear();
    for (const {method, reject} of pending) {
      reject(new Error(`${reason} before responding to '${method}'`));
    }

    if (this.isAnalyzing) {
      this.handleAnalysisError(`${reason} during analysis`);
    }
  }

  private onExit?: () => void;

  public async wait(): Promise<void> {
    if (this.sidecarProcess.exitCode !== null) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.onExit = resolve;
    });
  }

  public close(): void {
    if (this.sidecarProcess.stdin) {
      this.sidecarProcess.stdin.end();
    }
  }

  private async callRpc<T = any>(method: string, params: any): Promise<T> {
    if (this.terminationReason !== null) {
      throw new Error(`${this.terminationReason}; cannot send '${method}'`);
    }
    if (!this.sidecarProcess.stdin) {
      throw new Error('Sidecar process not available for RPC');
    }
    const id = ++this.requestId;
    const request = {id, method, params};

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {method, resolve, reject});
      this.sidecarProcess.stdin!.write(JSON.stringify(request) + '\n');
    });
  }

  async initialize(
    tsconfigPath: string,
    optimize: boolean,
    virtualFiles?: Record<string, string>,
    nodeModulesPathOverride?: string,
    options?: {allowedSources?: string[]; workspaceName?: string; rootDirs?: string[]},
  ): Promise<void> {
    await this.callRpc('initialize', {
      tsconfigPath,
      optimize,
      virtualFiles,
      nodeModulesPathOverride,
      allowedSources: options?.allowedSources,
      workspaceName: options?.workspaceName,
      rootDirs: options?.rootDirs,
    });
  }

  private async *runAnalysisStream(
    method: 'analyze' | 'analyze_optimized' | 'analyze_delta' | 'analyze_optimized_delta',
  ): AsyncGenerator<CompilationChunk, void, unknown> {
    this.resultQueue = [];
    this.isAnalyzing = true;
    this.activeError = null;
    await this.callRpc(method, {});
    while (true) {
      const res = await this.next_internal();
      if (res === null || res === undefined) {
        break;
      }
      yield res;
    }
  }

  analyze(): AsyncGenerator<CompilationChunk, void, unknown> {
    return this.runAnalysisStream('analyze');
  }

  analyzeOptimized(): AsyncGenerator<CompilationChunk, void, unknown> {
    return this.runAnalysisStream('analyze_optimized');
  }

  analyzeDelta(): AsyncGenerator<CompilationChunk, void, unknown> {
    return this.runAnalysisStream('analyze_delta');
  }

  analyzeOptimizedDelta(): AsyncGenerator<CompilationChunk, void, unknown> {
    return this.runAnalysisStream('analyze_optimized_delta');
  }

  private async next_internal(): Promise<CompilationChunk | null> {
    if (this.activeError) {
      const err = this.activeError;
      this.activeError = null;
      throw err;
    }
    if (this.resultQueue.length > 0) {
      return this.resultQueue.shift()!;
    }
    if (!this.isAnalyzing) {
      return null;
    }
    return new Promise((resolve, reject) => {
      this.nextResolve = (chunk) => {
        if (this.activeError) {
          const err = this.activeError;
          this.activeError = null;
          reject(err);
        } else {
          resolve(chunk);
        }
      };
    });
  }

  private handleAnalysisResult(result: CompilationChunk) {
    if (this.nextResolve) {
      const resolve = this.nextResolve;
      this.nextResolve = null;
      resolve(result);
    } else {
      this.resultQueue.push(result);
    }
  }

  private handleAnalysisComplete() {
    this.isAnalyzing = false;
    if (this.nextResolve) {
      const resolve = this.nextResolve;
      this.nextResolve = null;
      resolve(null);
    }
  }

  private handleAnalysisError(errorStr: string) {
    this.isAnalyzing = false;
    this.activeError = new Error(errorStr);
    if (this.nextResolve) {
      const resolve = this.nextResolve;
      this.nextResolve = null;
      resolve(null);
    }
  }

  async getMetadataForFile(filePath: string): Promise<AnalysisResult | null> {
    return this.callRpc<AnalysisResult | null>('getMetadataForFile', {filePath});
  }

  async updateFileContent(updates: {filePath: string; content: string}[]): Promise<string[]> {
    return this.callRpc('updateFileContent', updates);
  }

  async invalidateFiles(updates: FileInvalidation[]): Promise<string[]> {
    return this.callRpc('invalidateFiles', updates);
  }

  async getTsFileForTemplate(templatePath: string): Promise<TemplateUsage[] | null> {
    return this.callRpc('getTsFileForTemplate', {templatePath});
  }

  async getFileContent(filePath: string): Promise<string> {
    return this.callRpc('getFileContent', {filePath});
  }

  getMetadataForFileSync(filePath: string): AnalysisResult | null {
    throw new Error('Synchronous AST lookups are not supported in Sidecar mode');
  }

  getFileContentSync(filePath: string): string {
    throw new Error('Synchronous AST lookups are not supported in Sidecar mode');
  }

  getTsFileForTemplateSync(templatePath: string): TemplateUsage[] | null {
    throw new Error('Synchronous AST lookups are not supported in Sidecar mode');
  }
}
