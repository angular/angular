/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ResolvedResource} from '../../update-tool/component-resource-collector';
import {Migration} from '../../update-tool/migration';
import {CssSelectorUpgradeData} from '../data/css-selectors';
import {findAllSubstringIndices} from '../typescript/literal';
import {getVersionUpgradeData, UpgradeData} from '../upgrade-data';

/**
 * Migration that walks through every string literal, template and stylesheet in
 * order to migrate outdated CSS selectors to the new selector.
 */
export class CssSelectorsMigration extends Migration<UpgradeData> {
  /** Change data that upgrades to the specified target version. */
  data = getVersionUpgradeData(this, 'cssSelectors');

  // Only enable the migration rule if there is upgrade data.
  enabled = this.data.length !== 0;

  visitNode(node: ts.Node): void {
    if (ts.isStringLiteralLike(node)) {
      this._visitStringLiteralLike(node);
    }
  }

  visitTemplate(template: ResolvedResource): void {
    this.data.forEach(data => {
      if (data.whitelist && !data.whitelist.html) {
        return;
      }

      findAllSubstringIndices(template.content, data.replace)
          .map(offset => template.start + offset)
          .forEach(start => this._replaceSelector(template.filePath, start, data));
    });
  }

  visitStylesheet(stylesheet: ResolvedResource): void {
    this.data.forEach(data => {
      if (data.whitelist && !data.whitelist.stylesheet) {
        return;
      }

      findAllSubstringIndices(stylesheet.content, data.replace)
          .map(offset => stylesheet.start + offset)
          .forEach(start => this._replaceSelector(stylesheet.filePath, start, data));
    });
  }

  private _visitStringLiteralLike(node: ts.StringLiteralLike) {
    if (node.parent && node.parent.kind !== ts.SyntaxKind.CallExpression) {
      return;
    }

    const textContent = node.getText();
    const filePath = node.getSourceFile().fileName;

    this.data.forEach(data => {
      if (data.whitelist && !data.whitelist.strings) {
        return;
      }

      findAllSubstringIndices(textContent, data.replace)
          .map(offset => node.getStart() + offset)
          .forEach(start => this._replaceSelector(filePath, start, data));
    });
  }

  private _replaceSelector(filePath: string, start: number, data: CssSelectorUpgradeData) {
    this.fileSystem.edit(filePath)
      .remove(start, data.replace.length)
      .insertRight(start, data.replaceWith);
  }
}
