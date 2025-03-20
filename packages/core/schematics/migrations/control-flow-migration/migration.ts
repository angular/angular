/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {migrateCase} from './cases';
import {migrateFor} from './fors';
import {migrateIf} from './ifs';
import {migrateSwitch} from './switches';
import {
  AnalyzedFile,
  endI18nMarker,
  endMarker,
  MigrateError,
  startI18nMarker,
  startMarker,
} from './types';
import {
  canRemoveCommonModule,
  formatTemplate,
  processNgTemplates,
  removeImports,
  validateMigratedTemplate,
} from './util';

/**
 * Actually migrates a given template to the new syntax
 */
export function migrateTemplate(
  template: string,
  templateType: string,
  node: ts.Node,
  file: AnalyzedFile,
  format: boolean = true,
  analyzedFiles: Map<string, AnalyzedFile> | null,
): {migrated: string; errors: MigrateError[]} {
  let errors: MigrateError[] = [];
  let migrated = template;
  if (templateType === 'template' || templateType === 'templateUrl') {
    const ifResult = migrateIf(template);
    const forResult = migrateFor(ifResult.migrated);
    const switchResult = migrateSwitch(forResult.migrated);
    if (switchResult.errors.length > 0) {
      return {migrated: template, errors: switchResult.errors};
    }
    const caseResult = migrateCase(switchResult.migrated);
    const templateResult = processNgTemplates(caseResult.migrated, file.sourceFile);
    if (templateResult.err !== undefined) {
      return {migrated: template, errors: [{type: 'template', error: templateResult.err}]};
    }
    migrated = templateResult.migrated;
    const changed =
      ifResult.changed || forResult.changed || switchResult.changed || caseResult.changed;
    if (changed) {
      // determine if migrated template is a valid structure
      // if it is not, fail out
      const errors = validateMigratedTemplate(migrated, file.sourceFile.fileName);
      if (errors.length > 0) {
        return {migrated: template, errors};
      }
    }

    if (format && changed) {
      migrated = formatTemplate(migrated, templateType);
    }
    const markerRegex = new RegExp(
      `${startMarker}|${endMarker}|${startI18nMarker}|${endI18nMarker}`,
      'gm',
    );
    migrated = migrated.replace(markerRegex, '');

    file.removeCommonModule = canRemoveCommonModule(template);
    file.canRemoveImports = true;

    // when migrating an external template, we have to pass back
    // whether it's safe to remove the CommonModule to the
    // original component class source file
    if (
      templateType === 'templateUrl' &&
      analyzedFiles !== null &&
      analyzedFiles.has(file.sourceFile.fileName)
    ) {
      const componentFile = analyzedFiles.get(file.sourceFile.fileName)!;
      componentFile.getSortedRanges();
      // we have already checked the template file to see if it is safe to remove the imports
      // and common module. This check is passed off to the associated .ts file here so
      // the class knows whether it's safe to remove from the template side.
      componentFile.removeCommonModule = file.removeCommonModule;
      componentFile.canRemoveImports = file.canRemoveImports;

      // At this point, we need to verify the component class file doesn't have any other imports
      // that prevent safe removal of common module. It could be that there's an associated ngmodule
      // and in that case we can't safely remove the common module import.
      componentFile.verifyCanRemoveImports();
    }
    file.verifyCanRemoveImports();

    errors = [
      ...ifResult.errors,
      ...forResult.errors,
      ...switchResult.errors,
      ...caseResult.errors,
    ];
  } else if (file.canRemoveImports) {
    migrated = removeImports(template, node, file);
  }

  return {migrated, errors};
}
