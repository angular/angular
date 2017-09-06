import * as path from 'path';
import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as minimatch from 'minimatch';

const ERROR_MESSAGE = 'Components must turn off view encapsulation.';

// TODO(crisbeto): combine this with the OnPush rule when it gets in.

/**
 * Rule that enforces that view encapsulation is turned off on all components.
 * Files can be whitelisted via `"no-view-encapsulation": [true, "\.spec\.ts$"]`.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {

  /** Whether the walker should check the current source file. */
  private _enabled: boolean;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);

    // Globs that are used to determine which files to lint.
    const fileGlobs = options.ruleArguments || [];

    // Relative path for the current TypeScript source file.
    const relativeFilePath = path.relative(process.cwd(), sourceFile.fileName);

    // Whether the file should be checked at all.
    this._enabled = fileGlobs.some(p => minimatch(relativeFilePath, p));
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    if (!this._enabled || !node.decorators) {
      return;
    }

    node.decorators
      .map(decorator => decorator.expression as any)
      .filter(expression => expression.expression.getText() === 'Component')
      .filter(expression => expression.arguments.length && expression.arguments[0].properties)
      .forEach(expression => {
        const hasTurnedOffEncapsulation = expression.arguments[0].properties.some((prop: any) => {
          const value = prop.initializer.getText();
          return prop.name.getText() === 'encapsulation' && value.endsWith('.None');
        });

        if (!hasTurnedOffEncapsulation) {
          this.addFailureAtNode(expression.parent, ERROR_MESSAGE);
        }
      });
  }

}
