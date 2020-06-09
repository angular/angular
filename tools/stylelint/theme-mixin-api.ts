import {AtRule, atRule, decl, Declaration, Node, Result, Root} from 'postcss';
import {createPlugin, Plugin, utils} from 'stylelint';

/** Name of this stylelint rule. */
const ruleName = 'material/theme-mixin-api';

/** Regular expression that matches all theme mixins. */
const themeMixinRegex =
    /^(?:_(mat-.+)-(density)|(mat-.+)-(density|color|typography|theme))\((.*)\)$/;

/**
 * Stylelint plugin which ensures that theme mixins have a consistent API. Besides
 * compilation API tests which are stored in `src/material/core/theming/test`, we test
 * the following patterns here:
 *
 *   1. Checks if theme mixin arguments named consistently e.g. if a mixin accepts both a theme
 *      or color configuration, the variable should reflect that.
 *   2. Checks if the individual theme mixins handle the case where consumers pass a theme object.
 *      For convenience, we support passing theme object to the scoped mixins.
 *   3. Checks if the `-theme` mixins have the duplicate style check set up. We want to
 *      consistently check for duplicative theme styles so that we can warn consumers. The
 *      plugin ensures that style-generating statements are nested inside the duplication check.
 */
const plugin = (isEnabled: boolean, _options: never, context: {fix: boolean}) => {
  return (root: Root, result: Result) => {
    if (!isEnabled) {
      return;
    }

    root.walkAtRules('mixin', node => {
      const matches = node.params.match(themeMixinRegex);
      if (matches === null) {
        return;
      }

      // Name of the component with prefix. e.g. `mat-mdc-button` or `mat-slide-toggle`.
      const componentName = matches[1] || matches[3];
      // Type of the theme mixin. e.g. `density`, `color`, `theme`.
      const type = matches[2] || matches[4];
      // Naively assumes that mixin arguments can be easily retrieved by splitting based on
      // a comma. This is not always correct because Sass maps can be constructed in parameters.
      // These would contain commas that throw of the argument retrieval. It's acceptable that
      // this rule will fail in such edge-cases. There is no AST for `postcss.AtRule` params.
      const args = matches[5].split(',');

      if (type === 'theme') {
        validateThemeMixin(node, componentName, args);
      } else {
        validateIndividualSystemMixins(node, type, args);
      }
    });

    function validateThemeMixin(node: AtRule, componentName: string, args: string[]) {
      if (args.length !== 1) {
        reportError(node, 'Expected theme mixin to only declare a single argument.');
      } else if (args[0] !== '$theme-or-color-config') {
        if (context.fix) {
          node.params = node.params.replace(args[0], '$theme-or-color-config');
        } else {
          reportError(node, 'Expected first mixin argument to be called `$theme-or-color-config`.');
        }
      }

      const themePropName = `$theme`;
      const legacyColorExtractExpr = `_mat-legacy-get-theme($theme-or-color-config)`;
      const duplicateStylesCheckExpr =
          `_mat-check-duplicate-theme-styles(${themePropName}, '${componentName}')`;

      let legacyConfigDecl: Declaration|null = null;
      let duplicateStylesCheck: AtRule|null = null;
      let hasNodesOutsideDuplicationCheck = false;
      let isLegacyConfigRetrievalFirstStatement = false;

      if (node.nodes) {
        for (let i = 0; i < node.nodes.length; i++) {
          const childNode = node.nodes[i];
          if (childNode.type === 'decl' && childNode.value === legacyColorExtractExpr) {
            legacyConfigDecl = childNode;
            isLegacyConfigRetrievalFirstStatement = i === 0;
          } else if (
              childNode.type === 'atrule' && childNode.name === 'include' &&
              childNode.params === duplicateStylesCheckExpr) {
            duplicateStylesCheck = childNode;
          } else if (childNode.type !== 'comment') {
            hasNodesOutsideDuplicationCheck = true;
          }
        }
      }

      if (!legacyConfigDecl) {
        if (context.fix) {
          legacyConfigDecl = decl({prop: themePropName, value: legacyColorExtractExpr});
          node.insertBefore(0, legacyConfigDecl);
        } else {
          reportError(
              node,
              `Legacy color API is not handled. Consumers could pass in a ` +
                  `color configuration directly to the theme mixin. For backwards compatibility, ` +
                  `use the following declaration to retrieve the theme object: ` +
                  `${themePropName}: ${legacyColorExtractExpr}`);
        }
      } else if (legacyConfigDecl.prop !== themePropName) {
        reportError(
            legacyConfigDecl, `For consistency, theme variable should be called: ${themePropName}`);
      }

      if (!duplicateStylesCheck) {
        if (context.fix) {
          duplicateStylesCheck = atRule({name: 'include', params: duplicateStylesCheckExpr});
          node.insertBefore(1, duplicateStylesCheck);
        } else {
          reportError(
              node,
              `Missing check for duplicative theme styles. Please include the ` +
                  `duplicate styles check mixin: ${duplicateStylesCheckExpr}`);
        }
      }

      if (hasNodesOutsideDuplicationCheck) {
        reportError(
            node,
            `Expected nodes other than the "${legacyColorExtractExpr}" ` +
                `declaration to be nested inside the duplicate styles check.`);
      }

      if (legacyConfigDecl !== null && !isLegacyConfigRetrievalFirstStatement) {
        reportError(
            legacyConfigDecl, 'Legacy configuration should be retrieved first in theme mixin.');
      }
    }

    function validateIndividualSystemMixins(node: AtRule, type: string, args: string[]) {
      if (args.length !== 1) {
        reportError(node, 'Expected mixin to only declare a single argument.');
      } else if (args[0] !== '$config-or-theme') {
        if (context.fix) {
          node.params = node.params.replace(args[0], '$config-or-theme');
        } else {
          reportError(node, 'Expected first mixin argument to be called `$config-or-theme`.');
        }
      }

      const expectedProperty = type === 'density' ? '$density-scale' : '$config';
      const expectedValue = `mat-get-${type}-config($config-or-theme)`;
      let configExtractionNode: Declaration|null = null;
      let nonCommentNodeCount = 0;

      if (node.nodes) {
        for (const currentNode of node.nodes) {
          if (currentNode.type !== 'comment') {
            nonCommentNodeCount++;
          }

          if (currentNode.type === 'decl' && currentNode.value === expectedValue) {
            configExtractionNode = currentNode;
            break;
          }
        }
      }

      if (!configExtractionNode && nonCommentNodeCount > 0) {
        if (context.fix) {
          node.insertBefore(0, {prop: expectedProperty, value: expectedValue});
        } else {
          reportError(
              node,
              `Config is not extracted. Consumers could pass a theme object. ` +
                  `Extract the configuration by using: ${expectedProperty}: ${expectedValue}`);
        }
      } else if (configExtractionNode && configExtractionNode.prop !== expectedProperty) {
        reportError(
            configExtractionNode,
            `For consistency, variable for configuration should ` +
                `be called: ${expectedProperty}`);
      }
    }

    function reportError(node: Node, message: string) {
      utils.report({result, ruleName, node, message});
    }
  };
};

// Note: We need to cast the value explicitly to `Plugin` because the stylelint types
// do not type the context parameter. https://stylelint.io/developer-guide/rules#add-autofix
module.exports = createPlugin(ruleName, plugin as Plugin);
