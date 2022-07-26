import semver from 'semver';
import {checkReleasePackage} from './check-package.mjs';
import {BuiltPackage, Log, ReleasePrecheckError} from '@angular/ng-dev';

/** Asserts that the given built packages are valid for public consumption. */
export async function assertValidNpmPackageOutput(
  builtPackages: BuiltPackage[],
  currentVersion: semver.SemVer,
) {
  let passing = true;

  for (const {name, outputPath} of builtPackages) {
    passing = passing && checkReleasePackage(outputPath, name, currentVersion.format());
  }

  if (!passing) {
    Log.error(`  ✘   NPM package output does not pass all release validations.`);
    throw new ReleasePrecheckError();
  }
}
