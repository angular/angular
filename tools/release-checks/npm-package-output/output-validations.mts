import {existsSync, readFileSync} from 'fs';
import glob from 'glob';
import {basename, dirname, isAbsolute, join} from 'path';
import semver from 'semver';

import ts from 'typescript';

/** RegExp that matches Angular component inline styles that contain a sourcemap reference. */
const inlineStylesSourcemapRegex = /styles: ?\[["'].*sourceMappingURL=.*["']/;

/** RegExp that matches Angular component metadata properties that refer to external resources. */
const externalReferencesRegex = /(templateUrl|styleUrls): *["'[]/;

/** RegExp that matches common Bazel manifest paths in this workspace */
const bazelManifestPath = /(angular_material|external)\//;

/**
 * List of fields which are mandatory in entry-point "package.json" files and refer
 * to files in the release output.
 */
const packageJsonPathFields = ['module', 'typings', 'fesm2015', 'fesm2020', 'esm2020'];

/**
 * Checks the specified JavaScript file and ensures that it does not
 * contain any external resource URLs, or Bazel manifest paths.
 */
export function checkJavaScriptOutput(filePath: string): string[] {
  const fileContent = readFileSync(filePath, 'utf8');
  const failures: string[] = [];

  if (inlineStylesSourcemapRegex.exec(fileContent) !== null) {
    failures.push('Found sourcemap references in component styles.');
  }

  if (externalReferencesRegex.exec(fileContent) !== null) {
    failures.push('Found external component resource references');
  }

  if (bazelManifestPath.exec(fileContent) !== null) {
    failures.push('Found Bazel manifest path in output.');
  }

  return failures;
}

/**
 * Checks an entry-point "package.json" file by ensuring that common fields which are
 * specified in the Angular package format are present. Those fields which
 * resolve to paths are checked so that they do not refer to non-existent files.
 */
export function checkEntryPointPackageJsonFile(filePath: string): string[] {
  const fileContent = readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(fileContent);
  const packageJsonDir = dirname(filePath);
  const failures: string[] = [];

  packageJsonPathFields.forEach(fieldName => {
    if (!parsed[fieldName]) {
      failures.push(`Missing field: ${fieldName}`);
      return;
    }

    const resolvedPath = join(packageJsonDir, parsed[fieldName]);

    if (!existsSync(resolvedPath)) {
      failures.push(`File referenced in "${fieldName}" field does not exist.`);
    }
  });

  return failures;
}

/**
 * Checks the specified TypeScript definition file by ensuring it does not contain invalid
 * dynamic import statements. There can be invalid type imports paths because we compose the
 * release package by moving things in a desired output structure. See Angular package format
 * specification and https://github.com/angular/components/pull/12876
 */
export function checkTypeDefinitionFile(filePath: string): string[] {
  const baseDir = dirname(filePath);
  const fileContent = readFileSync(filePath, 'utf8');
  const failures: string[] = [];

  const sourceFile = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);
  const nodeQueue = [...sourceFile.getChildren()];

  while (nodeQueue.length) {
    const node = nodeQueue.shift()!;

    // Check all dynamic type imports and ensure that the import path is valid within the release
    // output. Note that we don't want to enforce that there are no dynamic type imports because
    // type inference is heavily used within the schematics and is useful in some situations.
    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      const importPath = node.argument.literal.text;

      // In case the type import path starts with a dot, we know that this is a relative path
      // and can ensure that the target path exists. Note that we cannot completely rely on
      // "isAbsolute" because dynamic imports can also import from modules (e.g. "my-npm-module")
      if (importPath.startsWith('.') && !existsSync(join(baseDir, `${importPath}.d.ts`))) {
        failures.push('Found relative type imports which do not exist.');
      } else if (isAbsolute(importPath)) {
        failures.push('Found absolute type imports in definition file.');
      }
    }

    nodeQueue.push(...node.getChildren());
  }

  return failures;
}

/**
 * Checks the primary `package.json` file of a release package. Currently we ensure
 * that the version and migrations are set up correctly.
 */
export function checkPrimaryPackageJson(
  packageJsonPath: string,
  expectedVersion: string,
): string[] {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const failures: string[] = [];

  if (!packageJson.version) {
    failures.push(`No version set. Expected: ${expectedVersion}`);
  } else if (packageJson.version !== expectedVersion) {
    failures.push(
      `Unexpected package version. Expected: ${expectedVersion} but got: ${packageJson.version}`,
    );
  } else if (semver.valid(expectedVersion) === null) {
    failures.push(`Version does not satisfy SemVer specification: ${packageJson.version}`);
  }

  return failures;
}

/**
 * Checks the Angular Material release package and ensures that prebuilt themes
 * and the theming bundle are built properly.
 */
export function checkMaterialPackage(packagePath: string): string[] {
  const prebuiltThemesPath = join(packagePath, 'prebuilt-themes');
  const themingFilePath = join(packagePath, '_theming.scss');
  const newThemingFilePath = join(packagePath, '_index.scss');
  const failures: string[] = [];

  if (glob.sync('*.css', {cwd: prebuiltThemesPath}).length === 0) {
    failures.push('No prebuilt themes could be found.');
  }

  if (!existsSync(themingFilePath)) {
    failures.push('Legacy theming bundle could not be found.');
  }

  if (!existsSync(newThemingFilePath)) {
    failures.push('New theming bundle could not be found.');
  }

  return failures;
}

/**
 * Checks whether the prebuilt CDK files are part of the release output.
 */
export function checkCdkPackage(packagePath: string): string[] {
  const prebuiltFiles = glob.sync('*-prebuilt.css', {cwd: packagePath}).map(path => basename(path));
  const newApiFilePath = join(packagePath, '_index.scss');
  const failures = ['overlay', 'a11y', 'text-field']
    .filter(name => !prebuiltFiles.includes(`${name}-prebuilt.css`))
    .map(name => `Could not find the prebuilt ${name} styles.`);

  if (!existsSync(newApiFilePath)) {
    failures.push('New Sass API bundle could not be found.');
  }

  return failures;
}
