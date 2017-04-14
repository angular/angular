const ts = require('typescript');
const utils = require('tsutils');
const Lint = require('tslint');

const ERROR_MESSAGE =
    'A TODO may only appear in inline (//) style comments. ' +
    'This is meant to prevent a TODO from being accidentally included in any public API docs.';

/**
 * Rule that walks through all comments inside of the library and adds failures when it
 * detects TODO's inside of multi-line comments. TODOs need to be placed inside of single-line
 * comments.
 */
class Rule extends Lint.Rules.AbstractRule {

  apply(sourceFile) {
    return this.applyWithWalker(new NoExposedTodoWalker(sourceFile, this.getOptions()));
  }
}

class NoExposedTodoWalker extends Lint.RuleWalker {

  visitSourceFile(sourceFile) {
    utils.forEachComment(sourceFile, (fullText, commentRange) => {
      let isTodoComment = fullText.substring(commentRange.pos, commentRange.end).includes('TODO');

      if (commentRange.kind === ts.SyntaxKind.MultiLineCommentTrivia && isTodoComment) {
        this.addFailureAt(commentRange.pos, commentRange.end - commentRange.pos, ERROR_MESSAGE);
      }
    });
  }
}

exports.Rule = Rule;