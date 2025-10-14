/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {depsTracker} from './deps_tracker/deps_tracker';
export function ɵɵgetComponentDepsFactory(type, rawImports) {
  return () => {
    try {
      return depsTracker.getComponentDependencies(type, rawImports).dependencies;
    } catch (e) {
      console.error(
        `Computing dependencies in local compilation mode for the component "${type.name}" failed with the exception:`,
        e,
      );
      throw e;
    }
  };
}
//# sourceMappingURL=local_compilation.js.map
