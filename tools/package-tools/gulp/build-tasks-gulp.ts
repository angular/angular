import {dest, src, task} from 'gulp';
import {join} from 'path';
import {BuildPackage} from '../build-package';
import {inlineResourcesForDirectory} from '../inline-resources';
import {buildScssPipeline} from './build-scss-pipeline';
import {sequenceTask} from './sequence-task';

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
   * TypeScript compilation tasks. Tasks are creating ESM, FESM, UMD bundles for releases.
   */

  task(`${taskName}:build:esm:tests`, () => buildPackage.compileTests());

  /**
   * Asset tasks. Building Sass files and inlining CSS, HTML files into the ESM output.
   */
  const assetTasks = [
    `${taskName}:assets:scss`,
    `${taskName}:assets:copy-styles`,
    `${taskName}:assets:html`
  ];

  task(`${taskName}:assets`, assetTasks);

  task(`${taskName}:assets:scss`, () => {
    return buildScssPipeline(buildPackage.sourceDir, true)
      .pipe(dest(buildPackage.outputDir));
    }
  );

  task(`${taskName}:assets:copy-styles`, () => {
    return src(styleGlobs)
        .pipe(dest(buildPackage.outputDir));
  });

  task(`${taskName}:assets:html`, () => {
    return src(htmlGlob).pipe(htmlmin(htmlMinifierOptions))
        .pipe(dest(buildPackage.outputDir));
  });

  task(`${taskName}:assets:inline`, () => {
    return inlineResourcesForDirectory(buildPackage.outputDir);
  });
}
