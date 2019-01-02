import {bold, red, yellow} from 'chalk';
import {existsSync} from 'fs';
import {sync as glob} from 'glob';
import {join} from 'path';
import {
  checkMaterialPackage,
  checkReleaseBundle,
  checkTypeDefinitionFile
} from './output-validations';

/** Glob that matches all JavaScript bundle files within a release package. */
const releaseBundlesGlob = '+(esm5|esm2015|bundles)/*.js';

/** Glob that matches all TypeScript definition files within a release package. */
const releaseTypeDefinitionsGlob = '**/*.d.ts';

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
export function checkReleasePackage(releasesPath: string, packageName: string): boolean {
  const packagePath = join(releasesPath, packageName);
  const failures = new Map() as PackageFailures;
  const addFailure = (message, filePath?) => {
    failures.set(message, (failures.get(message) || []).concat(filePath));
  };

  const bundlePaths = glob(releaseBundlesGlob, {cwd: packagePath, absolute: true});
  const typeDefinitions = glob(releaseTypeDefinitionsGlob, {cwd: packagePath, absolute: true});

  // We want to walk through each bundle within the current package and run
  // release validations that ensure that the bundles are not invalid.
  bundlePaths.forEach(bundlePath => {
    checkReleaseBundle(bundlePath)
      .forEach(message => addFailure(message, bundlePath));
  });

  // Run output validations for all TypeScript definition files within the release output.
  typeDefinitions.forEach(filePath => {
    checkTypeDefinitionFile(filePath)
      .forEach(message => addFailure(message, filePath));
  });

  // Special release validation checks for the "material" release package.
  if (packageName === 'material') {
    checkMaterialPackage(join(releasesPath, packageName))
      .forEach(message => addFailure(message));
  }

  if (!existsSync(join(packagePath, 'LICENSE'))) {
    addFailure('No license file found in package output.');
  }

  if (!existsSync(join(packagePath, 'README.md'))) {
    addFailure('No "README.md" file found in package output.');
  }

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
  console.error(red(bold(`  ⚠   Package: "${packageName}" has failures:`)));
  failures.forEach((affectedFiles, failureMessage) => {
    console.error(yellow(`  ⮑   ${failureMessage}`));

    if (affectedFiles.length) {
      affectedFiles.forEach(affectedFile => console.error(yellow(`        ${affectedFile}`)));
    }

    // Add an extra line so that subsequent failure message groups are clearly separated.
    console.error();
  });
}
