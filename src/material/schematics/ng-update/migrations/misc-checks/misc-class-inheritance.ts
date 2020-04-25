/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {determineBaseTypes, Migration, TargetVersion} from '@angular/cdk/schematics';
import * as ts from 'typescript';

/**
 * Migration that checks for classes that extend Angular Material classes which
 * have changed their API.
 */
export class MiscClassInheritanceMigration extends Migration<null> {

  // Only enable this rule if the migration targets version 6. The rule
  // currently only includes migrations for V6 deprecations.
  enabled = this.targetVersion === TargetVersion.V6;

  visitNode(node: ts.Node): void {
    if (ts.isClassDeclaration(node)) {
      this._visitClassDeclaration(node);
    }
  }

  private _visitClassDeclaration(node: ts.ClassDeclaration) {
    const baseTypes = determineBaseTypes(node);
    const className = node.name ? node.name.text : '{unknown-name}';

    if (!baseTypes) {
      return;
    }

    // Migration for: https://github.com/angular/components/pull/10293 (v6)
    if (baseTypes.includes('MatFormFieldControl')) {
      const hasFloatLabelMember =
          node.members.filter(member => member.name)
              .find(member => member.name!.getText() === 'shouldLabelFloat');

      if (!hasFloatLabelMember) {
        this.createFailureAtNode(
            node,
            `Found class "${className}" which extends ` +
                `"${'MatFormFieldControl'}". This class must define ` +
                `"${'shouldLabelFloat'}" which is now a required property.`);
      }
    }
  }
}
