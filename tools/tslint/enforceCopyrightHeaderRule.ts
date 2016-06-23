import {RuleWalker} from 'tslint/lib/language/walker';
import {RuleFailure} from 'tslint/lib/lint';
import {AbstractRule} from 'tslint/lib/rules';
import * as ts from 'typescript';

export class Rule extends AbstractRule {
  public static FAILURE_STRING = 'missing copyright header';

  public apply(sourceFile: ts.SourceFile): RuleFailure[] {
    const walker = new EnforceCopyrightHeaderWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

class EnforceCopyrightHeaderWalker extends RuleWalker {
  private regex: RegExp = /\/\*[\s\S]*?Copyright Google Inc\.[\s\S]*?\*\//;

  public visitSourceFile(node: ts.SourceFile) {
    // check for a shebang
    let text = node.getFullText();
    let offset = 0;
    if (text.indexOf('#!') === 0) {
      offset = text.indexOf('\n') + 1;
      text = text.substring(offset);
    }
    // look for the copyright header
    let match = text.match(this.regex);
    if (!match || match.index !== 0) {
      this.addFailure(this.createFailure(offset, offset + 1, Rule.FAILURE_STRING));
    }
  }
}
