/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {migrateCase} from './cases';
import {migrateFor} from './fors';
import {migrateIf} from './ifs';
import {migrateSwitch} from './switches';
import {AnalyzedFile, MigrateError} from './types';
import {canRemoveCommonModule, formatTemplate, processNgTemplates, removeImports} from './util';

/**
 * Actually migrates a given template to the new syntax
 */
export function migrateTemplate(
    template: string, templateType: string, node: ts.Node, file: AnalyzedFile,
    format: boolean = true): {migrated: string, errors: MigrateError[]} {
  let errors: MigrateError[] = [];
  let migrated = template;
  if (templateType === 'template') {
    const ifResult = migrateIf(template);
    const forResult = migrateFor(ifResult.migrated);
    const switchResult = migrateSwitch(forResult.migrated);
    const caseResult = migrateCase(switchResult.migrated);
    migrated = processNgTemplates(caseResult.migrated);
    const changed =
        ifResult.changed || forResult.changed || switchResult.changed || caseResult.changed;
    if (format && changed) {
      migrated = formatTemplate(migrated);
    }
    file.removeCommonModule = canRemoveCommonModule(template);

    errors = [
      ...ifResult.errors,
      ...forResult.errors,
      ...switchResult.errors,
      ...caseResult.errors,
    ];
  } else {
    migrated = removeImports(template, node, file.removeCommonModule);
  }

  return {migrated, errors};
}
