import {BrowserSyncInstance, create as createBrowserSyncInstance} from 'browser-sync';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as gulp from 'gulp';
import {buildConfig} from 'material2-build-tools';
import * as path from 'path';

// This import lacks type definitions.
const gulpClean = require('gulp-clean');

// There are no type definitions available for these imports.
const resolveBin = require('resolve-bin');
const httpRewrite = require('http-rewrite-middleware');

const {projectDir} = buildConfig;

/** Currently active browsersync instance. */
let activeBrowserSyncInstance: BrowserSyncInstance;

/** If the string passed in is a glob, returns it, otherwise append '**\/*' to it. */
function _globify(maybeGlob: string, suffix = '**/*') {
  if (maybeGlob.indexOf('*') > -1) {
    return maybeGlob;
  }
  try {
    if (fs.statSync(maybeGlob).isFile()) {
      return maybeGlob;
    }
  } catch {}
  return path.join(maybeGlob, suffix);
}


/** Creates a task that runs the TypeScript compiler */
export function tsBuildTask(tsConfigPath: string) {
  return execNodeTask('typescript', 'tsc', ['-p', tsConfigPath]);
}

/** Creates a task that runs the Angular Compiler CLI. */
export function ngcBuildTask(tsConfigPath: string) {
  return execNodeTask('@angular/compiler-cli', 'ngc', ['-p', tsConfigPath]);
}

/** Options that can be passed to execTask or execNodeTask. */
export interface ExecTaskOptions {
  // Whether STDOUT and STDERR messages should be printed.
  silent?: boolean;
  // Whether STDOUT messages should be printed.
  silentStdout?: boolean;
  // If an error happens, this will replace the standard error.
  errMessage?: string;
  // Environment variables being passed to the child process.
  env?: any;
  // Whether the task should fail if the process writes to STDERR.
  failOnStderr?: boolean;
}

/** Create a task that executes a binary as if from the command line. */
export function execTask(binPath: string, args: string[], options: ExecTaskOptions = {}) {
  return (done: (err?: string) => void) => {
    const env = Object.assign({}, process.env, options.env);
    const childProcess = child_process.spawn(binPath, args, {env});
    const stderrData: string[] = [];

    if (!options.silentStdout && !options.silent) {
      childProcess.stdout.on('data', (data: string) => process.stdout.write(data));
    }

    if (!options.silent || options.failOnStderr) {
      childProcess.stderr.on('data', (data: string) => {
        options.failOnStderr ? stderrData.push(data) : process.stderr.write(data);
      });
    }

    childProcess.on('close', (code: number) => {
      if (options.failOnStderr && stderrData.length) {
        done(stderrData.join('\n'));
      } else {
        code != 0 ? done(options.errMessage || `Process failed with code ${code}`) : done();
      }
    });
  };
}

/**
 * Create a task that executes an NPM Bin, by resolving the binary path then executing it. These are
 * binaries that are normally in the `./node_modules/.bin` directory, but their name might differ
 * from the package. Examples are typescript, ngc and gulp itself.
 */
export function execNodeTask(packageName: string, executable: string | string[], args?: string[],
                             options: ExecTaskOptions = {}) {
  if (!args) {
    args = <string[]>executable;
    executable = '';
  }

  return (done: (err: any) => void) => {
    resolveBin(packageName, { executable: executable }, (err: any, binPath: string) => {
      if (err) {
        done(err);
      } else {
        // Execute the node binary within a new child process using spawn.
        // The binary needs to be `node` because on Windows the shell cannot determine the correct
        // interpreter from the shebang.
        execTask('node', [binPath].concat(args!), options)(done);
      }
    });
  };
}


/** Copy files from a glob to a destination. */
export function copyTask(srcGlobOrDir: string | string[], outRoot: string) {
  if (typeof srcGlobOrDir === 'string') {
    return () => gulp.src(_globify(srcGlobOrDir)).pipe(gulp.dest(outRoot));
  } else {
    return () => gulp.src(srcGlobOrDir.map(name => _globify(name))).pipe(gulp.dest(outRoot));
  }
}


/** Delete files. */
export function cleanTask(glob: string) {
  return () => gulp.src(glob, { read: false }).pipe(gulpClean(null));
}

/**
 * Create a task that serves a given directory in the project.
 * The server rewrites all node_module/ or dist/ requests to the correct directory.
 */
export function serverTask(packagePath: string, rewrites?: {from: string, to: string}[]) {
  // The http-rewrite-middleware only supports relative paths as rewrite destinations.
  const relativePath = path.relative(projectDir, packagePath);
  const defaultHttpRewrites = [
    // Rewrite the node_modules/ and dist/ folder to the real paths. This is a trick to
    // avoid that those folders will be rewritten to the specified package path.
    { from: '^/node_modules/(.*)$', to: '/node_modules/$1' },
    { from: '^/dist/(.*)$', to: '/dist/$1' },
    // Rewrite every path that doesn't point to a specific file to the index.html file.
    // This is necessary for Angular's routing using the HTML5 History API.
    { from: '^/[^.]+$', to: `/${relativePath}/index.html`},
    // Rewrite any path that didn't match a pattern before to the specified package path.
    { from: '^(.*)$', to: `/${relativePath}/$1` },
  ];

  return () => {
    if (activeBrowserSyncInstance) {
      throw new Error('Cannot setup BrowserSync because there is already an instance running.');
    }

    activeBrowserSyncInstance = createBrowserSyncInstance();
    activeBrowserSyncInstance.init({
      server: projectDir,
      port: 4200,
      middleware: httpRewrite.getMiddleware(rewrites || defaultHttpRewrites),
      notify: false,

      // Options which are disabled by default. We don't want to enable ghostMode by default
      // because it can throw-off change detection due to the event listeners syncing events
      // between browsers. Also opening the browser is not always desired because in some cases
      // developers just want to serve the app, and open the browser on a different device.
      ghostMode: process.argv.includes('--ghostMode'),
      open: process.argv.includes('--open'),
    });
  };
}

/** Gets the currently active browsersync instance */
export function getActiveBrowserSyncInstance(): BrowserSyncInstance {
  if (!activeBrowserSyncInstance) {
    throw new Error('Cannot return Browsersync instance because there is no instance running.');
  }

  return activeBrowserSyncInstance;
}
