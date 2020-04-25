/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {findInputsOnElementWithAttr, findInputsOnElementWithTag} from '../html-parsing/angular';
import {ResolvedResource} from '../../update-tool/component-resource-collector';
import {Migration} from '../../update-tool/migration';

import {InputNameUpgradeData} from '../data';
import {findAllSubstringIndices} from '../typescript/literal';
import {getVersionUpgradeData, UpgradeData} from '../upgrade-data';

/**
 * Migration that walks through every template or stylesheet and replaces outdated input
 * names to the new input name. Selectors in stylesheets could also target input
 * bindings declared as static attribute. See for example:
 *
 * e.g. `<my-component color="primary">` becomes `my-component[color]`
 */
export class InputNamesMigration extends Migration<UpgradeData> {
  /** Change data that upgrades to the specified target version. */
  data: InputNameUpgradeData[] = getVersionUpgradeData(this, 'inputNames');

  // Only enable the migration rule if there is upgrade data.
  enabled = this.data.length !== 0;

  visitStylesheet(stylesheet: ResolvedResource): void {
    this.data.forEach(name => {
      const currentSelector = `[${name.replace}]`;
      const updatedSelector = `[${name.replaceWith}]`;

      findAllSubstringIndices(stylesheet.content, currentSelector)
          .map(offset => stylesheet.start + offset)
          .forEach(
              start => this._replaceInputName(
                  stylesheet.filePath, start, currentSelector.length, updatedSelector));
    });
  }

  visitTemplate(template: ResolvedResource): void {
    this.data.forEach(name => {
      const whitelist = name.whitelist;
      const relativeOffsets: number[] = [];

      if (whitelist.attributes) {
        relativeOffsets.push(
            ...findInputsOnElementWithAttr(template.content, name.replace, whitelist.attributes));
      }

      if (whitelist.elements) {
        relativeOffsets.push(
            ...findInputsOnElementWithTag(template.content, name.replace, whitelist.elements));
      }

      relativeOffsets.map(offset => template.start + offset)
          .forEach(
              start => this._replaceInputName(
                  template.filePath, start, name.replace.length, name.replaceWith));
    });
  }

  private _replaceInputName(filePath: string, start: number, width: number, newName: string) {
    this.fileSystem.edit(filePath)
      .remove(start, width)
      .insertRight(start, newName);
  }
}
