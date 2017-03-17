const stylelint = require('stylelint');
const NeedsPrefix = require('./needs-prefix');
const parseSelector = require('stylelint/lib/utils/parseSelector');

const ruleName = 'material/no-prefixes';
const messages =  stylelint.utils.ruleMessages(ruleName, {
  property: property => `Unprefixed property "${property}".`,
  value: (property, value) => `Unprefixed value in "${property}: ${value}".`,
  atRule: name => `Unprefixed @rule "${name}".`,
  mediaFeature: value => `Unprefixed media feature "${value}".`,
  selector: selector => `Unprefixed selector "${selector}".`
});

/**
 * Stylelint plugin that warns for unprefixed CSS.
 */
const plugin = stylelint.createPlugin(ruleName, browsers => {
  return (root, result) => {
    if (!stylelint.utils.validateOptions(result, ruleName, {})) return;

    const needsPrefix = new NeedsPrefix(browsers);

    // Check all of the `property: value` pairs.
    root.walkDecls(decl => {
      if (needsPrefix.property(decl.prop)) {
        stylelint.utils.report({
          result,
          ruleName,
          message: messages.property(decl.prop),
          node: decl,
          index: (decl.raws.before || '').length
        });
      } else if (needsPrefix.value(decl.prop, decl.value)) {
        stylelint.utils.report({
          result,
          ruleName,
          message: messages.value(decl.prop, decl.value),
          node: decl,
          index: (decl.raws.before || '').length
        });
      }
    });

    // Check all of the @-rules and their values.
    root.walkAtRules(rule => {
      if (needsPrefix.atRule(rule.name)) {
        stylelint.utils.report({
          result,
          ruleName,
          message: messages.atRule(rule.name),
          node: rule
        });
      } else if (needsPrefix.mediaFeature(rule.params)) {
        stylelint.utils.report({
          result,
          ruleName,
          message: messages.mediaFeature(rule.name),
          node: rule
        });
      }
    });

    // Walk the rules and check if the selector needs prefixes.
    root.walkRules(rule => {
      // Silence warnings for SASS selectors. Stylelint does this in their own rules as well:
      // https://github.com/stylelint/stylelint/blob/master/lib/utils/isStandardSyntaxSelector.js
      parseSelector(rule.selector, { warn: () => {} }, rule, selectorTree => {
        selectorTree.walkPseudos(pseudoNode => {
          if (needsPrefix.selector(pseudoNode.value)) {
            stylelint.utils.report({
              result,
              ruleName,
              message: messages.selector(pseudoNode.value),
              node: rule,
              index: (rule.raws.before || '').length + pseudoNode.sourceIndex,
            });
          }
        });
      });
    });

  };
});


plugin.ruleName = ruleName;
plugin.messages = messages;
module.exports = plugin;
