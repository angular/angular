import * as fs from 'fs';

import {runfiles} from '@bazel/runfiles';

interface PackageJson {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Inserts all MDC packages from the project `package.json` to the `dependencies`
 * of the specified base package json file. The output JSON is written to stdout.
 *
 * Note that the MDC version placeholder (from the `/packages.bzl` substitutions)
 * will be used as value for the MDC dependency entries.
 *
 * @param basePackageJsonPath Absolute disk path to the base `package.json` file.
 */
async function main(basePackageJsonPath: string) {
  const projectPkgJsonPath = runfiles.resolveWorkspaceRelative('package.json');
  const projectPkgJson = JSON.parse(
    await fs.promises.readFile(projectPkgJsonPath, 'utf8'),
  ) as PackageJson;

  const mdcDeps = Object.keys(projectPkgJson.devDependencies ?? []).filter(pkgName =>
    pkgName.startsWith('@material/'),
  );

  if (mdcDeps.length === 0) {
    throw new Error('Could not find `@material/` MDC dependencies in project `package.json`.');
  }

  const basePackageJson = JSON.parse(
    await fs.promises.readFile(basePackageJsonPath, 'utf8'),
  ) as PackageJson;

  if (basePackageJson.dependencies === undefined) {
    basePackageJson.dependencies = {};
  }

  // Add all MDC dependencies as explicit `dependencies`.
  for (const pkgName of mdcDeps) {
    basePackageJson.dependencies[pkgName] = '0.0.0-MDC';
  }

  process.stdout.write(JSON.stringify(basePackageJson, null, 2));
}

if (require.main === module) {
  const [basePackageJsonPath] = process.argv.slice(2);
  main(basePackageJsonPath).catch(e => {
    console.error(e);
    process.exitCode = 1;
  });
}
