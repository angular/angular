#!/usr/bin/env node

///<reference path="../../node_modules/@types/node/index.d.ts"/>

'use strict';

import * as path from 'path';
import {ChildProcess} from 'child_process';

import {BazelInfo, BAZEL, FileWatcher, IBazelEnvironment, ProcessIBazelEnvironment} from './environment';
import {ParseResult, parse} from './parser';
import {debounce, difference, isMainWorkspace, targetToPath} from './utils';

export class IBazel {
  private env: IBazelEnvironment;

  private info: BazelInfo;
  /** Current directory relative to the workspace. */
  private cwd: string;
  private parsed: ParseResult;
  private command: string[];
  private targets: string[];

  private buildWatcher: FileWatcher;
  private sourceWatcher: FileWatcher;
  private shouldReconfigure: boolean;

  private notifyChanges: boolean;
  private runProcess: ChildProcess;

  private dependencies: BazelDependencies;

  constructor(env: IBazelEnvironment) { this.env = env; }

  start(argv: string[]) {
    this.info = this.env.info();

    this.cwd = path.relative(this.info.workspace, this.env.cwd());

    this.parsed = parse(this.env, argv);
    this.command = this.parsed.fullCommand;
    this.targets = this.parsed.targets;

    const watcherOptions = {cwd: this.info.workspace};
    this.buildWatcher = this.env.createWatcher(() => this.triggerReconfigure(), watcherOptions);
    this.sourceWatcher = this.env.createWatcher(() => this.triggerRun(), watcherOptions);
    this.shouldReconfigure = false;

    this.notifyChanges = false;
    this.runProcess = null;

    this.dependencies = {buildFiles: [], sourceFiles: []};

    this.env.registerCleanup(this.cleanup.bind(this));

    this.checkNotify();
    this.reconfigure();
  }

  stop() {
    this.buildWatcher.close();
    this.sourceWatcher.close();
    this.triggerRun.cancel();
  }

  private reconfigure() {
    const newDependencies = this.env.queryFiles(this.targets);

    // Hopefully there will not be a race condition after query and before watch

    const buildDiff = difference(this.dependencies.buildFiles, newDependencies.buildFiles);
    this.buildWatcher.unwatch(buildDiff.removed.filter(isMainWorkspace).map(targetToPath));
    this.buildWatcher.add(buildDiff.added.filter(isMainWorkspace).map(targetToPath));

    const sourceDiff = difference(this.dependencies.sourceFiles, newDependencies.sourceFiles);
    this.sourceWatcher.unwatch(sourceDiff.removed.filter(isMainWorkspace).map(targetToPath));
    this.sourceWatcher.add(sourceDiff.added.filter(isMainWorkspace).map(targetToPath));

    this.dependencies = newDependencies;

    this.run();
  }

  private checkNotify() {
    if (this.parsed.commandType === 'run' && this.targets.length === 1) {
      const rules = this.env.queryRules(this.targets);
      for (const attr of rules[0].attribute) {
        if (attr.name === 'tags') {
          if (attr.stringListValue.some((tag: string) => tag === 'ibazel_notify_changes')) {
            this.env.log(`"${BAZEL} run" target requests notify changes.`);
            this.notifyChanges = true;
          }
        }
      }
    }
  }

  private run() {
    if (this.notifyChanges) {
      if (!this.runProcess) {
        const tempFile = this.env.getTempFile('ibazel_run_script');
        // This also does the initial build.
        this.env.execute(
            [
              ...this.parsed.startupArgs, 'run', `--script_path=${tempFile}`,
              ...this.parsed.commandArgs
            ],
            {inheritStdio: true});

        const env = Object.assign({'IBAZEL_NOTIFY_CHANGES': 'y'}, process.env);
        this.runProcess = this.env.spawnAsync(tempFile, [], {
          env,
          stdio: ['pipe', 'inherit', 'inherit'],
        });  // async
        this.runProcess.on('exit', (code: number) => {
          this.env.log(
              `"${BAZEL} run" exited with status ${code}. Command will re-run on next change.`);
          // This will make the command restart on next build notification.
          this.runProcess = null;

          try {
            this.env.unlink(tempFile);
          } catch (err) {
          }
        })
      } else {
        this.runProcess.stdin.write('IBAZEL_BUILD_STARTED\n');  // async
        const result = this.env.execute(
            [...this.parsed.startupArgs, 'build', ...this.parsed.commandArgs],
            {inheritStdio: true});
        this.runProcess.stdin.write(
            `IBAZEL_BUILD_COMPLETED ${result.status ? 'FAILED' : 'SUCCEEDED'}\n`);  // async
      }
    } else {
      this.env.execute(this.command, {inheritStdio: true});
    }
  }

  private triggerReconfigure() {
    this.shouldReconfigure = true;
    this.triggerRun();
  }

  private triggerRun = debounce(function triggerRun() {
    if (this.shouldReconfigure) {
      this.reconfigure();
    } else {
      this.run();
    }
    this.shouldReconfigure = false;
  });

  private cleanup() {
    if (!this.runProcess) {
      // When this callback is called, all blocking process executions have
      // returned. Since there is no async running process, we can simply exit
      // immediately.
      process.exit(0);
    } else {
      this.triggerRun.cancel();
      this.buildWatcher.close();
      this.sourceWatcher.close();

      if (this.runProcess) {
        this.env.log(`Caught interrupt signal. Waiting for "${BAZEL} run" to terminate.`);
        this.runProcess.on('exit', () => { process.exit(0); });
        this.runProcess.kill('SIGINT');
        setTimeout(() => { this.runProcess.kill('SIGTERM'); }, 10000);
      }
    }
  }
}

export interface BazelDependencies {
  buildFiles: string[];
  sourceFiles: string[];
}

if (require.main === module) {
  new IBazel(new ProcessIBazelEnvironment()).start(process.argv.slice(2));
}
