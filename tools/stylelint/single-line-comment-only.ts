import {createPlugin, utils} from 'stylelint';
import {basename} from 'path';

const ruleName = 'material/single-line-comment-only';
const messages = utils.ruleMessages(ruleName, {
  expected: () =>
    'Multi-line comments are not allowed (e.g. /* */). ' + 'Use single-line comments instead (//).',
});

/**
 * Stylelint plugin that doesn't allow multi-line comments to
 * be used, because they'll show up in the user's output.
 */
const plugin = createPlugin(ruleName, (isEnabled: boolean, options?: {filePattern?: string}) => {
  return (root, result) => {
    if (!isEnabled) {
      return;
    }

    const filePattern = options?.filePattern ? new RegExp(options.filePattern) : null;

    if (filePattern && !filePattern?.test(basename(root.source!.input.file!))) {
      return;
    }

    root.walkComments(comment => {
      // The `raws.inline` property isn't in the typing so we need to cast to any. Also allow
      // comments starting with `!` since they're used to tell minifiers to preserve the comment.
      if (!(comment.raws as any).inline && !comment.text.startsWith('!')) {
        utils.report({
          result,
          ruleName,
          message: messages.expected(),
          node: comment,
        });
      }
    });
  };
});

export default plugin;
