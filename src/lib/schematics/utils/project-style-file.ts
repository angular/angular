/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize} from '@angular-devkit/core';
import {SchematicsException} from '@angular-devkit/schematics';
import {WorkspaceProject} from '@schematics/angular/utility/config';

/** Looks for the primary style file for a given project and returns its path. */
export function getProjectStyleFile(project: WorkspaceProject): string {
  const buildTarget = project.architect['build'];

  if (buildTarget.options && buildTarget.options.styles && buildTarget.options.styles.length) {
    const styles = buildTarget.options.styles.map(s => typeof s === 'string' ? s : s.input);

    // First, see if any of the assets is called "styles.(le|sc|c)ss", which is the default
    // "main" style sheet.
    const defaultMainStylePath = styles.find(a => /styles\.(c|le|sc)ss/.test(a));
    if (defaultMainStylePath) {
      return normalize(defaultMainStylePath);
    }

    // If there was no obvious default file, use the first style asset.
    const fallbackStylePath = styles.find(a => /\.(c|le|sc)ss/.test(a));
    if (fallbackStylePath) {
      return normalize(fallbackStylePath);
    }
  }

  throw new SchematicsException('No style files could be found into which a theme could be added.');
}
