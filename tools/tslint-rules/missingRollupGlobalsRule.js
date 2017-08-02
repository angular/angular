const path = require('path');
const Lint = require('tslint');

// Since the packaging is based on TypeScript and is only compiled at run-time using ts-node, the
// custom TSLint rule is not able to read the map of rollup globals. Because the custom rules
// for TSLint are written in JavaScript we also need to use ts-node here to read the globals.
require('ts-node').register({
  project: path.join(__dirname, '../gulp/tsconfig.json')
});

/**
 * Rule that enforces that the specified external packages have been included in our Rollup config.
 * Usage: [true, './path/to/rollup/config.json']
 */
class Rule extends Lint.Rules.AbstractRule {
  apply(file) {
    return this.applyWithWalker(new Walker(file, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  constructor(file, options) {
    super(...arguments);

    if (!options.ruleArguments.length) {
      throw Error('missing-rollup-globals: The Rollup config path has to be specified.');
    }

    const [configPath, ...whitelist] = options.ruleArguments;

    this._configPath = path.resolve(process.cwd(), configPath);
    this._config = require(this._configPath).rollupGlobals;
    this._enabled = !whitelist.length || whitelist.some(p => new RegExp(p).test(file.fileName));
  }

  visitImportDeclaration(node) {
    // Parse out the module name. The first and last characters are the quote marks.
    const module = node.moduleSpecifier.getText().slice(1, -1);
    const isExternal = !module.startsWith('.') && !module.startsWith('/');

    // Check whether the module is external and whether it's in our config.
    if (this._enabled && isExternal && !this._config[module]) {
      this.addFailureAtNode(node, `Module "${module}" is missing from file ${this._configPath}.`);
    }

    super.visitImportDeclaration(node);
  }
}

exports.Rule = Rule;
