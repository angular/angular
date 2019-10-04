/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {JsonParseMode, parseJsonAst} from '@angular-devkit/core';
import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {appendPropertyInAstObject, findPropertyInAstObject, insertPropertyInAstObjectInOrder} from '@schematics/angular/utility/json-utils';


/**
 * Runs the ngcc postinstall migration for the current CLI workspace.
 */
export default function(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    addPackageJsonScript(
        tree, 'postinstall',
        'ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points');
    context.addTask(new NodePackageInstallTask());
  };
}

function addPackageJsonScript(tree: Tree, scriptName: string, script: string): void {
  const pkgJsonPath = '/package.json';

  // Read package.json and turn it into an AST.
  const buffer = tree.read(pkgJsonPath);
  if (buffer === null) {
    throw new SchematicsException('Could not read package.json.');
  }
  const content = buffer.toString();

  const packageJsonAst = parseJsonAst(content, JsonParseMode.Strict);
  if (packageJsonAst.kind != 'object') {
    throw new SchematicsException('Invalid package.json. Was expecting an object.');
  }

  // Begin recording changes.
  const recorder = tree.beginUpdate(pkgJsonPath);
  const scriptsNode = findPropertyInAstObject(packageJsonAst, 'scripts');

  if (!scriptsNode) {
    // Haven't found the scripts key, add it to the root of the package.json.
    appendPropertyInAstObject(
        recorder, packageJsonAst, 'scripts', {
          [scriptName]: script,
        },
        2);
  } else if (scriptsNode.kind === 'object') {
    // Check if the script is already there.
    const scriptNode = findPropertyInAstObject(scriptsNode, scriptName);

    if (!scriptNode) {
      // Script not found, add it.
      insertPropertyInAstObjectInOrder(recorder, scriptsNode, scriptName, script, 4);
    } else {
      // Script found, prepend the new script with &&.
      const currentScript = scriptNode.value;
      if (typeof currentScript == 'string') {
        // Only add script if there's no ngcc call there already.
        if (!currentScript.includes('ngcc')) {
          const {start, end} = scriptNode;
          recorder.remove(start.offset, end.offset - start.offset);
          recorder.insertRight(start.offset, JSON.stringify(`${script} && ${currentScript}`));
        }
      } else {
        throw new SchematicsException(
            'Invalid postinstall script in package.json. Was expecting a string.');
      }
    }
  }

  // Write the changes.
  tree.commitUpdate(recorder);
}
