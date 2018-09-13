/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Tree} from '@angular-devkit/schematics';
import {getWorkspace} from '@schematics/angular/utility/config';
import {getProjectFromWorkspace} from '../../utils/get-project';
import {Schema} from '../schema';
import {appendElementToHead} from './head-element';

/** Adds the Material Design fonts to the index HTML file. */
export function addFontsToIndex(options: Schema): (host: Tree) => Tree {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    const fonts = [
      'https://fonts.googleapis.com/css?family=Roboto:300,400,500',
      'https://fonts.googleapis.com/icon?family=Material+Icons',
    ];

    fonts.forEach(f => appendElementToHead(host, project, `<link href="${f}" rel="stylesheet">`));

    return host;
  };
}
