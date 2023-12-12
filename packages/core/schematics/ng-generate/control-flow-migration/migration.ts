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
import {AnalyzedFile, endI18nMarker, endMarker, MigrateError, startI18nMarker, startMarker} from './types';
import {canRemoveCommonModule, formatTemplate, parseTemplate, processNgTemplates, removeImports} from './util';

/**
 * Actually migrates a given template to the new syntax
 */
export function migrateTemplate(
    template: string, templateType: string, node: ts.Node, file: AnalyzedFile,
    format: boolean = true,
    analyzedFiles: Map<string, AnalyzedFile>|null): {migrated: string, errors: MigrateError[]} {
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
    const templateResult = processNgTemplates(caseResult.migrated);
    if (templateResult.err !== undefined) {
      return {migrated: template, errors: [{type: 'template', error: templateResult.err}]};
    }
    migrated = templateResult.migrated;
    const changed =
        ifResult.changed || forResult.changed || switchResult.changed || caseResult.changed;
    if (changed) {
      // determine if migrated template is a valid structure
      // if it is not, fail out
      const parsed = parseTemplate(migrated);
      if (parsed.errors.length > 0) {
        const parsingError = {
          type: 'parse',
          error: new Error(
              `The migration resulted in invalid HTML for ${file.sourceFilePath}. ` +
              `Please check the template for valid HTML structures and run the migration again.`)
        };
        return {migrated: template, errors: [parsingError]};
      }
    }

    if (format && changed) {
      migrated = formatTemplate(migrated, templateType);
    }
    const markerRegex =
        new RegExp(`${startMarker}|${endMarker}|${startI18nMarker}|${endI18nMarker}`, 'gm');
    migrated = migrated.replace(markerRegex, '');

    file.removeCommonModule = canRemoveCommonModule(template);
    file.canRemoveImports = true;

    // when migrating an external template, we have to pass back
    // whether it's safe to remove the CommonModule to the
    // original component class source file
    if (templateType === 'templateUrl' && analyzedFiles !== null &&
        analyzedFiles.has(file.sourceFilePath)) {
      const componentFile = analyzedFiles.get(file.sourceFilePath)!;
      componentFile.removeCommonModule = file.removeCommonModule;
      componentFile.canRemoveImports = file.canRemoveImports;
    }

    errors = [
      ...ifResult.errors,
      ...forResult.errors,
      ...switchResult.errors,
      ...caseResult.errors,
    ];
  } else if (file.canRemoveImports) {
    migrated = removeImports(template, node, file.removeCommonModule);
  }

  return {migrated, errors};
}
