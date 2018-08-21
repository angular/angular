/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {resolve} from 'path';
import {PackageTransformer} from './transform/package_transformer';

export function mainNgcc(args: string[]): number {
  const packagePath = resolve(args[0]);
  const format = args[1] || 'fesm2015';

  // TODO: find all the package types to transform
  // TODO: error/warning logging/handling etc

  const transformer = new PackageTransformer();
  transformer.transform(packagePath, format);

  return 0;
}
