import {task, watch} from 'gulp';
import {join} from 'path';
import {main as tsc} from '@angular/tsc-wrapped';
import {SOURCE_ROOT, DIST_BUNDLES, DIST_MATERIAL} from '../constants';
import {sequenceTask, sassBuildTask, copyTask, triggerLivereload} from '../util/task_helpers';
import {createRollupBundle} from '../util/rollup-helper';
import {transpileFile} from '../util/ts-compiler';
import {ScriptTarget, ModuleKind} from 'typescript';
import {writeFileSync} from 'fs';

// There are no type definitions available for these imports.
const inlineResources = require('../../../scripts/release/inline-resources');
const uglify = require('uglify-js');

const libraryRoot = join(SOURCE_ROOT, 'lib');
const tsconfigPath = join(libraryRoot, 'tsconfig.json');

// Paths to the different output directories.
const materialDir = DIST_MATERIAL;
const bundlesDir = DIST_BUNDLES;

const esmMainFile = join(materialDir, 'index.js');

task('library:build', sequenceTask(
  'clean',
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
 **/

task('library:build:esm', () => tsc(tsconfigPath, {basePath: libraryRoot}));
task('library:build:bundles', () => buildModuleEntry(esmMainFile));

/** Builds a module entry-point. If no entry name is specified it builds the whole library. */
async function buildModuleEntry(entryFile: string, entryName = '') {
  let baseFileName = entryName ? `material-${entryName}` : 'material';
  let moduleName = entryName ? `ng.material.${entryName}` : 'ng.material';

  // List of paths for the specified entrypoint.
  let fesm2015File = join(bundlesDir, `${baseFileName}.js`);
  let fesm2014File = join(bundlesDir, `${baseFileName}.es5.js`);
  let umdFile = join(bundlesDir, `${baseFileName}.umd.js`);
  let umdMinFile = join(bundlesDir, `${baseFileName}.umd.min.js`);

  // Build FESM-2015 bundle file.
  await createRollupBundle({
    moduleName: moduleName,
    entry: entryFile,
    dest: fesm2015File,
    format: 'es',
  });

  // Downlevel FESM-2015 file to ES5.
  transpileFile(fesm2015File, fesm2014File, {
    target: ScriptTarget.ES5,
    module: ModuleKind.ES2015,
    allowJs: true
  });

  // Create UMD bundle of FESM-2014 output.
  await createRollupBundle({
    moduleName: moduleName,
    entry: fesm2014File,
    dest: umdFile,
    format: 'umd'
  });

  // Output a minified version of the UMD bundle
  writeFileSync(umdMinFile, uglify.minify(umdFile, { preserveComments: 'license' }).code);
}

/**
 * Asset tasks. Building SaSS files and inlining CSS, HTML files into the ESM output.
 **/

task('library:assets', ['library:assets:scss', 'library:assets:html']);

task('library:assets:scss', sassBuildTask(materialDir, libraryRoot, true));
task('library:assets:html', copyTask(join(libraryRoot, '**/*.+(html|scss)'), materialDir));
task('library:assets:inline', () => inlineResources(materialDir));
