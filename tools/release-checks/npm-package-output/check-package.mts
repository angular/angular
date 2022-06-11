import {Log, bold, yellow} from '@angular/dev-infra-private/ng-dev';
import {existsSync} from 'fs';
import glob from 'glob';
import {basename, dirname, join} from 'path';

import {
  checkCdkPackage,
  checkEntryPointPackageJsonFile,
  checkJavaScriptOutput,
  checkMaterialPackage,
  checkPrimaryPackageJson,
  checkTypeDefinitionFile,
} from './output-validations.mjs';

/** Glob that matches all JavaScript files within a release package. */
const releaseJsFilesGlob = '+(fesm2015|esm2015|bundles)/**/*.js';

/** Glob that matches all TypeScript definition files within a release package. */
const releaseTypeDefinitionsGlob = '**/*.d.ts';

/** Glob that matches all "package.json" files within a release package. */
const packageJsonFilesGlob = '**/package.json';

/**
 * Type that describes a map of package failures. The keys are failure messages and
 * their value is an array of specifically affected files.
 */
type PackageFailures = Map<string, string[]>;

/**
 * Checks a specified release package against generic and package-specific output validations.
 * Validations are added in order to ensure that build system changes do not cause an
 * unexpected release output (e.g. the theming bundle is no longer generated)
 * @returns Whether the package passed all checks or not.
 */
export function checkReleasePackage(
  packagePath: string,
  packageName: string,
  expectedVersion: string,
): boolean {
  const failures = new Map() as PackageFailures;
  const addFailure = (message: string, filePath?: string) => {
    const filePaths = failures.get(message) || [];
    if (filePath) {
      filePaths.push(filePath);
    }
    failures.set(message, filePaths);
  };

  const jsFiles = glob.sync(releaseJsFilesGlob, {cwd: packagePath, absolute: true});
  const typeDefinitions = glob.sync(releaseTypeDefinitionsGlob, {cwd: packagePath, absolute: true});
  const packageJsonFiles = glob.sync(packageJsonFilesGlob, {cwd: packagePath, absolute: true});

  // We want to walk through each bundle within the current package and run
  // release validations that ensure that the bundles are not invalid.
  jsFiles.forEach(bundlePath => {
    checkJavaScriptOutput(bundlePath).forEach(message => addFailure(message, bundlePath));
  });

  // Run output validations for all TypeScript definition files within the release output.
  typeDefinitions.forEach(filePath => {
    checkTypeDefinitionFile(filePath).forEach(message => addFailure(message, filePath));
  });

  // Check each "package.json" file in the release output. We want to ensure
  // that there are no invalid file references in the entry-point definitions.
  packageJsonFiles.forEach(filePath => {
    // A `package.json` file part of the schematics folder is not considered an
    // entry-point `package.json` file and does not need to be checked.
    if (basename(dirname(filePath)) === 'schematics') {
      return;
    }

    checkEntryPointPackageJsonFile(filePath).forEach(message => addFailure(message, filePath));
  });

  // Special release validation checks for the "material" release package.
  if (packageName === '@angular/material') {
    checkMaterialPackage(packagePath).forEach(message => addFailure(message));
  } else if (packageName === '@angular/cdk') {
    checkCdkPackage(packagePath).forEach(message => addFailure(message));
  }

  if (!existsSync(join(packagePath, 'LICENSE'))) {
    addFailure('No license file found in package output.');
  }

  if (!existsSync(join(packagePath, 'README.md'))) {
    addFailure('No "README.md" file found in package output.');
  }

  checkPrimaryPackageJson(join(packagePath, 'package.json'), expectedVersion).forEach(f =>
    addFailure(f),
  );

  // In case there are failures for this package, we want to print those
  // and return a value that implies that there were failures.
  if (failures.size) {
    printGroupedFailures(packageName, failures);
    return false;
  }

  return true;
}

/** Prints the grouped failures for a specified package. */
function printGroupedFailures(packageName: string, failures: PackageFailures) {
  Log.error(bold(`  ⚠   Package: "${packageName}" has failures:`));
  failures.forEach((affectedFiles, failureMessage) => {
    Log.error(yellow(`  ⮑   ${failureMessage}`));

    if (affectedFiles.length) {
      affectedFiles.forEach(affectedFile => {
        Log.error(yellow(`        ${affectedFile}`));
      });
    }

    // Add an extra line so that subsequent failure message groups are clearly separated.
    Log.error();
  });
}
