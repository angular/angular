import {task} from 'gulp';
import {DIST_RELEASES, RELEASE_PACKAGES} from '../build-config';
import {readFileSync} from 'fs';
import {join} from 'path';
import {green, red} from 'chalk';
import {sequenceTask} from '../util/task_helpers';

/** RegExp that matches Angular component inline styles that contain a sourcemap reference. */
const inlineStylesSourcemapRegex = /styles: ?\[["'].*sourceMappingURL=.*["']/;

/** RegExp that matches Angular component metadata properties that refer to external resources. */
const externalReferencesRegex = /(templateUrl|styleUrls): *["'[]/;

task('validate-release', sequenceTask(':publish:build-releases', 'validate-release:check-bundles'));

/** Task that checks the release bundles for any common mistakes before releasing to the public. */
task('validate-release:check-bundles', () => {
  const bundleFailures = RELEASE_PACKAGES
    .map(packageName => join(DIST_RELEASES, packageName, '@angular', `${packageName}.js`))
    .map(packageBundle => checkPackageBundle(packageBundle))
    .map((failures, index) => ({failures, packageName: RELEASE_PACKAGES[index]}));

  bundleFailures.forEach(({failures, packageName}) => {
    failures.forEach(failure => console.error(red(`Failure (${packageName}): ${failure}`)));
  });

  if (bundleFailures.some(({failures}) => failures.length > 0)) {
    // Throw an error to notify Gulp about the failures that have been detected.
    throw 'Release bundles are not valid and ready for being released.';
  } else {
    console.log(green('Release bundles have been checked and are looking fine.'));
  }
});

/** Task that checks the given release bundle for common mistakes. */
function checkPackageBundle(bundlePath: string): string[] {
  const bundleContent = readFileSync(bundlePath, 'utf8');
  const failures = [];

  if (inlineStylesSourcemapRegex.exec(bundleContent) !== null) {
    failures.push('Bundles contain sourcemap references in component styles.');
  }

  if (externalReferencesRegex.exec(bundleContent) !== null) {
    failures.push('Bundles are including references to external resources (templates or styles)');
  }

  return failures;
}
