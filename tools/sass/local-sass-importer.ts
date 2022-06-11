import {pathToFileURL} from 'url';
import {join} from 'path';

// TODO: Add explicit type for `Sass.FileImporter` once
//  https://github.com/sass/dart-sass/issues/1714 is fixed.

/** Prefix indicating Angular-owned Sass imports. */
const angularPrefix = '@angular/';

/**
 * Creates a Sass `FileImporter` that resolves `@angular/<..>` packages to the
 * specified local packages directory.
 */
export function createLocalAngularPackageImporter(packageDirAbsPath: string) {
  return {
    findFileUrl: (url: string) => {
      if (url.startsWith(angularPrefix)) {
        return pathToFileURL(join(packageDirAbsPath, url.substring(angularPrefix.length)));
      }
      return null;
    },
  };
}
