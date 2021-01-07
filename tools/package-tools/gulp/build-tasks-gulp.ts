import {dest, src, task, series} from 'gulp';
import {join} from 'path';
import {BuildPackage} from '../build-package';
import {inlineResourcesForDirectory} from '../inline-resources';
import {buildScssPipeline} from './build-scss-pipeline';

/**
 * Creates a set of gulp tasks that can build the specified package.
 * @param buildPackage Build package for which the gulp tasks will be generated
 * @param preBuildTasks List of gulp tasks that should run before building the package.
 */
export function createPackageBuildTasks(buildPackage: BuildPackage) {
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

  task(`${taskName}:assets:scss`, () =>
    buildScssPipeline(buildPackage.sourceDir).pipe(dest(buildPackage.outputDir)));
  task(`${taskName}:assets:copy-styles`, () => src(styleGlobs).pipe(dest(buildPackage.outputDir)));
  task(`${taskName}:assets:html`, () => src(htmlGlob).pipe(dest(buildPackage.outputDir)));
  task(`${taskName}:assets:inline`, done => {
    inlineResourcesForDirectory(buildPackage.outputDir);
    done();
  });

  /**
   * Asset tasks. Building Sass files and inlining CSS, HTML files into the ESM output.
   */
  task(`${taskName}:assets`, series(
    `${taskName}:assets:scss`,
    `${taskName}:assets:copy-styles`,
    `${taskName}:assets:html`
  ));

  /**
   * TypeScript compilation tasks. Tasks are creating ESM, FESM, UMD bundles for releases.
   */
  task(`${taskName}:build:esm:tests`, () => buildPackage.compileTests());

  task(`${taskName}:build-no-bundles`, series(
    // Build assets before building the ESM output. Since we compile with NGC, the compiler
    // tries to resolve all required assets.
    `${taskName}:assets`,
    // Build the ESM output that includes all test files. Also build assets for the package.
    `${taskName}:build:esm:tests`,
    // Inline assets into ESM output.
    `${taskName}:assets:inline`
  ));
}
