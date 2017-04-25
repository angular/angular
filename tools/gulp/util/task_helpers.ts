import * as child_process from 'child_process';
import * as fs from 'fs';
import * as gulp from 'gulp';
import * as path from 'path';
import {PROJECT_ROOT} from '../constants';

/* Those imports lack typings. */
const gulpClean = require('gulp-clean');
const gulpRunSequence = require('run-sequence');
const gulpSass = require('gulp-sass');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpConnect = require('gulp-connect');
const gulpIf = require('gulp-if');
const gulpCleanCss = require('gulp-clean-css');

// There are no type definitions available for these imports.
const resolveBin = require('resolve-bin');
const httpRewrite = require('http-rewrite-middleware');

/** If the string passed in is a glob, returns it, otherwise append '**\/*' to it. */
function _globify(maybeGlob: string, suffix = '**/*') {
  if (maybeGlob.indexOf('*') != -1) {
    return maybeGlob;
  }
  try {
    const stat = fs.statSync(maybeGlob);
    if (stat.isFile()) {
      return maybeGlob;
    }
  } catch (e) {}
  return path.join(maybeGlob, suffix);
}


/** Creates a task that runs the TypeScript compiler */
export function tsBuildTask(tsConfigPath: string) {
  return execNodeTask('typescript', 'tsc', ['-p', tsConfigPath]);
}


/** Create a SASS Build Task. */
export function sassBuildTask(dest: string, root: string, minify = false) {
  return () => {
    return gulp.src(_globify(root, '**/*.scss'))
      .pipe(gulpSourcemaps.init({ loadMaps: true }))
      .pipe(gulpSass().on('error', gulpSass.logError))
      .pipe(gulpIf(minify, gulpCleanCss()))
      .pipe(gulpSourcemaps.write('.'))
      .pipe(gulp.dest(dest));
  };
}


/** Options that can be passed to execTask or execNodeTask. */
export interface ExecTaskOptions {
  // Whether STDOUT and STDERR messages should be printed.
  silent?: boolean;
  // Whether STDOUT messages should be printed.
  silentStdout?: boolean;
  // If an error happens, this will replace the standard error.
  errMessage?: string;
}

/** Create a task that executes a binary as if from the command line. */
export function execTask(binPath: string, args: string[], options: ExecTaskOptions = {}) {
  return (done: (err?: string) => void) => {
    const childProcess = child_process.spawn(binPath, args);

    if (!options.silentStdout && !options.silent) {
      childProcess.stdout.on('data', (data: string) => process.stdout.write(data));
    }

    if (!options.silent) {
      childProcess.stderr.on('data', (data: string) => process.stderr.write(data));
    }

    childProcess.on('close', (code: number) => {
      if (code != 0) {
        if (options.errMessage === undefined) {
          done('Process failed with code ' + code);
        } else {
          done(options.errMessage);
        }
      } else {
        done();
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
    executable = undefined;
  }

  return (done: (err: any) => void) => {
    resolveBin(packageName, { executable: executable }, (err: any, binPath: string) => {
      if (err) {
        done(err);
      } else {
        // Execute the node binary within a new child process using spawn.
        // The binary needs to be `node` because on Windows the shell cannot determine the correct
        // interpreter from the shebang.
        execTask('node', [binPath].concat(args), options)(done);
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


/** Build an task that depends on all application build tasks. */
export function buildAppTask(appName: string) {
  const buildTasks = ['ts', 'scss', 'assets']
    .map(taskName => `:build:${appName}:${taskName}`)
    .filter(taskName => gulp.hasTask(taskName));

  return (done: () => void) => {
    gulpRunSequence(
      'material:clean-build',
      [...buildTasks],
      done
    );
  };
}

/**
 * Create a task that serves a given directory in the project.
 * The server rewrites all node_module/ or dist/ requests to the correct directory.
 */
export function serverTask(packagePath: string, livereload = true) {
  // The http-rewrite-middlware only supports relative paths as rewrite destinations.
  let relativePath = path.relative(PROJECT_ROOT, packagePath);

  return () => {
    gulpConnect.server({
      root: PROJECT_ROOT,
      livereload: livereload,
      port: 4200,
      fallback: path.join(packagePath, 'index.html'),
      middleware: () => {
        return [httpRewrite.getMiddleware([
          { from: '^/node_modules/(.*)$', to: '/node_modules/$1' },
          { from: '^/dist/(.*)$', to: '/dist/$1' },
          { from: '^(.*)$', to: `/${relativePath}/$1` }
        ])];
      }
    });
  };
}

/** Triggers a reload when livereload is enabled and a gulp-connect server is running. */
export function triggerLivereload() {
  gulp.src('dist').pipe(gulpConnect.reload());
}


/** Create a task that's a sequence of other tasks. */
export function sequenceTask(...args: any[]) {
  return (done: any) => {
    gulpRunSequence(
      ...args,
      done
    );
  };
}
