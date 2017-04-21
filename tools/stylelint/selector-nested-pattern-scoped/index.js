const stylelint = require('stylelint');
const path = require('path');
const isStandardSyntaxRule = require('stylelint/lib/utils/isStandardSyntaxRule');
const isStandardSyntaxSelector = require('stylelint/lib/utils/isStandardSyntaxSelector');

const ruleName = 'material/selector-nested-pattern-scoped';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: selector => `Expected nested selector '${selector}' to match specified pattern`,
});

/**
 * Re-implementation of the `selector-nested-pattern` Stylelint rule, allowing us
 * to scope it to a particular set of files via the custom `filePattern` option. The
 * primary use-case is to be able to apply the rule only to theme files.
 *
 * Reference: https://stylelint.io/user-guide/rules/selector-nested-pattern/
 * Source: https://github.com/stylelint/stylelint/blob/master/lib/rules/selector-nested-pattern/
 */
const plugin = stylelint.createPlugin(ruleName, (pattern, options) => {
  return (root, result) => {
    const selectorPattern = new RegExp(pattern);
    const filePattern = new RegExp(options.filePattern);
    const fileName = path.basename(root.source.input.file);

    if (!filePattern.test(fileName)) return;

    root.walkRules(rule => {
      if (rule.parent.type === 'rule' &&
          isStandardSyntaxRule(rule) &&
          isStandardSyntaxSelector(rule.selector) &&
          !selectorPattern.test(rule.selector)) {

        stylelint.utils.report({
          result,
          ruleName,
          message: messages.expected(rule.selector),
          node: rule
        });
      }
    });
  };
});

plugin.ruleName = ruleName;
plugin.messages = messages;
module.exports = plugin;
