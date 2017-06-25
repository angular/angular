const stylelint = require('stylelint');

const ruleName = 'material/no-nested-mixin';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: () => 'Nested mixins are not allowed.',
});


/**
 * Stylelint plugin that prevents nesting SASS mixins.
 */
const plugin = stylelint.createPlugin(ruleName, isEnabled => {
  return (root, result) => {
    if (!isEnabled) return;

    root.walkAtRules(rule => {
      if (rule.name !== 'mixin') return;

      rule.walkAtRules(childRule => {
        if (childRule.name !== 'mixin') return;

        stylelint.utils.report({
          result,
          ruleName,
          message: messages.expected(),
          node: childRule
        });
      });
    });
  };
});

plugin.ruleName = ruleName;
plugin.messages = messages;
module.exports = plugin;
