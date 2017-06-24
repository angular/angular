const Lint = require('tslint');
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

    // Whitelist with regular expressions to use when determining which files to lint.
    const whitelist = options.ruleArguments;

    // Whether the file should be checked at all.
    this._enabled = !whitelist.length || whitelist.some(p => new RegExp(p).test(file.fileName));
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
