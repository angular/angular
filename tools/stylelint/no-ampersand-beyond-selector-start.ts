import {createPlugin, utils} from 'stylelint';
import {basename} from 'path';

const isStandardSyntaxRule = require('stylelint/lib/utils/isStandardSyntaxRule');
const isStandardSyntaxSelector = require('stylelint/lib/utils/isStandardSyntaxSelector');

const ruleName = 'material/no-ampersand-beyond-selector-start';
const messages = utils.ruleMessages(ruleName, {
  expected: () => 'Ampersand is only allowed at the beginning of a selector',
});

/** Config options for the rule. */
interface RuleOptions {
  filePattern?: string;
}

/**
 * Stylelint rule that doesn't allow for an ampersand to be used anywhere
 * except at the start of a selector. Skips private mixins.
 *
 * Based off the `selector-nested-pattern` Stylelint rule.
 * Source: https://github.com/stylelint/stylelint/blob/master/lib/rules/selector-nested-pattern/
 */
const plugin = createPlugin(ruleName, (isEnabled: boolean, options: RuleOptions) => {
  return (root, result) => {
    if (!isEnabled) {
      return;
    }

    const filePattern = options.filePattern ? new RegExp(options.filePattern) : null;
    const fileName = basename(root.source!.input.file!);

    if (filePattern !== null && !filePattern.test(fileName)) {
      return;
    }

    root.walkRules(rule => {
      if (
        rule.parent?.type === 'rule' &&
        isStandardSyntaxRule(rule) &&
        isStandardSyntaxSelector(rule.selector) &&
        hasInvalidAmpersandUsage(rule.selector)
      ) {
        utils.report({
          result,
          ruleName,
          message: messages.expected(),
          node: rule,
        });
      }
    });
  };
});

function hasInvalidAmpersandUsage(selector: string): boolean {
  return selector.split(',').some(part => part.trim().indexOf('&', 1) > -1);
}

export default plugin;
