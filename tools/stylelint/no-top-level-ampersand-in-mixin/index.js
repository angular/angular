const stylelint = require('stylelint');
const path = require('path');
const ruleName = 'material/no-top-level-ampersand-in-mixin';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: () => `Selectors starting with an ampersand ` +
                  `are not allowed inside top-level mixin rules`
});

/**
 * Stylelint rule that doesn't allow for the top-level rules inside a
 * mixin to start with an ampersand. Does not apply to internal mixins.
 */
const plugin = stylelint.createPlugin(ruleName, (isEnabled, options) => {
  return (root, result) => {
    if (!isEnabled) return;

    const filePattern = new RegExp(options.filePattern);
    const fileName = path.basename(root.source.input.file);

    if (!filePattern.test(fileName)) return;

    root.walkAtRules(node => {
      // Skip non-mixin atrules and internal mixins.
      if (node.name !== 'mixin' || node.params.indexOf('_') === 0) {
        return;
      }

      node.nodes.forEach(childNode => {
        if (childNode.type === 'rule' && childNode.selector.indexOf('&') === 0) {
          stylelint.utils.report({
            result,
            ruleName,
            message: messages.expected(),
            node: childNode
          });
        }
      });
    });
  };
});

plugin.ruleName = ruleName;
plugin.messages = messages;
module.exports = plugin;
