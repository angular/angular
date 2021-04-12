import {createPlugin, Plugin, utils} from 'stylelint';
import {basename, join} from 'path';
import {Result, Root} from './stylelint-postcss-types';

const ruleName = 'material/no-unused-import';
const messages = utils.ruleMessages(ruleName, {
  expected: (namespace: string) => `Namespace ${namespace} is not being used.`,
  invalid: (rule: string) => `Failed to extract namespace from ${rule}. material/no-unused-` +
                             `imports Stylelint rule likely needs to be updated.`
});

/** Stylelint plugin that flags unused `@use` statements. */
const factory = (isEnabled: boolean, _options: never, context: {fix: boolean}) => {
  return (root: Root, result: Result) => {
    if (!isEnabled) {
      return;
    }

    const fileContent = root.toString();

    root.walkAtRules(rule => {
      if (rule.name === 'use') {
        const namespace = extractNamespaceFromUseStatement(rule.params);

        // Flag namespaces we didn't manage to parse so that we can fix the parsing logic.
        if (!namespace) {
          utils.report({
            result,
            ruleName,
            message: messages.invalid(rule.params),
            node: rule
          });
        } else if (!fileContent.includes(namespace + '.')) {
          if (context.fix) {
            rule.remove();
          } else {
            utils.report({
              result,
              ruleName,
              message: messages.expected(namespace),
              node: rule
            });
          }
        }
       }
    });
  };
};

/** Extracts the namespace of an `@use` rule from its parameters.  */
function extractNamespaceFromUseStatement(params: string): string|null {
  const closeQuoteIndex = Math.max(params.lastIndexOf(`"`), params.lastIndexOf(`'`));

  if (closeQuoteIndex > -1) {
    const asExpression = 'as ';
    const asIndex = params.indexOf(asExpression, closeQuoteIndex);

    // If we found an ` as ` expression, we consider the rest of the text as the namespace.
    if (asIndex > -1) {
      return params.slice(asIndex + asExpression.length).trim();
    }

    const openQuoteIndex = Math.max(params.lastIndexOf(`"`, closeQuoteIndex - 1),
                                    params.lastIndexOf(`'`, closeQuoteIndex - 1));

    if (openQuoteIndex > -1) {
      const importPath = params.slice(openQuoteIndex + 1, closeQuoteIndex)
        // Sass allows for leading underscores to be omitted and it technically supports .scss.
        .replace(/^_|(\.import)?\.scss$|\.import$/g, '');

      // Built-in Sass imports look like `sass:map`.
      if (importPath.startsWith('sass:')) {
        return importPath.split('sass:')[1];
      }

      // Sass ignores `/index` and infers the namespace as the next segment in the path.
      const fileName = basename(importPath);
      return fileName === 'index' ? basename(join(fileName, '..')) : fileName;
    }
  }

  return null;
}

// Note: We need to cast the value explicitly to `Plugin` because the stylelint types
// do not type the context parameter. https://stylelint.io/developer-guide/rules#add-autofix
const plugin = createPlugin(ruleName, factory as unknown as Plugin);
plugin.ruleName = ruleName;
plugin.messages = messages;
module.exports = plugin;
