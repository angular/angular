import {task, watch} from 'gulp';
import {join} from 'path';
import {main as tsc} from '@angular/tsc-wrapped';
import {SOURCE_ROOT, DIST_CDK} from '../constants';
import {sequenceTask, sassBuildTask, copyTask, triggerLivereload} from '../util/task_helpers';
import {buildPackageBundles, composeRelease} from '../util/package-build';

// There are no type definitions available for these imports.
const inlineResources = require('../../../scripts/release/inline-resources');

const cdkRoot = join(SOURCE_ROOT, 'cdk');

const tsconfigBuild = join(cdkRoot, 'tsconfig-build.json');
const tsconfigTests = join(cdkRoot, 'tsconfig-tests.json');

// Paths to the different output files and directories.
const esmMainFile = join(DIST_CDK, 'index.js');

task('cdk:clean-build', sequenceTask('clean', 'cdk:build'));

task('cdk:build', sequenceTask(
  ['cdk:build:esm', 'cdk:assets'],
  // Inline assets into ESM output.
  'cdk:assets:inline',
  // Build bundles on top of inlined ESM output.
  'cdk:build:bundles',
));

task('cdk:build-release', ['cdk:build'], () => composeRelease('cdk'));
task('cdk:build-release:clean', sequenceTask('clean', 'cdk:build-release'));

/** [Watch task] Rebuilds the CDK whenever TS, SCSS, or HTML files change. */
task('cdk:watch', () => {
  watch(join(cdkRoot, '**/*.ts'), ['cdk:build', triggerLivereload]);
  watch(join(cdkRoot, '**/*.scss'), ['cdk:build', triggerLivereload]);
  watch(join(cdkRoot, '**/*.html'), ['cdk:build', triggerLivereload]);
});

/**
 * TypeScript compilation tasks. Tasks are creating ESM, FESM, UMD bundles for releases.
 */

task('cdk:build:esm', () => tsc(tsconfigBuild, {basePath: cdkRoot}));
task('cdk:build:bundles', () => buildPackageBundles(esmMainFile, 'cdk'));

task('cdk:build:esm:tests', () => tsc(tsconfigTests, {basePath: cdkRoot}));

/**
 * Asset tasks. Building SASS files and inlining CSS, HTML files into the ESM output.
 */

task('cdk:assets', ['cdk:assets:scss', 'cdk:assets:html']);

task('cdk:assets:scss', sassBuildTask(DIST_CDK, cdkRoot, true));
task('cdk:assets:html', copyTask(join(cdkRoot, '**/*.+(html|scss)'), DIST_CDK));
task('cdk:assets:inline', () => inlineResources(DIST_CDK));
