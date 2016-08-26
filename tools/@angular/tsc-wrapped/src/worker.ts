import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {DelegatingHost, MetadataWriterHost, TsickleHost} from './compiler_host';
import {CompilerInterface, Tsc, check} from './tsc';

const minimist = require('minimist');
const ByteBuffer = require('bytebuffer');

// This assumes some options, e.g. encoding are invariant across programs.
const _host = ts.createCompilerHost({}, true);
_host.realpath = path => path;
const delegateGetSourceFile = _host.getSourceFile;

const cwd = process.cwd();

function main() {
  const args = minimist(process.argv.slice(2));

  if (args.persistent_worker) {
    const workerpb = loadWorkerPb();

    let buf: any;  // ByteBuffer

    // Hook all output to stderr and write it to a buffer, then include
    // that buffer's in the worker protcol proto's textual output.  This
    // means you can log via console.error() and it will appear to the
    // user as expected.
    //
    // Writing to the actual stderr will output to the blaze log.
    let consoleOutput = '';
    const stderrWrite = process.stderr.write.bind(process.stderr);
    process.stderr.write = (chunk: string | Buffer, ...otherArgs: any[]): boolean => {
      stderrWrite(chunk);
      consoleOutput += chunk.toString();
      return true;
    };

    const hashedAstStore = new HashedAstStore(true);
    const projectCacheMap = new Map<string, ProjectCache>();

    process.stdin.on('readable', function onStdinReadable(): void {
      const chunk = process.stdin.read();
      if (!chunk) {
        return;
      }

      const wrapped = ByteBuffer.wrap(chunk);
      buf = buf ? ByteBuffer.concat([buf, wrapped]) : wrapped;

      let req: WorkRequest;
      while (true) {
        try {
          req = workerpb.WorkRequest.decodeDelimited(buf);

          if (!req) {
            // Not enough bytes read yet
            return null;
          }
        } catch (err) {
          // Malformed message
          stderrWrite(err.stack + '\n');
          console.error(err.stack);
          process.stdout.write(new workerpb.WorkResponse()
                                   .setExitCode(1)
                                   .setOutput(consoleOutput)
                                   .encodeDelimited()
                                   .toBuffer());
          buf = null;
        }


        const args = req.arguments;
        const changedFiles: string[] = [];
        for (const file of req.inputs) {
          if (!hashedAstStore.validateDigest(file.path, file.digest.toBase64())) {
            changedFiles.push(file.path);
          }
        }
        let exitCode = 0;
        consoleOutput = '';
        try {
          let project = args.find(arg => arg.substr(0, '@@'.length) === '@@');
          if (!project) {
            throw new Error('tsconfig.json not specified');
          }
          project = project.substr('@@'.length);

          let projectCache = projectCacheMap.get(project);
          if (!projectCache) {
            projectCache = new ProjectCache();
            projectCacheMap.set(project, projectCache);
          } else {
            for (const file of changedFiles) {
              projectCache.invalidateFile(path.resolve(file));
            }
          }

          compile(project, hashedAstStore, projectCache);

        } catch (err) {
          exitCode = 1;
          stderrWrite(err.stack + '\n');
          console.error(err.stack);
        }
        process.stdout.write(new workerpb.WorkResponse()
                                 .setExitCode(exitCode)
                                 .setOutput(consoleOutput)
                                 .encodeDelimited()
                                 .toBuffer());

        // Avoid growing the buffer indefinitely.
        buf.compact();
        deferredGc();
      }
    });

    process.stdin.on('end', function onStdinEnd() {
      stderrWrite('Exiting TypeScript compiler persistent worker.\n');
      process.exit(0);
    });

  } else {
    const project = args._[args._.length - 1] || '';
    if (project && project.substr(0, '@@'.length) === '@@') {
      args._.pop();
      args.project = project.substr('@@'.length);
    }
    try {
      compile(args.p || args.project || '.');
      process.exit(0);
    } catch (e) {
      console.error(e.stack);
      console.error('Compilation failed');
      process.exit(1);
    }
  }
}

function loadWorkerPb() {
  const protobufjs = require('protobufjs');

  // We have to use RUNFILES instead of __dirname because __dirname may be wrong
  // due to Node.js's behavior of resolving symlinked modules.
  const protoPath = 'tools/@angular/tsc-wrapped/worker_protocol.proto';
  const protoNamespace = protobufjs.loadProtoFile({root: process.env['RUNFILES'], file: protoPath});

  if (!protoNamespace) {
    throw new Error(`Cannot find ${protoPath}`);
  }

  return protoNamespace.build('blaze.worker');
}

interface WorkRequest {
  arguments: string[];
  inputs: {path: string, digest: any}[];
}

type AstFileEntry = Map<ts.ScriptTarget, ts.SourceFile>;

class AstStore {
  private cache: Map<string, AstFileEntry> = new Map<string, AstFileEntry>();

  hit = 0;
  miss = 0;

  set(fileName: string, scriptTarget: ts.ScriptTarget, sourceFile: ts.SourceFile) {
    let entry = this.cache.get(fileName);
    if (!entry) {
      entry = new Map<ts.ScriptTarget, ts.SourceFile>();
      this.cache.set(fileName, entry);
    }
    entry.set(scriptTarget, sourceFile);
  }

  get(fileName: string, scriptTarget: ts.ScriptTarget): ts.SourceFile {
    let entry = this.cache.get(fileName);
    const sourceFile = entry && entry.get(scriptTarget);
    if (sourceFile) {
      this.hit += 1;
    } else {
      this.miss += 1;
    }
    return sourceFile;
  }

  delete (fileName: string, scriptTarget?: ts.ScriptTarget) {
    if (scriptTarget) {
      let entry = this.cache.get(fileName);
      return !!entry && entry.delete(scriptTarget);
    } else {
      return this.cache.delete(fileName);
    }
  }

  clear() { this.cache.clear(); }

  resetStats() { this.hit = this.miss = 0; }

  get size() { return this.cache.size; }
}

class HashedAstStore extends AstStore {
  private hashMap: Map<string, string> = new Map<string, string>();

  constructor(private strict = false) { super(); }

  validateDigest(fileName: string, digest: string) {
    const fileKey = path.relative(cwd, fileName);
    let entry = this.hashMap.get(fileKey);
    if (!entry || entry !== digest) {
      this.hashMap.set(fileKey, digest);
      if (this.delete(fileKey)) {
        debug('Invalidate AST          ' + fileKey);
      }
      return false;
    } else {
      return true;
    }
  }

  get(fileName: string, scriptTarget: ts.ScriptTarget): ts.SourceFile {
    const fileKey = path.relative(cwd, fileName);
    // Note that we also cache the lib.d.ts files without validation by Bazel.
    // This is potentially wrong if someone modifies them in node_modules.
    if (!this.hashMap.get(fileKey) && fileName.indexOf('typescript/lib/') === -1) {
      if (this.strict) {
        throw new Error(`File should not be read: ${fileKey}`);
      } else {
        return undefined;
      }
    }
    return super.get(fileKey, scriptTarget);
  }

  set(fileName: string, scriptTarget: ts.ScriptTarget, sourceFile: ts.SourceFile) {
    return super.set(path.relative(cwd, fileName), scriptTarget, sourceFile);
  }

  delete (fileName: string, scriptTarget?: ts.ScriptTarget) {
    return super.delete(path.relative(cwd, fileName), scriptTarget);
  }
}

interface ProjectCacheEntry {
  outFiles: Map<string, string>;
  diagnostics: ts.Diagnostic[];
}

class ProjectCache {
  dtsOutput: Map<string, ProjectCacheEntry> = new Map<string, ProjectCacheEntry>();
  compilerOptions: any;
  angularCompilerOptions: any;

  validateOptions(compilerOptions: any, angularCompilerOptions: any) {
    if (!deepEqual(this.compilerOptions, compilerOptions) ||
        !deepEqual(this.angularCompilerOptions, angularCompilerOptions)) {
      if (this.dtsOutput.size) {
        debug('Project changed... purging ProjectCache');
        this.dtsOutput.clear();
      }
    }

    this.compilerOptions = compilerOptions;
    this.angularCompilerOptions = angularCompilerOptions;
  }

  invalidateFile(fileName: string) {
    const fileKey = path.relative(cwd, fileName);
    if (this.dtsOutput.delete(fileName)) {
      debug('Invalidate DTS output    ' + fileKey);
    }
  }
}

function deepEqual(a: any, b: any) {
  if (typeof a !== typeof b) {
    return false;
  } else if (Array.isArray(a) || Array.isArray(b)) {
    if (Array.isArray(a) !== Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  } else if (typeof a === 'object') {
    if (a === null || b === null) {
      return a === b;
    }
    for (const k in a) {
      if (Object.prototype.hasOwnProperty.call(a, k) && !deepEqual(a[k], b[k])) {
        return false;
      }
    }
    for (const k in b) {
      if (Object.prototype.hasOwnProperty.call(b, k) && !deepEqual(a[k], b[k])) {
        return false;
      }
    }
    return true;
  } else {
    return a === b;
  }
}

class AstCachingHost extends DelegatingHost {
  constructor(delegate: ts.CompilerHost, private cache: AstStore) { super(delegate); }

  getSourceFile =
      (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => {
        let sourceFile = this.cache.get(fileName, languageVersion);
        if (!sourceFile) {
          sourceFile = this.delegate.getSourceFile(fileName, languageVersion, onError);
          if (sourceFile) {
            this.cache.set(fileName, languageVersion, sourceFile);
          }
        }
        return sourceFile;
      }
}

class OutputSavingHost extends DelegatingHost {
  outFiles: Map<string, string>;
  constructor(delegate: ts.CompilerHost) {
    super(delegate);
    this.clearOutFiles();
  }

  writeFile: ts.WriteFileCallback =
      (fileName, data, p, q, r) => {
        this.outFiles.set(fileName, data);
        this.delegate.writeFile(fileName, data, p, q, r);
      }

  clearOutFiles() {
    this.outFiles = new Map<string, string>();
  }

  getOutFiles() { return this.outFiles; }
}

const READONLY_REGEXP = /^( +)(static |private )*readonly +/gm;
const ABSTRACT_REGEXP = /^( +)abstract ([A-Za-z0-9_\$]+:)/gm;

const DEBUG = true;

function debug(...args: any[]) {
  if (DEBUG) {
    (<any>console.error)(...args);
  }
}

let currentTask: string = null;
let currentStart = Date.now();
let miss: number, hit: number;

const padding = new Array(60 + 1).join(' ');

function profile(task?: string) {
  if (!DEBUG) return;
  if (currentTask) {
    debug(
        (currentTask + '...' + padding).substr(0, 60) +
        ('     ' + (Date.now() - currentStart) + 'ms').substr(-8));
    currentTask = null;
  }
  currentStart = Date.now();
  currentTask = task;
}

function compile(project: string, astStore?: AstStore, projectCache?: ProjectCache) {
  const tsc = new Tsc();

  let projectDir = project;
  if (fs.lstatSync(project).isFile()) {
    projectDir = path.dirname(project);
  }

  // file names in tsconfig are resolved relative to this absolute path
  const basePath = path.join(process.cwd(), projectDir);

  profile('Reading configuration');
  // read the configuration options from wherever you store them
  const {parsed, ngOptions} = tsc.readConfiguration(project, basePath);

  ngOptions.basePath = basePath;

  let realHost = ts.createCompilerHost(parsed.options, true);
  // Disable symlink resolution to make bazel happy
  realHost.realpath = path => path;
  let host = astStore ? new AstCachingHost(realHost, astStore) : realHost;

  if (projectCache) {
    projectCache.validateOptions(parsed.options, ngOptions);
  }

  profile('Creating program');
  if (astStore) {
    astStore.resetStats();
  }
  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const errors = program.getOptionsDiagnostics();
  check(errors);
  if (astStore) {
    profile();
    debug(`  Global AST    Hit: ${astStore.hit}  Miss: ${astStore.miss}`);
    astStore.resetStats();
  }

  profile('Type checking');
  tsc.typeCheck(host, program);

  profile('Emitting downleveled .js');
  // Get slight performance improvement by not needlessly emitting .d.ts files
  const origDeclaration = (<Tsc>tsc).parsed.options.declaration;
  if (!ngOptions.skipMetadataEmit) {
    (<Tsc>tsc).parsed.options.declaration = false;
  }

  // Emit *.js with Decorators lowered to Annotations, and also *.js.map
  const tsicklePreProcessor = new TsickleHost(host, program);
  tsc.emit(tsicklePreProcessor, program);
  profile();

  (<Tsc>tsc).parsed.options.declaration = origDeclaration;

  if (!ngOptions.skipMetadataEmit) {
    // Emit *.metadata.json and *.d.ts
    // Not in the same emit pass with above, because tsickle erases
    // decorators which we want to read or document.
    // Do this emit second since TypeScript will create missing directories for us
    // in the standard emit.
    profile('Emitting .d.ts and .metadata.json');
    if (projectCache) {
      cachedEmit(
          tsc, host, host => new MetadataWriterHost(host, program, ngOptions), program,
          projectCache.dtsOutput);
      profile();
      debug(`  DTS output    Hit: ${hit}  Miss: ${miss}`);
    } else {
      const metadataWriter = new MetadataWriterHost(host, program, ngOptions);
      tsc.emit(<any>metadataWriter, program);
      profile();
    }
  }
}

function cachedEmit(
    tsc: Tsc, host: ts.CompilerHost, middleware: (host: ts.CompilerHost) => ts.CompilerHost,
    oldProgram: ts.Program, cache: Map<string, ProjectCacheEntry>): number {
  const diagnostics: ts.Diagnostic[] = [];
  miss = 0;
  hit = 0;
  let needEmit = false;
  let emitSkipped = false;

  // Avoid creating a new program if possible
  const done: {[fileName: string]: boolean} = {};
  for (const sourceFile of oldProgram.getSourceFiles()) {
    const fileName = sourceFile.fileName;
    const c = cache.get(fileName);
    if (c) {
      c.outFiles.forEach((data, outFileName) => { fs.writeFileSync(outFileName, data); });
      diagnostics.push(...c.diagnostics);
      hit += 1;
      done[fileName] = true;
    } else if (!fileName.match(/\.d\.ts$/)) {
      needEmit = true;
    }
  }

  if (needEmit) {
    const outputSavingHost = new OutputSavingHost(host);
    const middlewareHost = middleware(outputSavingHost);
    // Create a new program since the host may be different from the old program.
    const program = ts.createProgram(tsc.parsed.fileNames, tsc.parsed.options, middlewareHost);

    for (const sourceFile of program.getSourceFiles()) {
      const fileName = sourceFile.fileName;
      if (done[fileName]) {
        continue;
      }

      outputSavingHost.clearOutFiles();
      // This may emit nothing since e.g. some source files are d.ts files
      const result = program.emit(sourceFile);

      const outFiles = outputSavingHost.getOutFiles();
      if (outFiles.size) {
        cache.set(fileName, {outFiles, diagnostics: result.diagnostics});
        miss += 1;
      }

      emitSkipped = emitSkipped || result.emitSkipped;
      diagnostics.push(...result.diagnostics);
    }
  }

  check(diagnostics);
  if ((<any>host).diagnostics) {
    check((<any>host).diagnostics);
  }
  return emitSkipped ? 1 : 0;
}

let gcTimeout: number = null;
function deferredGc() {
  if (typeof global.gc !== 'undefined') {
    if (gcTimeout !== null) {
      clearTimeout(gcTimeout);
    }
    setTimeout(callGc, 1500);
  }
}

function callGc() {
  gcTimeout = null;
  global.gc();
}

main();
