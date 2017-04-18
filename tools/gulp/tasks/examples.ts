import {task} from 'gulp';
import {join} from 'path';
import {main as tsc} from '@angular/tsc-wrapped';
import {SOURCE_ROOT, DIST_EXAMPLES} from '../constants';
import {sequenceTask, copyTask} from '../util/task_helpers';
import {buildPackageBundles, composeRelease} from '../util/package-build';

// There are no type definitions available for these imports.
const inlineResources = require('../../../scripts/release/inline-resources');

const examplesRoot = join(SOURCE_ROOT, 'material-examples');
const tsconfigPath = join(examplesRoot, 'tsconfig-build.json');

// Paths to the different output files and directories.
const examplesOut = DIST_EXAMPLES;
const examplesMain = join(examplesOut, 'index.js');

task('examples:clean-build', sequenceTask('clean', 'examples:build'));

task('examples:build', sequenceTask(
  // The examples depend on the library. Build the library first.
  'library:build',
  // Build ESM and copy HTML assets to the dist.
  ['examples:build:esm', 'examples:assets:html'],
  // Inline assets into ESM output.
  'examples:assets:inline',
  // Build bundles on top of inlined ESM output.
  'examples:build:bundles',
));

task('examples:build-release', ['examples:build'], () => composeRelease('material-examples'));
task('examples:build-release:clean', sequenceTask('clean', 'examples:build-release'));

/**
 * TypeScript compilation tasks. Tasks are creating ESM, FESM, UMD bundles for releases.
 */

task('examples:build:esm', () => tsc(tsconfigPath, {basePath: examplesRoot}));
task('examples:build:bundles', () => buildPackageBundles(examplesMain, 'material-examples'));

/**
 * Asset tasks. Copying and inlining CSS, HTML files into the ESM output.
 */

task('examples:assets:html', copyTask(join(examplesRoot, '**/*.+(html|css)'), examplesOut));
task('examples:assets:inline', () => inlineResources(examplesOut));
