import {Log, bold, yellow, ReleasePrecheckError} from '@angular/ng-dev';
import {existsSync, readFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import semver from 'semver';

import {releasePackages} from '../../.ng-dev/release.mjs';

/** Path to the current directory. */
const currentDir = dirname(fileURLToPath(import.meta.url));

/** Path to the directory containing all package sources. */
const packagesDir = join(currentDir, '../../src');

/** Asserts that valid migration collections for `ng-update` are configured. */
export async function assertValidUpdateMigrationCollections(newVersion: semver.SemVer) {
  const failures: string[] = [];
  releasePackages.forEach(packageName => {
    const packageDir = join(packagesDir, packageName);
    let packageJsonPath = join(packageDir, 'package.json');

    // Some `package.json` files are auto-generated. In such cases we will have
    // a `package-base.json` file (as seen in the `material-experimental` package).
    // This will be the handwritten base config we use for validation.
    if (!existsSync(packageJsonPath)) {
      packageJsonPath = join(packageDir, 'package-base.json');
    }

    failures.push(
      ...checkPackageJsonMigrations(packageJsonPath, newVersion).map(f =>
        yellow(`       ⮑  ${bold(packageName)}: ${f}`),
      ),
    );
  });
  if (failures.length) {
    Log.error(`  ✘   Failures in ng-update migration collection detected:`);
    failures.forEach(f => Log.error(f));
    throw new ReleasePrecheckError();
  }
}

/**
 * Checks the ng-update migration setup for the specified `package.json`
 * file if present.
 */
export function checkPackageJsonMigrations(
  packageJsonPath: string,
  currentVersion: semver.SemVer,
): string[] {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  if (packageJson['ng-update'] && packageJson['ng-update'].migrations) {
    return checkMigrationCollection(
      packageJson['ng-update'].migrations,
      dirname(packageJsonPath),
      currentVersion,
    );
  }
  return [];
}

/**
 * Checks if the migration collected referenced in the specified `package.json`
 * has a migration set up for the given target version.
 */
function checkMigrationCollection(
  collectionPath: string,
  packagePath: string,
  targetVersion: semver.SemVer,
): string[] {
  const collection = JSON.parse(readFileSync(join(packagePath, collectionPath), 'utf8'));
  if (!collection.schematics) {
    return ['No schematics found in migration collection.'];
  }

  const failures: string[] = [];
  const lowerBoundaryVersion = `${targetVersion.major}.0.0-0`;
  const schematics = collection.schematics;
  const targetSchematics = Object.keys(schematics).filter(name => {
    const schematicVersion = schematics[name].version;
    try {
      return (
        schematicVersion &&
        semver.gte(schematicVersion, lowerBoundaryVersion) &&
        semver.lte(schematicVersion, targetVersion)
      );
    } catch {
      failures.push(`Could not parse version for migration: ${name}`);
    }
  });

  if (targetSchematics.length === 0) {
    failures.push(`No migration configured that handles versions: ^${lowerBoundaryVersion}`);
  } else if (targetSchematics.length > 1) {
    failures.push(`Multiple migrations targeting the same major version: ${targetVersion.major}`);
  }
  return failures;
}
