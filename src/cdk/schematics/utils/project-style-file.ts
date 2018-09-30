/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize} from '@angular-devkit/core';
import {WorkspaceProject} from '@angular-devkit/core/src/workspace';
import {getProjectTargetOptions} from './project-targets';

/** Regular expression that matches all possible Angular CLI default style files. */
const defaultStyleFileRegex = /styles\.(c|le|sc)ss/;

/** Regular expression that matches all files that have a proper stylesheet extension. */
const validStyleFileRegex = /\.(c|le|sc)ss/;

/**
 * Gets a style file with the given extension in a project and returns its path. If no
 * extension is specified, any style file with a valid extension will be returned.
 */
export function getProjectStyleFile(project: WorkspaceProject, extension?: string): string | null {
  const buildOptions = getProjectTargetOptions(project, 'build');

  if (buildOptions.styles && buildOptions.styles.length) {
    const styles = buildOptions.styles.map(s => typeof s === 'string' ? s : s.input);

    // Look for the default style file that is generated for new projects by the Angular CLI. This
    // default style file is usually called `styles.ext` unless it has been changed explicitly.
    const defaultMainStylePath = styles
      .find(file => extension ? file === `styles.${extension}` : defaultStyleFileRegex.test(file));

    if (defaultMainStylePath) {
      return normalize(defaultMainStylePath);
    }

    // If no default style file could be found, use the first style file that matches the given
    // extension. If no extension specified explicitly, we look for any file with a valid style
    // file extension.
    const fallbackStylePath = styles
      .find(file => extension ? file.endsWith(`.${extension}`) : validStyleFileRegex.test(file));

    if (fallbackStylePath) {
      return normalize(fallbackStylePath);
    }
  }

  return null;
}
