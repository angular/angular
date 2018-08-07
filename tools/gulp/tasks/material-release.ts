import {task, src, dest} from 'gulp';
import {join} from 'path';
import {writeFileSync, mkdirpSync} from 'fs-extra';
import {Bundler} from 'scss-bundle';
import {composeRelease, buildConfig, sequenceTask} from 'material2-build-tools';
import {materialPackage} from '../packages';
import {tsBuildTask} from '../util/task_helpers';


// There are no type definitions available for these imports.
const gulpRename = require('gulp-rename');

const distDir = buildConfig.outputDir;
const {sourceDir, outputDir} = materialPackage;
const schematicsDir = join(sourceDir, 'schematics');

/** Path to the directory where all releases are created. */
const releasesDir = join(distDir, 'releases');

// Path to the release output of material.
const releasePath = join(releasesDir, 'material');

// The entry-point for the scss theming bundle.
const themingEntryPointPath = join(sourceDir, 'core', 'theming', '_all-theme.scss');

// Output path for the scss theming bundle.
const themingBundlePath = join(releasePath, '_theming.scss');

// Matches all pre-built theme css files
const prebuiltThemeGlob = join(outputDir, '**/theming/prebuilt/*.css?(.map)');

// Matches all SCSS files in the different packages. Note that this glob is not used to build
// the bundle. It's used to identify Sass files that shouldn't be included multiple times.
const allScssDedupeGlob = join(buildConfig.packagesDir, '**/*.scss');

// Pattern matching schematics files to be copied into the @angular/material package.
const schematicsGlobs = [
  // File templates and schemas are copied as-is from source.
  join(schematicsDir, '**/+(data|files)/**/*'),
  join(schematicsDir, '**/+(schema|collection|migration).json'),

  // JavaScript files compiled from the TypeScript sources.
  join(distDir, 'schematics', '**/*.js?(.map)'),
];

/**
 * Overwrite the release task for the material package. The material release will include special
 * files, like a bundled theming SCSS file or all prebuilt themes.
 */
task('material:build-release', ['material:prepare-release'], () => composeRelease(materialPackage));

/** Compile the schematics TypeScript to JavaScript */
task('schematics:build', tsBuildTask(join(schematicsDir, 'tsconfig.json')));

/**
 * Task that will build the material package. Special treatment for this package includes:
 * - Copying all prebuilt themes into the package
 * - Bundling theming scss into a single theming file
 * - Copying schematics code into the package
 */
task('material:prepare-release', sequenceTask(
  ['material:build', 'schematics:build'],
  ['material:copy-prebuilt-themes', 'material:bundle-theming-scss', 'material:copy-schematics'],
));

task('material:copy-schematics', () => {
  return src(schematicsGlobs).pipe(dest(join(releasePath, 'schematics')));
});

/** Copies all prebuilt themes into the release package under `prebuilt-themes/` */
task('material:copy-prebuilt-themes', () => {
  return src(prebuiltThemeGlob)
    .pipe(gulpRename({dirname: ''}))
    .pipe(dest(join(releasePath, 'prebuilt-themes')));
});

/** Bundles all scss requires for theming into a single scss file in the root of the package. */
task('material:bundle-theming-scss', () => {
  // Instantiates the SCSS bundler and bundles all imports of the specified entry point SCSS file.
  // A glob of all SCSS files in the library will be passed to the bundler. The bundler takes an
  // array of globs, which will match SCSS files that will be only included once in the bundle.
  return new Bundler().Bundle(themingEntryPointPath, [allScssDedupeGlob]).then(result => {
    // The release directory is not created yet because the composing of the release happens when
    // this task finishes.
    mkdirpSync(releasePath);
    writeFileSync(themingBundlePath, result.bundledContent);
  });
});
