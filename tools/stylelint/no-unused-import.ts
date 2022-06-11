import {createPlugin, utils} from 'stylelint';
import {basename, join} from 'path';

const ruleName = 'material/no-unused-import';
const messages = utils.ruleMessages(ruleName, {
  expected: namespace => `Namespace ${namespace} is not being used.`,
  invalid: rule =>
    `Failed to extract namespace from ${rule}. material/no-unused-` +
    `imports Stylelint rule likely needs to be updated.`,
});

/** Stylelint plugin that flags unused `@use` statements. */
const plugin = createPlugin(ruleName, (isEnabled: boolean, _options, context) => {
  return (root, result) => {
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
            node: rule,
          });
        } else if (!fileContent.includes(namespace + '.')) {
          if (context.fix) {
            rule.remove();
          } else {
            utils.report({
              result,
              ruleName,
              message: messages.expected(namespace),
              node: rule,
            });
          }
        }
      }
    });
  };
});

/** Extracts the namespace of an `@use` rule from its parameters.  */
function extractNamespaceFromUseStatement(params: string): string | null {
  const openQuoteIndex = Math.max(params.indexOf(`"`), params.indexOf(`'`));
  const closeQuoteIndex = Math.max(
    params.indexOf(`"`, openQuoteIndex + 1),
    params.indexOf(`'`, openQuoteIndex + 1),
  );

  if (closeQuoteIndex > -1) {
    const asExpression = 'as ';
    const asIndex = params.indexOf(asExpression, closeQuoteIndex);
    const withIndex = params.indexOf(' with', asIndex);

    // If we found an ` as ` expression, we consider the rest of the text as the namespace.
    if (asIndex > -1) {
      return withIndex == -1
        ? params.slice(asIndex + asExpression.length).trim()
        : params.slice(asIndex + asExpression.length, withIndex).trim();
    }

    const importPath = params
      .slice(openQuoteIndex + 1, closeQuoteIndex)
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

  return null;
}

export default plugin;
