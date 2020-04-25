/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TargetVersion} from '../../update-tool/target-version';
import {ResolvedResource} from '../../update-tool/component-resource-collector';
import {Migration} from '../../update-tool/migration';
import {findAllSubstringIndices} from '../typescript/literal';
import {UpgradeData} from '../upgrade-data';

/**
 * Migration that walks through every template and reports if there are
 * instances of outdated Angular CDK API that can't be migrated automatically.
 */
export class MiscTemplateMigration extends Migration<UpgradeData> {

  // Only enable this rule if the migration targets version 6. The rule
  // currently only includes migrations for V6 deprecations.
  enabled = this.targetVersion === TargetVersion.V6;

  visitTemplate(template: ResolvedResource): void {
    // Migration for https://github.com/angular/components/pull/10325 (v6)
    findAllSubstringIndices(template.content, 'cdk-focus-trap').forEach(offset => {
      this.failures.push({
        filePath: template.filePath,
        position: template.getCharacterAndLineOfPosition(template.start + offset),
        message: `Found deprecated element selector "cdk-focus-trap" which has been ` +
            `changed to an attribute selector "[cdkTrapFocus]".`
      });
    });
  }
}
