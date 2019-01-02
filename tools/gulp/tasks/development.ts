import {task, dest} from 'gulp';
import {tsBuildTask, copyTask, serverTask} from '../util/task-helpers';
import {join} from 'path';
import {
  buildConfig,
  buildScssPipeline,
  copyFiles,
  inlineResourcesForDirectory,
  sequenceTask,
} from 'material2-build-tools';
import {
  cdkPackage,
  materialExperimentalPackage,
  cdkExperimentalPackage,
  materialPackage,
  momentAdapterPackage,
  examplesPackage,
} from '../packages';
import {watchFilesAndReload} from '../util/watch-files-reload';

// These imports don't have any typings provided.
const firebaseTools = require('firebase-tools');

const {outputDir, packagesDir, projectDir} = buildConfig;

/** Path to the directory where all bundles live. */
const bundlesDir = join(outputDir, 'bundles');

const appDir = join(packagesDir, 'dev-app');
const outDir = join(outputDir, 'packages', 'dev-app');

/** Array of vendors that are required to serve the dev-app. */
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

/** Glob that matches all required vendors for the dev-app. */
const vendorGlob = `+(${appVendors.join('|')})/**/*.+(html|css|js|map)`;

/** Glob that matches all assets that need to be copied to the output. */
const assetsGlob = join(appDir, `**/*.+(html|css|svg|ico)`);

/** Path to the dev-app tsconfig file. */
const tsconfigPath = join(appDir, 'tsconfig-build.json');

task(':build:devapp:ts', tsBuildTask(tsconfigPath));
task(':build:devapp:assets', copyTask(assetsGlob, outDir));
task(':build:devapp:scss', () => buildScssPipeline(appDir).pipe(dest(outDir)));
task(':build:devapp:inline-resources', () => inlineResourcesForDirectory(outDir));

task(':serve:devapp', serverTask(outDir));

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
  // JavaScript files which makes loading the dev-app extremely slow.
  ':build:devapp:inline-resources',
));

task('serve:devapp', ['build:devapp'], sequenceTask([':serve:devapp', ':watch:devapp']));

/*
 * Development App deployment tasks. These can be used to run the dev-app outside of our
 * serve task with a middleware. e.g. on Firebase hosting.
 */

/** Task that copies all vendors into the dev-app package. Allows hosting the app on firebase. */
task('stage-deploy:devapp', ['build:devapp'], () => {
  const deployOutputDir = join(outputDir, 'devapp-deploy');

  copyFiles(outDir, 'index.html', deployOutputDir);
  copyFiles(outDir, '**/*.+(css|js|map)', deployOutputDir);
  copyFiles(join(projectDir, 'node_modules'), vendorGlob, join(deployOutputDir, 'node_modules'));
  copyFiles(bundlesDir, '*.+(js|map)', join(deployOutputDir, 'dist/bundles'));
  copyFiles(cdkPackage.outputDir, '**/*.+(js|map)', join(deployOutputDir, 'dist/packages/cdk'));
  copyFiles(materialPackage.outputDir, '**/*.+(js|map)',
    join(deployOutputDir, 'dist/packages/material'));
  copyFiles(materialExperimentalPackage.outputDir, '**/*.+(js|map)',
    join(deployOutputDir, 'dist/packages/material-experimental'));
  copyFiles(cdkExperimentalPackage.outputDir, '**/*.+(js|map)',
    join(deployOutputDir, 'dist/packages/cdk-experimental'));
  copyFiles(materialPackage.outputDir, '**/prebuilt/*.+(css|map)',
    join(deployOutputDir, 'dist/packages/material'));
  copyFiles(examplesPackage.outputDir, '**/*.+(js|map)',
    join(deployOutputDir, 'dist/packages/material-examples'));
  copyFiles(momentAdapterPackage.outputDir, '**/*.+(js|map)',
    join(deployOutputDir, 'dist/packages/material-moment-adapter'));
});

/**
 * Task that deploys the dev-app to Firebase. Firebase project will be the one that is
 * set for project directory using the Firebase CLI.
 */
task('deploy:devapp', ['stage-deploy:devapp'], () => {
  return firebaseTools.deploy({cwd: projectDir, only: 'hosting'})
    // Firebase tools opens a persistent websocket connection and the process will never exit.
    .then(() => {
      console.log('Successfully deployed the dev-app to firebase');
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
  watchFilesAndReload(join(appDir, '**/*.ts'), [':build:devapp:ts']);
  watchFilesAndReload(join(appDir, '**/*.scss'), [':watch:devapp:rebuild-scss']);
  watchFilesAndReload(join(appDir, '**/*.html'), [':watch:devapp:rebuild-html']);

  // Custom watchers for all packages that are used inside of the dev-app. This is necessary
  // because we only want to build the changed package (using the build-no-bundles task).

  // CDK package watchers.
  watchFilesAndReload(join(cdkPackage.sourceDir, '**/*'), ['cdk:build-no-bundles']);

  const materialCoreThemingGlob = join(
    materialPackage.sourceDir,
    '**/core/+(theming|typography)/**/*.scss'
  );

  // Material package watchers.
  watchFilesAndReload([
    join(materialPackage.sourceDir, '**/!(*-theme.scss)'), `!${materialCoreThemingGlob}`
  ], ['material:build-no-bundles']);
  watchFilesAndReload([
    join(materialPackage.sourceDir, '**/*-theme.scss'), materialCoreThemingGlob
  ], [':build:devapp:scss']);

  // Moment adapter package watchers
  watchFilesAndReload(join(momentAdapterPackage.sourceDir, '**/*'),
    ['material-moment-adapter:build-no-bundles']);

  // Material experimental package watchers
  watchFilesAndReload(join(materialExperimentalPackage.sourceDir, '**/*'),
    ['material-experimental:build-no-bundles']);

  // CDK experimental package watchers
  watchFilesAndReload(join(cdkExperimentalPackage.sourceDir, '**/*'),
    ['cdk-experimental:build-no-bundles']);

  // Example package watchers.
  watchFilesAndReload(join(examplesPackage.sourceDir, '**/*'),
    ['material-examples:build-no-bundles']);
});

// Note that we need to rebuild the TS here, because the resource inlining
// won't work if the file's resources have been inlined already.
task(':watch:devapp:rebuild-scss', sequenceTask([':build:devapp:scss', ':build:devapp:ts'],
   ':build:devapp:inline-resources'));

task(':watch:devapp:rebuild-html', sequenceTask([':build:devapp:assets', ':build:devapp:ts'],
  ':build:devapp:inline-resources'));
