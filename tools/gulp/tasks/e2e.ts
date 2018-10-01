import {task} from 'gulp';
import {buildConfig, sequenceTask, triggerLivereload, watchFiles} from 'material2-build-tools';
import {join} from 'path';
import {copyTask, execNodeTask, ngcBuildTask, serverTask} from '../util/task_helpers';

// There are no type definitions available for these imports.
const gulpConnect = require('gulp-connect');

const {outputDir, packagesDir, projectDir} = buildConfig;

const appDir = join(packagesDir, 'e2e-app');
const e2eTestDir = join(projectDir, 'e2e');

/**
 * The output of the e2e app will preserve the directory structure because otherwise NGC is not
 * able to generate factory files for the release output and node modules.
 */
const outDir = join(outputDir, 'src/e2e-app');

const PROTRACTOR_CONFIG_PATH = join(projectDir, 'test/protractor.conf.js');
const tsconfigPath = join(appDir, 'tsconfig-build.json');

/** Builds and serves the e2e-app and runs protractor once the e2e-app is ready. */
task('e2e', sequenceTask(
  [':test:protractor:setup', 'serve:e2eapp'],
  ':test:protractor',
  ':serve:e2eapp:stop'
));

/**
 * Builds and serves the e2e-app and runs protractor when the app is ready. Re-runs protractor when
 * the app or tests change.
 */
task('e2e:watch', sequenceTask(
  [':test:protractor:setup', 'serve:e2eapp'],
  [':test:protractor', 'material:watch', ':e2e:watch'],
));

/** Watches the e2e app and tests for changes and triggers a test rerun on change. */
task(':e2e:watch', () => {
  watchFiles([join(appDir, '**/*.+(html|ts|css)'), join(e2eTestDir, '**/*.+(html|ts)')],
      [':e2e:rerun'], false);
});

/** Updates the e2e app and runs the protractor tests. */
task(':e2e:rerun', sequenceTask(
  'e2e-app:copy-assets',
  'e2e-app:build-ts',
  ':e2e:reload',
  ':test:protractor'
));

/** Triggers a reload of the e2e app. */
task(':e2e:reload', () => {
  return triggerLivereload();
});

/** Task that builds the e2e-app in AOT mode. */
task('e2e-app:build', sequenceTask(
  'clean',
  [
    'cdk:build-release',
    'material:build-release',
    'cdk-experimental:build-release',
    'material-experimental:build-release',
    'material-moment-adapter:build-release',
    'material-examples:build-release'
  ],
  ['e2e-app:copy-index-html', 'e2e-app:build-ts']
));

/** Task that copies the e2e-app index HTML file to the output. */
task('e2e-app:copy-index-html', copyTask(join(appDir, 'index.html'), outDir));

/** Task that builds the TypeScript sources. Those are compiled inside of the dist folder. */
task('e2e-app:build-ts', ngcBuildTask(tsconfigPath));

task(':watch:e2eapp', () => {
  watchFiles(join(appDir, '**/*.ts'), ['e2e-app:build'], false);
  watchFiles(join(appDir, '**/*.html'), ['e2e-app:copy-assets'], false);
});

/** Ensures that protractor and webdriver are set up to run. */
task(':test:protractor:setup', execNodeTask(
  // Disable download of the gecko selenium driver because otherwise the webdriver
  // manager queries GitHub for the latest version and will result in rate limit failures.
  'protractor', 'webdriver-manager', ['update', '--gecko', 'false']));

/** Runs protractor tests (assumes that server is already running. */
task(':test:protractor', execNodeTask('protractor', [PROTRACTOR_CONFIG_PATH]));

/** Starts up the e2e app server and rewrites the HTTP requests to properly work with AOT. */
task(':serve:e2eapp', serverTask(outDir, false, [
  // Rewrite each request for .ngfactory files which are outside of the e2e-app to the **actual**
  // path. This is necessary because NGC cannot generate factory files for the node modules
  // and release output. If we work around it by adding multiple root directories, the directory
  // structure would be messed up, so we need to go this way for now (until Ivy).
  { from: '^/((?:dist|node_modules)/.*\.ngfactory\.js)$', to: '/dist/$1' },
  // Rewrite the node_modules/ and dist/ folder to the real paths. Otherwise we would need
  // to copy the required modules to the serve output. If dist/ is explicitly requested, we
  // should redirect to the actual dist path because by default we fall back to the e2e output.
  { from: '^/node_modules/(.*)$', to: '/node_modules/$1' },
  { from: '^/dist/(.*)$', to: '/dist/$1' },
  // Rewrite every path that doesn't point to a specific file to the e2e output.
  // This is necessary for Angular's routing using the HTML5 History API.
  { from: '^/[^.]+$', to: `/dist/src/e2e-app/index.html`},
  { from: '^(.*)$', to: `/dist/src/e2e-app/$1` },
]));

/** Terminates the e2e app server */
task(':serve:e2eapp:stop', gulpConnect.serverClose);

/** Builds and serves the e2e app. */
task('serve:e2eapp', sequenceTask('e2e-app:build', ':serve:e2eapp'));

/**
 * [Watch task] Builds and serves e2e app, rebuilding whenever the sources change.
 * This should only be used when running e2e tests locally.
 */
task('serve:e2eapp:watch', ['serve:e2eapp', 'material:watch', ':watch:e2eapp']);
