import {createPlugin, utils} from 'stylelint';

const ruleName = 'material/no-nested-mixin';
const messages = utils.ruleMessages(ruleName, {
  expected: () => 'Nested mixins are not allowed.',
});

/**
 * Stylelint plugin that prevents nesting Sass mixins.
 */
const plugin = createPlugin(ruleName, (isEnabled: boolean) => {
  return (root, result) => {
    if (!isEnabled) {
      return;
    }

    root.walkAtRules(rule => {
      if (rule.name !== 'mixin') {
        return;
      }

      rule.walkAtRules(childRule => {
        if (childRule.name !== 'mixin') {
          return;
        }

        utils.report({
          result,
          ruleName,
          message: messages.expected(),
          node: childRule,
        });
      });
    });
  };
});

export default plugin;
