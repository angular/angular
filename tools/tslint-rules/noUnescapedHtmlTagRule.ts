import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as utils from 'tsutils';

const ERROR_MESSAGE =
  'An HTML tag delimiter (< or >) may only appear in a JSDoc comment if it is escaped.' +
  ' This prevents failures in document generation caused by a misinterpreted tag.';

/**
 * Rule that walks through all comments inside of the library and adds failures when it
 * detects unescaped HTML tags inside of multi-line comments.
 */
export class Rule extends Lint.Rules.AbstractRule {

  apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(new NoUnescapedHtmlTagWalker(sourceFile, this.getOptions()));
  }
}

class NoUnescapedHtmlTagWalker extends Lint.RuleWalker {

  visitSourceFile(sourceFile: ts.SourceFile) {
    utils.forEachComment(sourceFile, (fullText, commentRange) => {
      const htmlIsEscaped =
        this._parseForHtml(fullText.substring(commentRange.pos, commentRange.end));
      if (commentRange.kind === ts.SyntaxKind.MultiLineCommentTrivia && !htmlIsEscaped) {
        this.addFailureAt(commentRange.pos, commentRange.end - commentRange.pos, ERROR_MESSAGE);
      }
    });

    super.visitSourceFile(sourceFile);
  }

  /** Gets whether the comment's HTML, if any, is properly escaped */
  private _parseForHtml(fullText: string): boolean {
    const matches = /[<>]/;
    const backtickCount = fullText.split('`').length - 1;

    // An odd number of backticks or html without backticks is invalid
    if (backtickCount % 2 || (!backtickCount && matches.test(fullText))) {
      return false;
    }

    // Text without html is valid
    if (!matches.test(fullText)) {
      return true;
    }

    // < and > must always be between two matching backticks.

    // Whether an opening backtick has been found without a closing pair
    let openBacktick = false;

    for (const char of fullText) {
      if (char === '`') {
        openBacktick = !openBacktick;
      } else if (matches.test(char) && !openBacktick) {
        return false;
      }
    }

    return true;
  }
}
