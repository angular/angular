/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {
  appendHtmlElementToHead,
  getProjectFromWorkspace,
  getProjectIndexFiles,
} from '@angular/cdk/schematics';
import {getWorkspace} from '@schematics/angular/utility/config';
import {Schema} from '../schema';

/** Adds the Material Design fonts to the index HTML file. */
export function addFontsToIndex(options: Schema): (host: Tree) => Tree {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const projectIndexFiles = getProjectIndexFiles(project);

    if (!projectIndexFiles.length) {
      throw new SchematicsException('No project index HTML file could be found.');
    }

    const fonts = [
      'https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap',
      'https://fonts.googleapis.com/icon?family=Material+Icons',
    ];

    fonts.forEach(f => {
      projectIndexFiles.forEach(indexFilePath => {
        appendHtmlElementToHead(host, indexFilePath, `<link href="${f}" rel="stylesheet">`);
      });
    });

    return host;
  };
}
