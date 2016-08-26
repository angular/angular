import * as assert from 'assert';
import {ChildProcess, SpawnOptions, spawn, spawnSync} from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const chalk = require('chalk');
const chokidar = require('chokidar');
const protobufjs = require('protobufjs');
protobufjs.convertFieldsToCamelCase = true;

/**
 * Name of the bazel binary.
 */
export const BAZEL = 'bazel';

/**
 * Our name.
 */
export const IBAZEL = 'ibazel';

/**
 * Encapsulates the execution environment of ibazel.
 */
export interface IBazelEnvironment {
  /**
   * Runs the specified bazel command.
   */
  execute(argv: string[], options?: {inheritStdio?: boolean}): BazelResult;
  /**
   * Runs the specified executable asynchronously. Returns a NodeJS child
   * process.
   */
  spawnAsync(file: string, argv: string[], options?: SpawnOptions): ChildProcess;
  /**
   * Gets bazel info.
   */
  info(): BazelInfo;
  /**
   * Queries the build and source files of the specified targets.
   */
  queryFiles(targets: string[]): {buildFiles: string[], sourceFiles: string[]};
  /**
   * Queries the rule object of the specified targets.
   */
  queryRules(targets: string[]): any[];
  /**
   * Gets a map of command-line flag to boolean indicating whether it is a
   * boolean flag.
   * e.g.{'--foo': true} means --foo does not take any argument
   */
  getFlags(): {[option: string]: boolean};
  /**
   * Gets the current working directory of the process.
   */
  cwd(): string;
  /**
   * Generates a path for a temporary file.
   */
  getTempFile(basename: string): string;
  /**
   * Creates a file watcher that triggers callback on file changes.
   */
  createWatcher(callback: () => void, options?: any): FileWatcher;
  /**
   * Registers a function to be called when SIGINT is received.
   */
  registerCleanup(callback: () => void): void;
  /**
   * Logs a message to the console.
   */
  log(message: string): void;
  /**
   * Deletes a file.
   */
  unlink(fileName: string): void;
}

export interface BazelInfo { ['workspace']: string; }

export const REQUIRED_INFO_KEYS = ['workspace'];

export interface BazelResult {
  stdout: string|Buffer;
  status: number;
}

export interface FileWatcher {
  add(paths: string[]): void;
  unwatch(paths: string[]): void;
  close(): void;
}

export class ProcessIBazelEnvironment implements IBazelEnvironment {
  execute(argv: string[], {inheritStdio = false} = {}): BazelResult {
    const outMode = inheritStdio ? 'inherit' : 'pipe';
    const result = spawnSync(BAZEL, argv, {stdio: ['ignore', outMode, 'inherit'], env: patchEnv(process.env)});

    return {stdout: result.stdout, status: result.status};
  }

  spawnAsync(file: string, argv: string[], options?: SpawnOptions): ChildProcess {
    if (options && options.env) {
      options = Object.assign({}, options, {
        env: patchEnv(options.env)
      });
    }
    return spawn(file, argv, options);
  }

  info(): BazelInfo {
    const result = this.execute(['info']);
    assert(!result.status, `${IBAZEL}: "${BAZEL} info" exited with status ${result.status}.`);

    const ret: any = {};
    for (const line of result.stdout.toString().split('\n').slice(0, -1)) {
      const [key, value] = line.split(': ');
      ret[key] = value;
    }
    for (const key of REQUIRED_INFO_KEYS) {
      assert(ret[key], `${IBAZEL}: "${BAZEL} info" did not provide required key "${key}".`);
    }
    return ret;
  }

  queryFiles(targets: string[]): {buildFiles: string[], sourceFiles: string[]} {
    const build = this.execute(['query', `buildfiles(deps(set(${targets.join(' ')})))`]);
    assert(!build.status, `${IBAZEL}: "${BAZEL} query" exited with status ${build.status}.`);

    const buildFiles = build.stdout.toString().split('\n').slice(0, -1).sort();

    const source = this.execute(['query', `kind("source file", deps(set(${targets.join(' ')})))`]);
    assert(!source.status, `${IBAZEL}: "${BAZEL} query" exited with status ${source.status}.`);

    const sourceFiles = source.stdout.toString().split('\n').slice(0, -1).sort();

    return {buildFiles, sourceFiles};
  }

  queryRules(targets: string[]): any[] {
    const result = this.execute(['query', '--output=proto', `kind(rule, ${targets.join(' ')})`]);
    const queryResult = getBuildPb().QueryResult.decode(result.stdout);
    return queryResult.target.map((t: any) => t.rule);
  }

  getFlags(): {[option: string]: boolean} {
    const result = this.execute(['help', 'completion']);
    assert(
        !result.status,
        `${IBAZEL}: "${BAZEL} help completion" exited with status ${result.status}`);

    const ret: {[option: string]: boolean} = {};

    const flags = result.stdout.toString().split('\n').slice(0, -1).filter(line => line[0] === '-');

    for (const flag of flags) {
      const [, key, hasArg] = /^(-[^=]+)(=?)/.exec(flag);
      ret[key] = !hasArg;
    }

    // These single-character flags can be found in "bazel help build"
    ret['-c'] = false;
    ret['-j'] = false;
    ret['-k'] = true;
    ret['-t'] = true;
    ret['-s'] = true;

    return ret;
  }

  cwd(): string { return process.cwd(); }

  getTempFile(basename: string): string {
    return path.join(
        os.tmpdir(), `${basename}-${Date.now()}-${Math.round(Math.random() * 100000)}`);
  }

  createWatcher(callback: Function, options: any = {}): FileWatcher {
    const chokidorFlags =
        Object.assign({}, options, {events: ['change', 'unlink'], ignoreInitial: true});
    const watcher = chokidar.watch([], chokidorFlags);

    watcher.on('all', callback);

    return watcher;
  }

  registerCleanup(callback: () => void): void {
    process.on('SIGINT', callback);
  }

  log(message: string): void {
    console.log(chalk.cyan(`${IBAZEL}:`) + ` ${message}`);
  }

  unlink(fileName: string): void {
    fs.unlinkSync(fileName);
  }
}

let buildPb: any;

function getBuildPb() {
  if (!buildPb) {
    const protoPath = 'tools/ibazel/build.proto';
    const protoNamespace =
        protobufjs.loadProtoFile({root: process.env['RUNFILES'], file: protoPath});

    if (!protoNamespace) {
      throw new Error(`Cannot find ${protoPath}`);
    }

    buildPb = protoNamespace.build('blaze_query');
  }
  return buildPb;
}

function patchEnv(env: any) {
  const ret = Object.assign({}, env);
  delete ret['RUNFILES'];
  return ret;
}
