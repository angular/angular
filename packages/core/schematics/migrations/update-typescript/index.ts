/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {addPackageJsonDependency, getPackageJsonDependency} from '@schematics/angular/utility/dependencies';


/**
 * Runs the update TS migration for the current CLI workspace.
 */
export default function(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const dependenciesToUpdate = {
      '@types/node': '^12.11.1',
      typescript: '~3.6.4',
    };

    for (const [name, version] of Object.entries(dependenciesToUpdate)) {
      const current = getPackageJsonDependency(tree, name);

      if (!current || current.version === version) {
        continue;
      }

      addPackageJsonDependency(tree, {
        type: current.type,
        name,
        version,
        overwrite: true,
      });
    }

    context.addTask(new NodePackageInstallTask());
  };
}
