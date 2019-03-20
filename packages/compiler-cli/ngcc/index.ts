/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {hasBeenProcessed as _hasBeenProcessed} from './src/packages/build_marker';
import {EntryPointJsonProperty, EntryPointPackageJson} from './src/packages/entry_point';

export {NgccOptions, mainNgcc as process} from './src/main';

export function hasBeenProcessed(packageJson: object, format: string) {
  // We are wrapping this function to hide the internal types.
  return _hasBeenProcessed(packageJson as EntryPointPackageJson, format as EntryPointJsonProperty);
}
