import * as ts from 'typescript';
import * as tsutils from 'tsutils';
import * as Lint from 'tslint';

/**
 * Lint rule that checks the names of class members against a pattern. Configured per modifier, e.g.
 * {
 *   "member-naming": [true, {
 *     "private": "^_" // All private properties should start with `_`.
 *   }]
 * }
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  /** Configured patterns for each of the modifiers. */
  private _config: {
    private?: RegExp;
    protected?: RegExp;
    public?: RegExp;
  };

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);

    const args = options.ruleArguments[0] || {};

    this._config = Object.keys(args).reduce((config, key) => {
      config[key] = new RegExp(args[key]);
      return config;
    }, {} as {[key: string]: RegExp});
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    node.members.forEach(member => {
      // Members without a modifier are considered public.
      if (!member.modifiers || tsutils.hasModifier(member.modifiers, ts.SyntaxKind.PublicKeyword)) {
        this._validateMember(member, 'public');
      } else if (tsutils.hasModifier(member.modifiers, ts.SyntaxKind.PrivateKeyword)) {
        this._validateMember(member, 'private');
      } else if (tsutils.hasModifier(member.modifiers, ts.SyntaxKind.ProtectedKeyword)) {
        this._validateMember(member, 'protected');
      }
    });

    super.visitClassDeclaration(node);
  }

  visitConstructorDeclaration(node: ts.ConstructorDeclaration) {
    node.parameters.forEach(param => {
      const modifiers = param.modifiers;

      // Check class members that were declared via the constructor
      // (e.g. `constructor(private _something: number)`. These nodes don't
      // show up under `ClassDeclaration.members`.
      if (tsutils.hasModifier(modifiers, ts.SyntaxKind.ReadonlyKeyword) ||
          tsutils.hasModifier(modifiers, ts.SyntaxKind.PublicKeyword)) {
        this._validateNode(param, 'public');
      } else if (tsutils.hasModifier(modifiers, ts.SyntaxKind.PrivateKeyword)) {
        this._validateNode(param, 'private');
      } else if (tsutils.hasModifier(modifiers, ts.SyntaxKind.ProtectedKeyword)) {
        this._validateNode(param, 'protected');
      }
    });

    super.visitConstructorDeclaration(node);
  }

  /**
   * Validates that a class member matches the pattern configured for the particular modifier.
   * @param node Class member to be validated.
   * @param modifier Modifiers against which to validate.
   */
  private _validateMember(node: ts.ClassElement, modifier: 'public' | 'private' | 'protected') {
    if (ts.isMethodDeclaration(node) || ts.isPropertyDeclaration(node)) {
      this._validateNode(node, modifier);
    }
  }

  /**
   * Validates that a node matches the pattern for the corresponding modifier.
   * @param node Node to be validated.
   * @param modifier Modifier to validate against.
   */
  private _validateNode(node: ts.Node & {name: ts.PropertyName | ts.BindingName},
                        modifier: 'public' | 'private' | 'protected') {
    const pattern = this._config[modifier];

    if (pattern) {
      const failureMessage = `${modifier} modifier name has to match the pattern ${pattern}`;

      if (!pattern.test(node.name.getText())) {
        this.addFailureAtNode(node.name, failureMessage);
      }
    }
  }
}
