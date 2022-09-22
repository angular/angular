/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, ResolvedResource} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';
import * as postcss from 'postcss';
import * as scss from 'postcss-scss';
import {ComponentMigrator} from '.';

export class ThemingStylesMigration extends Migration<ComponentMigrator[], SchematicContext> {
  enabled = true;
  namespace: string;

  override visitStylesheet(stylesheet: ResolvedResource) {
    this.fileSystem
      .edit(stylesheet.filePath)
      .remove(stylesheet.start, stylesheet.content.length)
      .insertRight(stylesheet.start, this.migrate(stylesheet.content));
  }

  migrate(styles: string): string {
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

    return processor.process(styles, {syntax: scss}).toString();
  }

  atUseHandler(atRule: postcss.AtRule) {
    if (isAngularMaterialImport(atRule)) {
      this.namespace = parseNamespace(atRule);
    }
  }

  atIncludeHandler(atRule: postcss.AtRule) {
    const migrator = this.upgradeData.find(m => {
      return m.styles.isLegacyMixin(this.namespace, atRule);
    });
    if (migrator) {
      migrator.styles.replaceMixin(this.namespace, atRule);
    } else if (atRule.params.includes('all-legacy-component-') && atRule.parent) {
      replaceAllComponentsMixin(atRule);
    }
  }

  ruleHandler(rule: postcss.Rule) {
    let isLegacySelector;
    let isDeprecatedSelector;

    const migrator = this.upgradeData.find(m => {
      isLegacySelector = m.styles.isLegacySelector(rule);
      isDeprecatedSelector = m.styles.isDeprecatedSelector(rule);
      return isLegacySelector || isDeprecatedSelector;
    });

    if (isLegacySelector) {
      migrator?.styles.replaceLegacySelector(rule);
    } else if (isDeprecatedSelector) {
      migrator?.styles.addDeprecatedSelectorComment(rule);
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

/**
 * Replaces mixin prefixed with `all-legacy-component` to the MDC equivalent.
 *
 * @param allComponentThemesNode a all-components-theme mixin node
 */
function replaceAllComponentsMixin(allComponentNode: postcss.AtRule) {
  allComponentNode.cloneBefore({
    params: allComponentNode.params.replace('all-legacy-component', 'all-component'),
  });
  allComponentNode.remove();
}
