import {task, src, dest} from 'gulp';
import {join} from 'path';
import {writeFileSync} from 'fs';
import {Bundler} from 'scss-bundle';
import {execNodeTask, sequenceTask} from '../util/task_helpers';
import {composeRelease} from '../util/package-build';
import {COMPONENTS_DIR, DIST_MATERIAL, DIST_RELEASES} from '../constants';

// There are no type definitions available for these imports.
const gulpRename = require('gulp-rename');

// Path to the release output of material.
const releasePath = join(DIST_RELEASES, 'material');
// The entry-point for the scss theming bundle.
const themingEntryPointPath = join(COMPONENTS_DIR, 'core', 'theming', '_all-theme.scss');
// Output path for the scss theming bundle.
const themingBundlePath = join(releasePath, '_theming.scss');
// Matches all pre-built theme css files
const prebuiltThemeGlob = join(DIST_MATERIAL, '**/theming/prebuilt/*.css');
// Matches all SCSS files in the library.
const allScssGlob = join(COMPONENTS_DIR, '**/*.scss');

/**
 * Overwrite the release task for the material package. The material release will include special
 * files, like a bundled theming SCSS file or all prebuilt themes.
 */
task('material:build-release', ['material:prepare-release'], () => composeRelease('material'));

/**
 * Task that will build the material package. It will also copy all prebuilt themes and build
 * a bundled SCSS file for theming
 */
task('material:prepare-release', sequenceTask(
  'material:build',
  ['material:copy-prebuilt-themes', 'material:bundle-theming-scss']
));

/** Copies all prebuilt themes into the release package under `prebuilt-themes/` */
task('material:copy-prebuilt-themes', () => {
  src(prebuiltThemeGlob)
    .pipe(gulpRename({dirname: ''}))
    .pipe(dest(join(releasePath, 'prebuilt-themes')));
});

/** Bundles all scss requires for theming into a single scss file in the root of the package. */
task('material:bundle-theming-scss', () => {
  // Instantiates the SCSS bundler and bundles all imports of the specified entry point SCSS file.
  // A glob of all SCSS files in the library will be passed to the bundler. The bundler takes an
  // array of globs, which will match SCSS files that will be only included once in the bundle.
  new Bundler().Bundle(themingEntryPointPath, [allScssGlob]).then(result => {
    writeFileSync(themingBundlePath, result.bundledContent);
  });
});
