import * as path from 'path';
import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as minimatch from 'minimatch';

/**
 * Rule that enforces consistent file name casing across files. This a simplified version of the
 * `file-casing-rule` from tslint which adds the ability to ignore certain files.
 * TODO(crisbeto): we may be able to replace this rule with once the following changes are released:
 * https://github.com/palantir/tslint/pull/4206
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  /** Whether the current file should be checked. */
  private _enabled: boolean;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);

    const ignorePattern = options.ruleArguments;
    const relativeFilePath = path.relative(process.cwd(), sourceFile.fileName);

    this._enabled = ignorePattern.every(p => !minimatch(relativeFilePath, p));
  }

  visitSourceFile(sourceFile: ts.SourceFile) {
    if (!this._enabled) {
      return;
    }

    const fileName = path.basename(sourceFile.fileName);

    for (let i = 0; i < fileName.length; i++) {
      const character = fileName[i];

      // Ensure that the current character is an allowed separator and is in lower case.
      if (character === '_' || character !== character.toLowerCase()) {
        this.addFailureAt(0, 0, 'File name must be in kebab-case.');
      }
    }

    super.visitSourceFile(sourceFile);
  }
}
