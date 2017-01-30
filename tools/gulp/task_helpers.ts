import * as child_process from 'child_process';
import * as fs from 'fs';
import * as gulp from 'gulp';
import * as path from 'path';

import {NPM_VENDOR_FILES, PROJECT_ROOT, DIST_ROOT, SASS_AUTOPREFIXER_OPTIONS} from './constants';


/** Those imports lack typings. */
const gulpClean = require('gulp-clean');
const gulpMerge = require('merge2');
const gulpRunSequence = require('run-sequence');
const gulpSass = require('gulp-sass');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpAutoprefixer = require('gulp-autoprefixer');
const gulpConnect = require('gulp-connect');
const resolveBin = require('resolve-bin');
const firebaseAdmin = require('firebase-admin');


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
export function sassBuildTask(dest: string, root: string) {
  return () => {
    return gulp.src(_globify(root, '**/*.scss'))
      .pipe(gulpSourcemaps.init())
      .pipe(gulpSass().on('error', gulpSass.logError))
      .pipe(gulpAutoprefixer(SASS_AUTOPREFIXER_OPTIONS))
      .pipe(gulpSourcemaps.write('.'))
      .pipe(gulp.dest(dest));
  };
}


/** Options that can be passed to execTask or execNodeTask. */
export interface ExecTaskOptions {
  // Whether to output to STDERR and STDOUT.
  silent?: boolean;
  // If an error happens, this will replace the standard error.
  errMessage?: string;
}

/** Create a task that executes a binary as if from the command line. */
export function execTask(binPath: string, args: string[], options: ExecTaskOptions = {}) {
  return (done: (err?: string) => void) => {
    const childProcess = child_process.spawn(binPath, args);

    if (!options.silent) {
      childProcess.stdout.on('data', (data: string) => {
        process.stdout.write(data);
      });

      childProcess.stderr.on('data', (data: string) => {
        process.stderr.write(data);
      });
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
  const buildTasks = ['vendor', 'ts', 'scss', 'assets']
    .map(taskName => `:build:${appName}:${taskName}`);

  return (done: () => void) => {
    gulpRunSequence(
      'clean',
      'build:components',
      [...buildTasks],
      done
    );
  };
}


/** Create a task that copies vendor files in the proper destination. */
export function vendorTask() {
  return () => gulpMerge(
    NPM_VENDOR_FILES.map(root => {
      const glob = path.join(PROJECT_ROOT, 'node_modules', root, '**/*.+(js|js.map)');
      return gulp.src(glob).pipe(gulp.dest(path.join(DIST_ROOT, 'vendor', root)));
    }));
}

/** Create a task that serves the dist folder. */
export function serverTask(livereload = true) {
  return () => {
    gulpConnect.server({
      root: 'dist/',
      livereload: livereload,
      port: 4200,
      fallback: 'dist/index.html'
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

/** Opens a connection to the firebase realtime database. */
export function openFirebaseDatabase() {
  // Initialize the Firebase application with admin credentials.
  // Credentials need to be for a Service Account, which can be created in the Firebase console.
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      project_id: 'material2-dashboard',
      client_email: 'firebase-adminsdk-ch1ob@material2-dashboard.iam.gserviceaccount.com',
      // In Travis CI the private key will be incorrect because the line-breaks are escaped.
      // The line-breaks need to persist in the service account private key.
      private_key: (process.env['MATERIAL2_FIREBASE_PRIVATE_KEY'] || '').replace(/\\n/g, '\n')
    }),
    databaseURL: 'https://material2-dashboard.firebaseio.com'
  });

  return firebaseAdmin.database();
}

/** Whether gulp currently runs inside of Travis as a push. */
export function isTravisPushBuild() {
  return process.env['TRAVIS_PULL_REQUEST'] === 'false';
}
