import {task, dest} from 'gulp';
import {tsBuildTask, copyTask, serverTask} from '../util/task_helpers';
import {join} from 'path';
import {
  buildConfig,
  buildScssPipeline,
  copyFiles,
  inlineResourcesForDirectory,
  sequenceTask,
  watchFiles,
} from 'material2-build-tools';
import {
  cdkPackage,
  materialExperimentalPackage,
  cdkExperimentalPackage,
  materialPackage,
  momentAdapterPackage,
  examplesPackage,
} from '../packages';

// These imports don't have any typings provided.
const firebaseTools = require('firebase-tools');

const {outputDir, packagesDir, projectDir} = buildConfig;

/** Path to the directory where all bundles live. */
const bundlesDir = join(outputDir, 'bundles');

const appDir = join(packagesDir, 'demo-app');
const outDir = join(outputDir, 'packages', 'demo-app');

/** Array of vendors that are required to serve the demo-app. */
const appVendors = [
  '@angular',
  'systemjs',
  'zone.js',
  'rxjs',
  'hammerjs',
  'core-js',
  'moment',
  'tslib',
  '@webcomponents',
];

/** Glob that matches all required vendors for the demo-app. */
const vendorGlob = `+(${appVendors.join('|')})/**/*.+(html|css|js|map)`;

/** Glob that matches all assets that need to be copied to the output. */
const assetsGlob = join(appDir, `**/*.+(html|css|svg|ico)`);

/** Path to the demo-app tsconfig file. */
const tsconfigPath = join(appDir, 'tsconfig-build.json');

task(':build:devapp:ts', tsBuildTask(tsconfigPath));
task(':build:devapp:assets', copyTask(assetsGlob, outDir));
task(':build:devapp:scss', () => buildScssPipeline(appDir).pipe(dest(outDir)));
task(':build:devapp:inline-resources', () => inlineResourcesForDirectory(outDir));

task(':serve:devapp', serverTask(outDir, true));

task('build:devapp', sequenceTask(
  'cdk:build-no-bundles',
  'material:build-no-bundles',
  'cdk-experimental:build-no-bundles',
  'material-experimental:build-no-bundles',
  'material-moment-adapter:build-no-bundles',
  'build-examples-module',
  // The examples module needs to be manually built before building examples package because
  // when using the `no-bundles` task, the package-specific pre-build tasks won't be executed.
  'material-examples:build-no-bundles',
  [':build:devapp:assets', ':build:devapp:scss', ':build:devapp:ts'],
  // Inline all component resources because otherwise SystemJS tries to load HTML, CSS and
  // JavaScript files which makes loading the demo-app extremely slow.
  ':build:devapp:inline-resources',
));

task('serve:devapp', ['build:devapp'], sequenceTask([':serve:devapp', ':watch:devapp']));

/*
 * Development App deployment tasks. These can be used to run the dev-app outside of our
 * serve task with a middleware. e.g. on Firebase hosting.
 */

/** Task that copies all vendors into the demo-app package. Allows hosting the app on firebase. */
task('stage-deploy:devapp', ['build:devapp'], () => {
  copyFiles(join(projectDir, 'node_modules'), vendorGlob, join(outDir, 'node_modules'));
  copyFiles(bundlesDir, '*.+(js|map)', join(outDir, 'dist/bundles'));
  copyFiles(cdkPackage.outputDir, '**/*.+(js|map)', join(outDir, 'dist/packages/cdk'));
  copyFiles(materialPackage.outputDir, '**/*.+(js|map)', join(outDir, 'dist/packages/material'));
  copyFiles(materialExperimentalPackage.outputDir, '**/*.+(js|map)',
      join(outDir, 'dist/packages/material-experimental'));
  copyFiles(cdkExperimentalPackage.outputDir, '**/*.+(js|map)',
      join(outDir, 'dist/packages/cdk-experimental'));
  copyFiles(materialPackage.outputDir, '**/prebuilt/*.+(css|map)',
      join(outDir, 'dist/packages/material'));
  copyFiles(examplesPackage.outputDir, '**/*.+(js|map)',
      join(outDir, 'dist/packages/material-examples'));
  copyFiles(momentAdapterPackage.outputDir, '**/*.+(js|map)',
      join(outDir, 'dist/packages/material-moment-adapter'));
});

/**
 * Task that deploys the demo-app to Firebase. Firebase project will be the one that is
 * set for project directory using the Firebase CLI.
 */
task('deploy:devapp', ['stage-deploy:devapp'], () => {
  return firebaseTools.deploy({cwd: projectDir, only: 'hosting'})
    // Firebase tools opens a persistent websocket connection and the process will never exit.
    .then(() => {
      console.log('Successfully deployed the demo-app to firebase');
      process.exit(0);
    })
    .catch((err: any) => {
      console.log(err);
      process.exit(1);
    });
});

/*
 * Development app watch task. This task ensures that only the packages that have been affected
 * by a file-change are being rebuilt. This speeds-up development and makes working on Material
 * easier.
 */

task(':watch:devapp', () => {
  watchFiles(join(appDir, '**/*.ts'), [':build:devapp:ts']);
  watchFiles(join(appDir, '**/*.scss'), [':watch:devapp:rebuild-scss']);
  watchFiles(join(appDir, '**/*.html'), [':watch:devapp:rebuild-html']);

  // Custom watchers for all packages that are used inside of the demo-app. This is necessary
  // because we only want to build the changed package (using the build-no-bundles task).

  // CDK package watchers.
  watchFiles(join(cdkPackage.sourceDir, '**/*'), ['cdk:build-no-bundles']);

  // Material package watchers.
  watchFiles(join(materialPackage.sourceDir, '**/!(*-theme.scss)'), ['material:build-no-bundles']);
  watchFiles(join(materialPackage.sourceDir, '**/*-theme.scss'), [':build:devapp:scss']);

  // Moment adapter package watchers
  watchFiles(join(momentAdapterPackage.sourceDir, '**/*'),
    ['material-moment-adapter:build-no-bundles']);

  // Material experimental package watchers
  watchFiles(join(materialExperimentalPackage.sourceDir, '**/*'),
    ['material-experimental:build-no-bundles']);

  // CDK experimental package watchers
  watchFiles(join(cdkExperimentalPackage.sourceDir, '**/*'),
    ['cdk-experimental:build-no-bundles']);

  // Example package watchers.
  watchFiles(join(examplesPackage.sourceDir, '**/*'), ['material-examples:build-no-bundles']);
});

// Note that we need to rebuild the TS here, because the resource inlining
// won't work if the file's resources have been inlined already.
task(':watch:devapp:rebuild-scss', sequenceTask([':build:devapp:scss', ':build:devapp:ts'],
   ':build:devapp:inline-resources'));

task(':watch:devapp:rebuild-html', sequenceTask([':build:devapp:assets', ':build:devapp:ts'],
  ':build:devapp:inline-resources'));
