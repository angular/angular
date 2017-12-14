import * as path from 'path';
import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as minimatch from 'minimatch';

/**
 * Rule that enforces certain decorator properties to be defined and to match a pattern.
 * Properties can be forbidden by prefixing their name with a `!`.
 * Supports whitelisting files via the third argument. E.g.
 *
 * ```
 * "validate-decorators": [true, {
 *   "Component": {
 *     "encapsulation": "\\.None$",
 *     "!styles": ".*"
 *   }
 * }, "src/lib"]
 * ```
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

/** Represents a set of required and forbidden decorator properties. */
type DecoratorRuleSet = {
  required:  {[key: string]: RegExp},
  forbidden:  {[key: string]: RegExp},
};

/** Represents a map between decorator names and rule sets. */
type DecoratorRules = {
  [key: string]: DecoratorRuleSet
};

class Walker extends Lint.RuleWalker {
  // Whether the file should be checked at all.
  private _enabled: boolean;

  // Rules that will be used to validate the decorators.
  private _rules: DecoratorRules;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);

    // Globs that are used to determine which files to lint.
    const fileGlobs = options.ruleArguments.slice(1) || [];

    // Relative path for the current TypeScript source file.
    const relativeFilePath = path.relative(process.cwd(), sourceFile.fileName);

    this._rules = this._generateRules(options.ruleArguments[0]);
    this._enabled = Object.keys(this._rules).length > 0 &&
                    fileGlobs.some(p => minimatch(relativeFilePath, p));
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    if (this._enabled && node.decorators) {
      node.decorators
        .map(decorator => decorator.expression as any)
        .filter(expression => expression.arguments.length && expression.arguments[0].properties)
        .forEach(expression => this._validatedDecorator(expression));
    }

    super.visitClassDeclaration(node);
  }

  /**
   * Validates that a decorator matches all of the defined rules.
   * @param decorator Decorator to be checked.
   */
  private _validatedDecorator(decorator: any) {
    // Get the rules that are relevant for the current decorator.
    const rules = this._rules[decorator.expression.getText()];

    // Don't do anything if there are no rules.
    if (!rules) {
      return;
    }

    // Extract the property names and values.
    const props = decorator.arguments[0].properties.map((node: ts.PropertyAssignment) => ({
      name: node.name.getText(),
      value: node.initializer.getText(),
      node
    }));

    // Find all of the required rule properties that are missing from the decorator.
    const missing = Object.keys(rules.required)
        .filter(key => !props.find((prop: any) => prop.name === key));

    if (missing.length) {
      // Exit early if any of the properties are missing.
      this.addFailureAtNode(decorator.parent, 'Missing required properties: ' + missing.join(', '));
    } else {
      // If all the necessary properties are defined, ensure that
      // they match the pattern and aren't in the forbidden list.
      props
        .filter((prop: any) => rules.required[prop.name] || rules.forbidden[prop.name])
        .forEach((prop: any) => {
          const {name, value, node} = prop;
          const requiredPattern = rules.required[name];
          const forbiddenPattern = rules.forbidden[name];

          if (requiredPattern && !requiredPattern.test(value)) {
            this.addFailureAtNode(node, `Invalid value for property. ` +
                                        `Expected value to match "${requiredPattern}".`);
          } else if (forbiddenPattern && forbiddenPattern.test(value)) {
            this.addFailureAtNode(node, `Property value not allowed. ` +
                                        `Value should not match "${forbiddenPattern}".`);
          }
        });
    }
  }

  /**
   * Cleans out the blank rules that are passed through the tslint.json
   * and converts the string patterns into regular expressions.
   * @param config Config object passed in via the tslint.json.
   * @returns Sanitized rules.
   */
  private _generateRules(config: {[key: string]: {[key: string]: string}}): DecoratorRules {
    const output: DecoratorRules = {};

    if (config) {
      Object.keys(config)
        .filter(decoratorName => Object.keys(config[decoratorName]).length > 0)
        .forEach(decoratorName => {
          output[decoratorName] = Object.keys(config[decoratorName]).reduce((accumulator, prop) => {
            const isForbidden = prop.startsWith('!');
            const cleanName = isForbidden ? prop.slice(1) : prop;
            const pattern = new RegExp(config[decoratorName][prop]);

            if (isForbidden) {
              accumulator.forbidden[cleanName] = pattern;
            } else {
              accumulator.required[cleanName] = pattern;
            }

            return accumulator;
          }, {required: {}, forbidden: {}} as DecoratorRuleSet);
        });
    }

    return output;
  }
}
