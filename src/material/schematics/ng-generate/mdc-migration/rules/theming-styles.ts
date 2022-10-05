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
import {ComponentMigrator, MIGRATORS} from '.';

const ALL_LEGACY_COMPONENTS_MIXIN_NAME = '(?:\\.)(.*)(?:\\()';

export class ThemingStylesMigration extends Migration<ComponentMigrator[], SchematicContext> {
  enabled = true;
  namespace: string;

  override visitStylesheet(stylesheet: ResolvedResource) {
    this.fileSystem
      .edit(stylesheet.filePath)
      .remove(stylesheet.start, stylesheet.content.length)
      .insertRight(stylesheet.start, this.migrate(stylesheet.content, stylesheet.filePath));
  }

  migrate(styles: string, filename: string): string {
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

    try {
      return processor.process(styles, {syntax: scss}).toString();
    } catch (e) {
      this.context.logger.error(`${e}`);
      this.context.logger.warn(`Failed to process stylesheet: ${filename} (see error above).`);
      return styles;
    }
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
      const mixinChange = migrator.styles.getMixinChange(this.namespace, atRule);
      if (mixinChange) {
        replaceAtRuleWithMultiple(atRule, mixinChange.old, mixinChange.new);
      }
    } else if (atRule.params.includes('all-legacy-component') && atRule.parent) {
      if (this.isPartialMigration()) {
        // the second element of the result from match is the matching text
        const mixinName = atRule.params.match(ALL_LEGACY_COMPONENTS_MIXIN_NAME)![1];
        const comment =
          'TODO(mdc-migration): Remove ' + mixinName + ' once all legacy components are migrated';
        if (!addLegacyCommentForPartialMigrations(atRule, comment)) {
          // same all-legacy-component mixin already replaced, nothing to do here
          return;
        }
      }
      replaceAllComponentsMixin(atRule);
    }
  }

  isPartialMigration() {
    return this.upgradeData.length !== MIGRATORS.length;
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
      addCommentBeforeNode(
        rule,
        'TODO(mdc-migration): The following rule targets internal classes of ' +
          migrator?.component +
          ' that may no longer apply for the MDC version.',
      );
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
 *
 * @param atRule a postcss @use AtRule.
 * @param legacyComment comment that will be added to legacy mixin
 * @returns true if comment added, false if comment already exists
 */
function addLegacyCommentForPartialMigrations(
  atRule: postcss.AtRule,
  legacyComment: string,
): boolean {
  let hasAddedComment = false;
  // Check if comment has been added before, we don't want to add multiple
  // comments. We need to check since replacing the original node causes
  // this function to be called again.
  atRule.parent?.walkComments(comment => {
    if (comment.text.includes(legacyComment)) {
      hasAddedComment = true;
    }
  });

  if (hasAddedComment) {
    // If comment has been added, no action to do anymore.
    return false;
  }

  addCommentBeforeNode(atRule.cloneBefore(), legacyComment);
  return true;
}

/**
 * Adds comment before postcss rule or at rule node
 *
 * @param rule a postcss rule.
 * @param comment the text content for the comment
 */
function addCommentBeforeNode(node: postcss.Rule | postcss.AtRule, comment: string): void {
  let commentNode = postcss.comment({
    text: comment,
  });
  // We need to manually adjust the indentation and add new lines between the
  // comment and node
  const indentation = node.raws.before?.split('\n').pop();
  commentNode.raws.before = '\n' + indentation;
  // Since node is parsed and not a copy, will always have a parent node
  node.parent!.insertBefore(node, commentNode);
  node.raws.before = '\n' + indentation;
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

/**
 * Replaces the text in an atRule with multiple replacements on new lines
 *
 * @param atRule a postcss @use AtRule.
 * @param textToReplace text to replace in the at rule node's params attributes
 * @param replacements an array of strings to replace the specified text. Each
 * entry appears on a new line.
 */
function replaceAtRuleWithMultiple(
  atRule: postcss.AtRule,
  textToReplace: string,
  replacements: string[],
) {
  // Cloning & inserting the first node before changing the
  // indentation preserves the indentation of the first node (e.g. 3 newlines).
  atRule.cloneBefore({
    params: atRule.params.replace(textToReplace, replacements[0]),
  });

  // We change the indentation before inserting all of the other nodes
  // because the additional @includes should only be separated by a single newline.
  const indentation = atRule.raws.before?.split('\n').pop();
  atRule.raws.before = '\n' + indentation;

  // Note: It may be more efficient to create an array of clones and then insert
  // them all at once. If we are having performance issues, we should revisit this.
  for (let i = 1; i < replacements.length; i++) {
    atRule.cloneBefore({
      params: atRule.params.replace(textToReplace, replacements[i]),
    });
  }
  atRule.remove();
}
