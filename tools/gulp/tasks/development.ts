import {task} from 'gulp';
import {tsBuildTask, copyTask, serverTask} from '../util/task_helpers';
import {join} from 'path';
import {
  buildConfig, copyFiles, buildScssTask, sequenceTask, watchFiles
} from 'material2-build-tools';
import {
  cdkPackage,
  materialExperimentalPackage,
  cdkExperimentalPackage,
  materialPackage,
  momentAdapterPackage
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
  'web-animations-js',
  'moment',
  'tslib',
];

/** Glob that matches all required vendors for the demo-app. */
const vendorGlob = `+(${appVendors.join('|')})/**/*.+(html|css|js|map)`;

/** Glob that matches all assets that need to be copied to the output. */
const assetsGlob = join(appDir, `**/*.+(html|css|svg)`);

task(':watch:devapp', () => {
  watchFiles(join(appDir, '**/*.ts'), [':build:devapp:ts']);
  watchFiles(join(appDir, '**/*.scss'), [':build:devapp:scss']);
  watchFiles(join(appDir, '**/*.html'), [':build:devapp:assets']);

  // Custom watchers for all packages that are used inside of the demo-app. This is necessary
  // because we only want to build the changed package (using the build-no-bundles task).
  watchFiles(join(cdkPackage.sourceDir, '**/*'), ['cdk:build-no-bundles']);
  watchFiles(join(materialPackage.sourceDir, '**/!(*.scss)'), ['material:build-no-bundles']);
  watchFiles(join(materialPackage.sourceDir, '**/*.scss'), [':build:devapp:material-with-styles']);
  watchFiles(join(momentAdapterPackage.sourceDir, '**/*'),
      ['material-moment-adapter:build-no-bundles']);
  watchFiles(join(materialExperimentalPackage.sourceDir, '**/*'),
      ['material-experimental:build-no-bundles']);
  watchFiles(join(cdkExperimentalPackage.sourceDir, '**/*'),
      ['cdk-experimental:build-no-bundles']);
});

/** Path to the demo-app tsconfig file. */
const tsconfigPath = join(appDir, 'tsconfig-build.json');

task(':build:devapp:ts', tsBuildTask(tsconfigPath));
task(':build:devapp:scss', buildScssTask(outDir, appDir));
task(':build:devapp:assets', copyTask(assetsGlob, outDir));

task(':serve:devapp', serverTask(outDir, true));

// The themes for the demo-app are built by using the SCSS mixins from Material.
// Therefore when SCSS files have been changed, the custom theme needs to be rebuilt.
task(':build:devapp:material-with-styles', sequenceTask(
  'material:build-no-bundles', ':build:devapp:scss'
));

task('build:devapp', sequenceTask(
  'cdk:build-no-bundles',
  'material:build-no-bundles',
  'cdk-experimental:build-no-bundles',
  'material-experimental:build-no-bundles',
  'material-moment-adapter:build-no-bundles',
  [':build:devapp:assets', ':build:devapp:scss', ':build:devapp:ts']
));

task('serve:devapp', ['build:devapp'], sequenceTask([':serve:devapp', ':watch:devapp']));

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
});

/**
 * Task that deploys the demo-app to Firebase. Firebase project will be the one that is
 * set for project directory using the Firebase CLI.
 */
task('deploy:devapp', ['stage-deploy:devapp'], () => {
  return firebaseTools.deploy({cwd: projectDir, only: 'hosting'})
    // Firebase tools opens a persistent websocket connection and the process will never exit.
    .then(() => { console.log('Successfully deployed the demo-app to firebase'); process.exit(0); })
    .catch((err: any) => { console.log(err); process.exit(1); });
});
