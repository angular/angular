import {existsSync, readFileSync} from 'fs';
import {sync as glob} from 'glob';
import {join} from 'path';

/** RegExp that matches Angular component inline styles that contain a sourcemap reference. */
const inlineStylesSourcemapRegex = /styles: ?\[["'].*sourceMappingURL=.*["']/;

/** RegExp that matches Angular component metadata properties that refer to external resources. */
const externalReferencesRegex = /(templateUrl|styleUrls): *["'[]/;

/**
 * Checks the specified release bundle and ensures that it does not contain
 * any external resource URLs.
 */
export function checkReleaseBundle(bundlePath: string): string[] {
  const bundleContent = readFileSync(bundlePath, 'utf8');
  let failures: string[] = [];

  if (inlineStylesSourcemapRegex.exec(bundleContent) !== null) {
    failures.push('Found sourcemap references in component styles.');
  }

  if (externalReferencesRegex.exec(bundleContent) !== null) {
    failures.push('Found external component resource references');
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
  const failures: string[] = [];

  if (glob('*.css', {cwd: prebuiltThemesPath}).length === 0) {
    failures.push('No prebuilt themes could be found.');
  }

  if (!existsSync(themingFilePath)) {
    failures.push('The theming bundle could not be found.');
  }

  return failures;
}
