/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of the common package.
 */

import {Serializer} from '@angular/compiler';
import * as path from 'path';

export function getI18nSerializer(serializerPath: string): Serializer {
  let serializerClass: any = null;
  if (serializerPath.startsWith('.')) {
    const fullPath = path.join(process.cwd(), serializerPath);
    serializerClass = require(path.relative(__dirname, fullPath));
  } else if (serializerPath.startsWith('/')) {
    serializerClass = require(path.relative(__dirname, serializerPath));
  } else {
    serializerClass = require(serializerPath);
  }
  return serializerClass ? new serializerClass() : null;
}
