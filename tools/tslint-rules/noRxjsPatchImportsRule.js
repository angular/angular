const Lint = require('tslint');
const minimatch = require('minimatch');
const path = require('path');

const ERROR_MESSAGE = 'Uses of RxJS patch imports are forbidden.';

/**
 * Rule that prevents uses of RxJS patch imports (e.g. `import 'rxjs/add/operator/map').
 * Supports whitelisting via `"no-patch-imports": [true, "\.spec\.ts$"]`.
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

  visitImportDeclaration(node) {
    // Walk through the imports and check if they start with `rxjs/add`.
    if (this._enabled && node.moduleSpecifier.getText().startsWith('rxjs/add', 1)) {
      this.addFailureAtNode(node, ERROR_MESSAGE);
    }

    super.visitImportDeclaration(node);
  }
}

exports.Rule = Rule;
