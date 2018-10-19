import {dest, src, task} from 'gulp';
import {join} from 'path';
import {tsCompile} from '../ts-compile';
import {composeRelease} from '../build-release';
import {inlineResourcesForDirectory} from '../inline-resources';
import {buildScssPipeline} from './build-scss-pipeline';
import {sequenceTask} from './sequence-task';
import {watchFiles} from './watch-files';
import {BuildPackage} from '../build-package';

// There are no type definitions available for these imports.
const htmlmin = require('gulp-htmlmin');

const htmlMinifierOptions = {
  collapseWhitespace: true,
  removeComments: true,
  caseSensitive: true,
  removeAttributeQuotes: false
};

/**
 * Creates a set of gulp tasks that can build the specified package.
 * @param buildPackage Build package for which the gulp tasks will be generated
 * @param preBuildTasks List of gulp tasks that should run before building the package.
 */
export function createPackageBuildTasks(buildPackage: BuildPackage, preBuildTasks: string[] = []) {
  // Name of the package build tasks for Gulp.
  const taskName = buildPackage.name;

  // Name of all dependencies of the current package.
  const dependencyNames = buildPackage.dependencies.map(p => p.name);

  // Glob that matches all style files that need to be copied to the package output. Besides CSS
  // files that will be copied (e.g. in the examples package), we copy the source SCSS files that
  // start with an underscore. These files can be packaged into the release output if the
  // build package `copySecondaryEntryPointStylesToRoot` option is enabled (e.g. _overlay.scss).
  const styleGlobs = [
    join(buildPackage.sourceDir, '**/*.css'),
    join(buildPackage.sourceDir, '**/_*.scss'),
  ];

  // Glob that matches every HTML file in the current package.
  const htmlGlob = join(buildPackage.sourceDir, '**/*.html');

  // List of watch tasks that need run together with the watch task of the current package.
  const dependentWatchTasks = buildPackage.dependencies.map(p => `${p.name}:watch`);

  // Path to the schematics output directory if the build package has schematics.
  const schematicsDir = join(buildPackage.sourceDir, 'schematics');

  // Pattern matching schematics files to be copied into the output directory.
  const schematicsGlobs = [
    join(schematicsDir, '**/+(data|files)/**/*'),
    join(schematicsDir, '**/+(schema|collection|migration).json'),
  ];

  /**
   * Main tasks for the package building. Tasks execute the different sub-tasks in the correct
   * order.
   */
  task(`${taskName}:clean-build`, sequenceTask('clean', `${taskName}:build`));

  task(`${taskName}:build`, sequenceTask(
    // Run the pre build gulp tasks.
    ...preBuildTasks,
    // Build all required packages before building.
    ...dependencyNames.map(pkgName => `${pkgName}:build`),
    // Build ESM and assets output.
    `${taskName}:assets`,
    `${taskName}:build:esm`,
    // Inline assets into ESM output.
    `${taskName}:assets:inline`,
    // Build bundles on top of inlined ESM output.
    `${taskName}:build:bundles`,
  ));

  task(`${taskName}:build-no-bundles`, sequenceTask(
    // Build assets before building the ESM output. Since we compile with NGC, the compiler
    // tries to resolve all required assets.
    `${taskName}:assets`,
    // Build the ESM output that includes all test files. Also build assets for the package.
    `${taskName}:build:esm:tests`,
    // Inline assets into ESM output.
    `${taskName}:assets:inline`
  ));

  /**
   * Release tasks for the package. Tasks compose the release output for the package.
   */

  task(`${taskName}:build-release:clean`, sequenceTask('clean', `${taskName}:build-release`));
  task(`${taskName}:build-release`, [`${taskName}:build`], () => composeRelease(buildPackage));

  /**
   * TypeScript compilation tasks. Tasks are creating ESM, FESM, UMD bundles for releases.
   */

  task(`${taskName}:build:esm`, () => buildPackage.compile());
  task(`${taskName}:build:esm:tests`, () => buildPackage.compileTests());

  task(`${taskName}:build:bundles`, () => buildPackage.createBundles());

  /**
   * Asset tasks. Building Sass files and inlining CSS, HTML files into the ESM output.
   */
  const assetTasks = [
    `${taskName}:assets:scss`,
    `${taskName}:assets:copy-styles`,
    `${taskName}:assets:html`
  ];

  // In case the build package has schematics, we need to build them like assets because
  // those are not intended to be entry-points.
  if (buildPackage.hasSchematics) {
    assetTasks.push(`${taskName}:assets:schematics`);
  }

  task(`${taskName}:assets`, assetTasks);

  task(`${taskName}:assets:scss`, () => {
    buildScssPipeline(buildPackage.sourceDir, true)
      .pipe(dest(buildPackage.outputDir))
      .pipe(dest(buildPackage.esm5OutputDir));
    }
  );

  task(`${taskName}:assets:copy-styles`, () => {
    return src(styleGlobs)
        .pipe(dest(buildPackage.outputDir))
        .pipe(dest(buildPackage.esm5OutputDir));
  });

  task(`${taskName}:assets:html`, () => {
    return src(htmlGlob).pipe(htmlmin(htmlMinifierOptions))
        .pipe(dest(buildPackage.outputDir))
        .pipe(dest(buildPackage.esm5OutputDir));
  });

  task(`${taskName}:assets:inline`, () => inlineResourcesForDirectory(buildPackage.outputDir));

  task(`${taskName}:assets:schematics-ts`, () => {
    return tsCompile('tsc', ['-p', join(schematicsDir, 'tsconfig.json')]);
  });

  task(`${taskName}:assets:schematics`, [`${taskName}:assets:schematics-ts`], () => {
    return src(schematicsGlobs).pipe(dest(join(buildPackage.outputDir, 'schematics')));
  });

  /**
   * Watch tasks, that will rebuild the package whenever TS, SCSS, or HTML files change.
   */
  task(`${taskName}:watch`, dependentWatchTasks, () => {
    watchFiles(join(buildPackage.sourceDir, '**/*.+(ts|scss|html)'), [`${taskName}:build`]);
  });
}
