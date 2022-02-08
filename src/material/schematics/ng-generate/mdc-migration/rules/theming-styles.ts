/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, ResolvedResource} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';
import {StyleMigrator} from './style-migrator';
import * as postcss from 'postcss';
import * as scss from 'postcss-scss';

export class ThemingStylesMigration extends Migration<StyleMigrator[], SchematicContext> {
  enabled = true;
  namespace: string;

  override visitStylesheet(stylesheet: ResolvedResource) {
    const processor = new postcss.Processor([
      {
        postcssPlugin: 'theming-styles-migration-plugin',
        AtRule: {
          use: this.atUseHandler.bind(this),
          include: this.atIncludeHandler.bind(this),
        },
        Rule: this.ruleHandler.bind(this),
      },
    ]);

    const result = processor.process(stylesheet.content, {syntax: scss});
    this.fileSystem.overwrite(stylesheet.filePath, result.toString());
  }

  atUseHandler(atRule: postcss.AtRule) {
    if (isAngularMaterialImport(atRule)) {
      this.namespace = parseNamespace(atRule);
    }
  }

  atIncludeHandler(atRule: postcss.AtRule) {
    const migrator = this.upgradeData.find(m => {
      return m.isLegacyMixin(this.namespace, atRule);
    });
    migrator?.replaceMixin(this.namespace, atRule);
  }

  ruleHandler(rule: postcss.Rule) {
    let isLegacySelector;
    let isDeprecatedSelector;

    const migrator = this.upgradeData.find(m => {
      isLegacySelector = m.isLegacySelector(rule);
      isDeprecatedSelector = m.isDeprecatedSelector(rule);
      return isLegacySelector || isDeprecatedSelector;
    });

    if (isLegacySelector) {
      migrator?.replaceLegacySelector(rule);
    } else if (isDeprecatedSelector) {
      migrator?.addDeprecatedSelectorComment(rule);
    }
  }
}

/**
 * Returns whether the given AtRule is an import for @angular/material styles.
 *
 * @param atRule a postcss AtRule node.
 * @returns true if the given AtRule is an import for @angular/material styles.
 */
function isAngularMaterialImport(atRule: postcss.AtRule): boolean {
  const params = postcss.list.space(atRule.params);
  return params[0] === "'@angular/material'";
}

/**
 * Parses the given @use AtRule and returns the namespace being used.
 *
 * @param atRule a postcss @use AtRule.
 * @returns the namespace being used.
 */
function parseNamespace(atRule: postcss.AtRule): string {
  const params = postcss.list.space(atRule.params);
  return params[params.length - 1];
}
