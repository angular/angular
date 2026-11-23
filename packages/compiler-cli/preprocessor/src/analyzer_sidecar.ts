/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as child_process from 'child_process';
import type {Readable} from 'stream';
import {
  FileUpdateType,
  type AnalysisResult,
  type AnalyzerOptions,
  type CompilationChunk,
  type FileInvalidation,
  type ResolvedResource,
  type TemplateUsage,
} from './types.js';
import type {NgpCompilerOptions} from './compiler_options.js';
import type {IAnalyzer} from './hybrid_compiler.js';
import {
  Counter,
  NOOP_TRACER,
  nowMicros,
  SpanKind,
  type AnalyzerPerfTake,
  type RustPerfTake,
  type Tracer,
} from './perf.js';

export class SidecarAnalyzer implements IAnalyzer {
  private sidecarProcess: child_process.ChildProcess;
  private compilerOptions: NgpCompilerOptions = {};
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

  constructor(
    sidecarPath: string,
    private tracer: Tracer = NOOP_TRACER,
  ) {
    this.sidecarProcess = tracer.slice(SpanKind.SpawnSidecar, () =>
      child_process.spawn(sidecarPath),
    );

    if (this.sidecarProcess.stdout) {
      this.readMessages(this.sidecarProcess.stdout);
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

  /**
   * Splits `stdout` into newline-delimited JSON-RPC messages and dispatches each one.
   *
   * Messages are framed strictly on `\n` (0x0A) bytes, as the sidecar writes them. Node's
   * `readline` is not usable here: it also treats U+2028 and U+2029 as line terminators, and
   * `serde_json` leaves those characters unescaped inside JSON strings (RFC 8259 permits it), so a
   * template containing one would be split into unparseable fragments. Splitting the raw bytes is
   * safe for UTF-8, where 0x0A never occurs inside a multi-byte sequence.
   */
  private readMessages(stdout: Readable): void {
    let partial: Buffer[] = [];
    stdout.on('data', (chunk: Buffer) => {
      let start = 0;
      let newline: number;
      while ((newline = chunk.indexOf(0x0a, start)) !== -1) {
        partial.push(chunk.subarray(start, newline));
        this.handleMessage(Buffer.concat(partial).toString('utf8'));
        partial = [];
        start = newline + 1;
      }
      if (start < chunk.length) {
        partial.push(chunk.subarray(start));
      }
    });
    stdout.on('end', () => {
      if (partial.length > 0) {
        this.handleMessage(Buffer.concat(partial).toString('utf8'));
        partial = [];
      }
    });
  }

  private handleMessage(line: string): void {
    if (this.terminationReason !== null || line.trim() === '') return;
    let parsed: unknown;
    const parseStartUs = this.tracer.enabled ? nowMicros() : 0;
    try {
      parsed = JSON.parse(line);
    } catch (e) {
      // Each message is one complete line, so one that does not parse means the channel can no
      // longer be trusted: it may have been an `analysisResult` (a dropped compilation chunk) or
      // the response to a pending request, which would otherwise never settle.
      console.error(`Failed to parse sidecar output line: ${line}`);
      this.terminate(`Sidecar emitted an unparseable message (${(e as Error).message})`);
      this.sidecarProcess.kill();
      return;
    }
    if (!parsed || typeof parsed !== 'object') {
      return;
    }
    const message = parsed as Record<string, any>;
    if (this.tracer.enabled && message['method'] === 'analysisResult') {
      // This runs while the driver waits in `AwaitAnalysis`, so it gets its own slice.
      this.tracer.record(SpanKind.ParseAnalysisResult, parseStartUs);
      this.tracer.count(Counter.AnalysisResultBytes, Buffer.byteLength(line));
    }
    if ('id' in message && message['id'] !== undefined && message['id'] !== null) {
      const req = this.pendingRequests.get(message['id'] as number);
      if (req) {
        if (message['error']) {
          req.reject(new Error(message['error'] as string));
        } else {
          req.resolve(message['result']);
        }
        this.pendingRequests.delete(message['id'] as number);
      }
    } else if (message['method'] === 'analysisResult') {
      this.handleAnalysisResult(message['params'] as CompilationChunk);
    } else if (message['method'] === 'analysisError') {
      this.handleAnalysisError(message['params'] as string);
    } else if (message['method'] === 'analysisComplete') {
      this.handleAnalysisComplete();
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
    /** Any other engine options; forwarded to the engine as-is. */
    options?: Omit<
      AnalyzerOptions,
      'tsconfigPath' | 'optimize' | 'virtualFiles' | 'nodeModulesPathOverride'
    >,
  ): Promise<NgpCompilerOptions> {
    const res = await this.tracer.sliceAsync(SpanKind.InitializeRpc, () =>
      this.callRpc<NgpCompilerOptions | null>('initialize', {
        ...options,
        tsconfigPath,
        optimize,
        virtualFiles,
        nodeModulesPathOverride,
      }),
    );
    this.compilerOptions = {
      workspaceName: options?.workspaceName,
      ...res,
    };
    return this.compilerOptions;
  }

  /** Records later RPCs and message parsing on `tracer`, for a long-lived sidecar. */
  setTracer(tracer: Tracer): void {
    this.tracer = tracer;
  }

  getCompilerOptions(): NgpCompilerOptions {
    return this.compilerOptions;
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
    return this.callRpc(
      'invalidateFiles',
      updates.map((u) => ({
        filePath: u.filePath,
        updateType: typeof u.updateType === 'number' ? FileUpdateType[u.updateType] : u.updateType,
      })),
    );
  }

  async setEntryPoints(entryPoints: string[]): Promise<string[]> {
    return this.callRpc('setEntryPoints', entryPoints);
  }

  async clearResolutionCache(): Promise<string[]> {
    return this.callRpc('clearResolutionCache', null);
  }

  async getTsFileForTemplate(templatePath: string): Promise<TemplateUsage[] | null> {
    return this.callRpc('getTsFileForTemplate', {templatePath});
  }

  async getFileContent(filePath: string): Promise<string> {
    return this.callRpc('getFileContent', {filePath});
  }

  async readResource(containingFile: string, url: string): Promise<ResolvedResource | null> {
    return this.callRpc<ResolvedResource | null>('readResource', {containingFile, url});
  }

  async canonicalPaths(paths: string[]): Promise<string[]> {
    return this.callRpc<string[]>('canonicalPaths', paths);
  }

  async takePerf(): Promise<AnalyzerPerfTake> {
    // The clocks are aligned on `now`, whose round trip is symmetric. `takePerf` isn't: its reply
    // can be megabytes to serialize, pipe and parse, which would put `nowUs` well before the
    // midpoint and the Rust events too late.
    const requestUs = nowMicros();
    const {nowUs} = await this.callRpc<{nowUs: number}>('now', {});
    const responseUs = nowMicros();
    const take = await this.callRpc<RustPerfTake>('takePerf', {});
    return {...take, requestUs, nowUs, responseUs};
  }
}
