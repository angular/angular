const Lint = require('tslint');
const path = require('path');
const minimatch = require('minimatch');

const ERROR_MESSAGE = 'Components must turn off view encapsulation.';

// TODO(crisbeto): combine this with the OnPush rule when it gets in.

/**
 * Rule that enforces that view encapsulation is turned off on all components.
 * Files can be whitelisted via `"no-view-encapsulation": [true, "\.spec\.ts$"]`.
 */
class Rule extends Lint.Rules.AbstractRule {
  apply(file) {
    return this.applyWithWalker(new Walker(file, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  constructor(file, options) {
    super(...arguments);

    // Globs that are used to determine which files to lint.
    const fileGlobs = options.ruleArguments || [];

    // Relative path for the current TypeScript source file.
    const relativeFilePath = path.relative(process.cwd(), file.fileName);

    // Whether the file should be checked at all.
    this._enabled = fileGlobs.some(p => minimatch(relativeFilePath, p));
  }

  visitClassDeclaration(node) {
    if (!this._enabled || !node.decorators) return;

    node.decorators
      .map(decorator => decorator.expression)
      .filter(expression => expression.expression.getText() === 'Component')
      .filter(expression => expression.arguments.length && expression.arguments[0].properties)
      .forEach(expression => {
        const hasTurnedOffEncapsulation = expression.arguments[0].properties.some(prop => {
          const value = prop.initializer.getText();
          return prop.name.getText() === 'encapsulation' && value.endsWith('.None');
        });

        if (!hasTurnedOffEncapsulation) {
          this.addFailureAtNode(expression.parent, ERROR_MESSAGE);
        }
      });
  }

}

exports.Rule = Rule;
