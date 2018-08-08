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
  const packagePaths = args[0] ? [resolve(args[0])] : [];
  const formats = args[1] ? [args[1]] : ['fesm2015', 'esm2015', 'fesm5', 'esm5'];

  // TODO: find all the package types to transform
  // TODO: error/warning logging/handling etc

  const transformer = new PackageTransformer();
  packagePaths.forEach(packagePath => {
    formats.forEach(format => {
      console.warn(`Compiling ${packagePath}:${format}`);
      transformer.transform(packagePath, format);
    });
  });

  return 0;
}
