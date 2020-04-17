import {createPlugin, utils} from 'stylelint';
import {basename} from 'path';
import {Node} from 'postcss';

const isStandardSyntaxRule = require('stylelint/lib/utils/isStandardSyntaxRule');
const isStandardSyntaxSelector = require('stylelint/lib/utils/isStandardSyntaxSelector');

const ruleName = 'material/no-ampersand-beyond-selector-start';
const messages = utils.ruleMessages(ruleName, {
  expected: () => 'Ampersand is only allowed at the beginning of a selector',
});

/** Config options for the rule. */
interface RuleOptions {
  filePattern: string;
}

/**
 * Stylelint rule that doesn't allow for an ampersand to be used anywhere
 * except at the start of a selector. Skips private mixins.
 *
 * Based off the `selector-nested-pattern` Stylelint rule.
 * Source: https://github.com/stylelint/stylelint/blob/master/lib/rules/selector-nested-pattern/
 */
const plugin = createPlugin(ruleName, (isEnabled: boolean, _options?) => {
  return (root, result) => {
    if (!isEnabled) {
      return;
    }

    const options = _options as RuleOptions;
    const filePattern = new RegExp(options.filePattern);
    const fileName = basename(root.source!.input.file!);

    if (!filePattern.test(fileName)) {
      return;
    }

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
          utils.report({
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
  function getClosestMixinName(node: Node): string | undefined {
    let parent = node.parent;

    while (parent) {
      if (parent.type === 'atrule' && parent.name === 'mixin') {
        return parent.params;
      }

      parent = parent.parent;
    }

    return undefined;
  }
});

plugin.ruleName = ruleName;
plugin.messages = messages;
export default plugin;
