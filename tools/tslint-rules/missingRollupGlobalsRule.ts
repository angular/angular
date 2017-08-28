import * as path from 'path';
import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as minimatch from 'minimatch';

/**
 * Rule that enforces that the specified external packages have been included in our Rollup config.
 * Usage: [true, './path/to/rollup/config.json']
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {

  /** Path to the rollup globals configuration file. */
  private _configPath: string;

  /** Rollup globals configuration object. */
  private _config: {[globalName: string]: string};

  /** Whether the walker should check the current source file. */
  private _enabled: boolean;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);

    if (!options.ruleArguments.length) {
      throw Error('missing-rollup-globals: The Rollup config path has to be specified.');
    }

    const [configPath, ...fileGlobs] = options.ruleArguments;

    // Relative path for the current TypeScript source file.
    const relativeFilePath = path.relative(process.cwd(), sourceFile.fileName);

    this._configPath = path.resolve(process.cwd(), configPath);
    this._config = require(this._configPath).rollupGlobals;
    this._enabled = fileGlobs.some(p => minimatch(relativeFilePath, p));
  }

  visitImportDeclaration(node: ts.ImportDeclaration) {
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
