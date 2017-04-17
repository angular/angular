import {task, watch} from 'gulp';
import {join} from 'path';
import {main as tsc} from '@angular/tsc-wrapped';
import {SOURCE_ROOT, DIST_MATERIAL} from '../constants';
import {sequenceTask, sassBuildTask, copyTask, triggerLivereload} from '../util/task_helpers';
import {buildPackageBundles} from '../util/package-build';

// There are no type definitions available for these imports.
const inlineResources = require('../../../scripts/release/inline-resources');

const libraryRoot = join(SOURCE_ROOT, 'lib');
const tsconfigBuild = join(libraryRoot, 'tsconfig-build.json');
const tsconfigTests = join(libraryRoot, 'tsconfig-tests.json');

// Paths to the different output files and directories.
const materialDir = DIST_MATERIAL;
const esmMainFile = join(materialDir, 'index.js');

task('library:clean-build', sequenceTask('clean', 'library:build'));

task('library:build', sequenceTask(
  // Library depends on the CDK package. Build the CDK package first.
  'cdk:build',
  // Build assets and ESM output concurrently.
  ['library:build:esm', 'library:assets'],
  // Inline assets into ESM output.
  'library:assets:inline',
  // Build bundles on top of inlined ESM output.
  'library:build:bundles',
));

/** [Watch task] Rebuilds the library whenever TS, SCSS, or HTML files change. */
task('library:watch', () => {
  watch(join(libraryRoot, '**/*.ts'), ['library:build', triggerLivereload]);
  watch(join(libraryRoot, '**/*.scss'), ['library:build', triggerLivereload]);
  watch(join(libraryRoot, '**/*.html'), ['library:build', triggerLivereload]);
});

/**
 * TypeScript compilation tasks. Tasks are creating ESM, FESM, UMD bundles for releases.
 */

task('library:build:esm', () => tsc(tsconfigBuild, {basePath: libraryRoot}));
task('library:build:bundles', () => buildPackageBundles(esmMainFile, 'material'));

task('library:build:esm:tests', () => tsc(tsconfigTests, {basePath: libraryRoot}));

/**
 * Asset tasks. Building SaSS files and inlining CSS, HTML files into the ESM output.
 */

task('library:assets', ['library:assets:scss', 'library:assets:html']);

task('library:assets:scss', sassBuildTask(materialDir, libraryRoot, true));
task('library:assets:html', copyTask(join(libraryRoot, '**/*.+(html|scss)'), materialDir));
task('library:assets:inline', () => inlineResources(materialDir));
