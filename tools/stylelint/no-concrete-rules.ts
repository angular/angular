import {createPlugin, utils} from 'stylelint';
import {basename} from 'path';

const ruleName = 'material/no-concrete-rules';
const messages = utils.ruleMessages(ruleName, {
  expectedWithPattern: pattern =>
    `CSS rules must be placed inside a mixin for files matching '${pattern}'.`,
  expectedAllFiles: () => `CSS rules must be placed inside a mixin for all files.`,
});

/** Config options for the rule. */
interface RuleOptions {
  filePattern?: string;
}

/**
 * Stylelint plugin that will log a warning for all top-level CSS rules.
 * Can be used in theme files to ensure that everything is inside a mixin.
 */
const plugin = createPlugin(ruleName, (isEnabled: boolean, options: RuleOptions) => {
  return (root, result) => {
    if (!isEnabled) {
      return;
    }

    const filePattern = options.filePattern ? new RegExp(options.filePattern) : null;
    const fileName = basename(root.source!.input.file!);

    if ((filePattern !== null && !filePattern.test(fileName)) || !root.nodes) {
      return;
    }

    // Go through all the nodes and report a warning for every CSS rule or mixin inclusion.
    // We use a regular `forEach`, instead of the PostCSS walker utils, because we only care
    // about the top-level nodes.
    root.nodes.forEach(node => {
      if (node.type === 'rule' || (node.type === 'atrule' && node.name === 'include')) {
        utils.report({
          result,
          ruleName,
          node,
          message:
            filePattern !== null
              ? messages.expectedWithPattern(filePattern)
              : messages.expectedAllFiles(),
        });
      }
    });
  };
});

export default plugin;
