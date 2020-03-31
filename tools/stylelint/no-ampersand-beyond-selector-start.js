const stylelint = require('stylelint');
const path = require('path');
const isStandardSyntaxRule = require('stylelint/lib/utils/isStandardSyntaxRule');
const isStandardSyntaxSelector = require('stylelint/lib/utils/isStandardSyntaxSelector');

const ruleName = 'material/no-ampersand-beyond-selector-start';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: () => 'Ampersand is only allowed at the beginning of a selector',
});

/**
 * Stylelint rule that doesn't allow for an ampersand to be used anywhere
 * except at the start of a selector. Skips private mixins.
 *
 * Based off the `selector-nested-pattern` Stylelint rule.
 * Source: https://github.com/stylelint/stylelint/blob/master/lib/rules/selector-nested-pattern/
 */
const plugin = stylelint.createPlugin(ruleName, (isEnabled, options) => {
  return (root, result) => {
    if (!isEnabled) return;

    const filePattern = new RegExp(options.filePattern);
    const fileName = path.basename(root.source.input.file);

    if (!filePattern.test(fileName)) return;

    root.walkRules(rule => {
      if (
        rule.parent.type === 'rule' &&
        isStandardSyntaxRule(rule) &&
        isStandardSyntaxSelector(rule.selector) &&
        // Using the ampersand at the beginning is fine, anything else can cause issues in themes.
        rule.selector.indexOf('&') > 0) {

        const mixinName = getClosestMixinName(rule);

        // Skip rules inside private mixins.
        if (!mixinName || !mixinName.startsWith('_')) {
          stylelint.utils.report({
            result,
            ruleName,
            message: messages.expected(),
            node: rule
          });
        }
      }
    });
  };

  /** Walks up the AST and finds the name of the closest mixin. */
  function getClosestMixinName(node) {
    let parent = node.parent;

    while (parent) {
      if (parent.type === 'atrule' && parent.name === 'mixin') {
        return parent.params;
      }

      parent = parent.parent;
    }
  }
});

plugin.ruleName = ruleName;
plugin.messages = messages;
module.exports = plugin;
