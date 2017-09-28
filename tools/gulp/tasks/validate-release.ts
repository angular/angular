import {task} from 'gulp';
import {readFileSync, existsSync} from 'fs';
import {join} from 'path';
import {green, red} from 'chalk';
import {releasePackages} from './publish';
import {sync as glob} from 'glob';
import {buildConfig, sequenceTask} from 'material2-build-tools';

/** Path to the directory where all releases are created. */
const releasesDir = join(buildConfig.outputDir, 'releases');

/** RegExp that matches Angular component inline styles that contain a sourcemap reference. */
const inlineStylesSourcemapRegex = /styles: ?\[["'].*sourceMappingURL=.*["']/;

/** RegExp that matches Angular component metadata properties that refer to external resources. */
const externalReferencesRegex = /(templateUrl|styleUrls): *["'[]/;

task('validate-release', sequenceTask(':publish:build-releases', 'validate-release:check-bundles'));

/** Task that checks the release bundles for any common mistakes before releasing to the public. */
task('validate-release:check-bundles', () => {
  const releaseFailures = releasePackages
    .map(packageName => checkReleasePackage(packageName))
    .map((failures, index) => ({failures, packageName: releasePackages[index]}));

  releaseFailures.forEach(({failures, packageName}) => {
    failures.forEach(failure => console.error(red(`Failure (${packageName}): ${failure}`)));
  });

  if (releaseFailures.some(({failures}) => failures.length > 0)) {
    // Throw an error to notify Gulp about the failures that have been detected.
    throw 'Release output is not valid and not ready for being released.';
  } else {
    console.log(green('Release output has been checked and everything looks fine.'));
  }
});

/** Task that validates the given release package before releasing. */
function checkReleasePackage(packageName: string): string[] {
  return glob(join(releasesDir, packageName, 'esm2015/*.js'))
    .reduce((failures: string[], bundlePath: string) => {
      return failures.concat(checkEs2015ReleaseBundle(packageName, bundlePath));
    }, []);
}

/**
 * Checks an ES2015 bundle inside of a release package. Secondary entry-point bundles will be
 * checked as well.
 */
function checkEs2015ReleaseBundle(packageName: string, bundlePath: string): string[] {
  const bundleContent = readFileSync(bundlePath, 'utf8');
  let failures: string[] = [];

  if (inlineStylesSourcemapRegex.exec(bundleContent) !== null) {
    failures.push('Bundles contain sourcemap references in component styles.');
  }

  if (externalReferencesRegex.exec(bundleContent) !== null) {
    failures.push('Bundles are including references to external resources (templates or styles)');
  }

  if (packageName === 'material') {
    failures = failures.concat(checkMaterialPackage());
  }

  return failures;
}

/** Function that includes special checks for the Material package. */
function checkMaterialPackage(): string[] {
  const packagePath = join(releasesDir, 'material');
  const prebuiltThemesPath = join(packagePath, 'prebuilt-themes');
  const themingFilePath = join(packagePath, '_theming.scss');
  const failures: string[] = [];

  if (glob('*.css', {cwd: prebuiltThemesPath}).length === 0) {
    failures.push('Prebuilt themes are not present in the Material release output.');
  }

  if (!existsSync(themingFilePath)) {
    failures.push('The theming SCSS file is not present in the Material release output.');
  }

  return failures;
}
