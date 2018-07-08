/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { resolve } from 'path';
import * as shelljs from 'shelljs';

export function findMetadataPaths(rootPath: string) {
  return shelljs.find(rootPath).filter(p => /\.metadata\.json$/.test(p));
}

export function parseMetadataPath(path: string) {
  const metadataFile = require(resolve(path));

  const filesSet = new Set();
  Object.keys(metadataFile.origins).forEach(key => {
    filesSet.add(metadataFile.origins[key]);
  });
  console.error(filesSet);

  const decorators: any = {};
  Object.keys(metadataFile.metadata).forEach(name => {
    const item = metadataFile.metadata[name];
    if (item.decorators) {
      item.decorators.forEach((decorator: any) => {
        const type = decorator.expression && decorator.expression.name;
        if (type) {
          const decoratorHolder = decorators[type] = decorators[type] || [];
          decoratorHolder.push({ name, type, args: decorator.arguments });
        }
      });
    }
  });

  console.error(decorators);
}
