import * as Lint from 'tslint';
import * as ts from 'typescript';

const RULE_FAILURE = `Class inherits constructor using dependency injection from ` +
    `undecorated base class. This breaks dependency injection with Ivy and can be fixed ` +
    `by creating an explicit pass-through constructor.`;

/**
 * Rule that doesn't allow inheriting a constructor using dependency injection from an
 * undecorated base class. With Ivy, undecorated base classes cannot use dependency
 * injection. Classes that inherit the constructor from the base class can specify
 * an explicit pass-through constructor to make DI work.
 */
export class Rule extends Lint.Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new Walker(sourceFile, this.getOptions(), program.getTypeChecker()));
  }
}

class Walker extends Lint.RuleWalker {
  constructor(
      sourceFile: ts.SourceFile, options: Lint.IOptions, private typeChecker: ts.TypeChecker) {
    super(sourceFile, options);
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    if (!this.hasDirectiveDecorator(node)) {
      return;
    }

    // If the class already has an explicit constructor, it's not required
    // for base classes to be decorated.
    if (this.hasExplicitConstructor(node)) {
      return;
    }

    const baseClass = this.getConstructorBaseClass(node);
    if (baseClass && !this.hasDirectiveDecorator(baseClass)) {
      this.addFailureAtNode(node, RULE_FAILURE);
    }
  }

  /** Checks whether the given class declaration has an explicit constructor. */
  hasExplicitConstructor(node: ts.ClassDeclaration): boolean {
    return node.members.some(ts.isConstructorDeclaration);
  }

  /** Checks if the specified node has a "@Directive" or "@Component" decorator. */
  hasDirectiveDecorator(node: ts.ClassDeclaration): boolean {
    return !!node.decorators && node.decorators.some(d => {
      if (!ts.isCallExpression(d.expression)) {
        return false;
      }

      const decoratorText = d.expression.expression.getText();
      return decoratorText === 'Directive' || decoratorText === 'Component';
    });
  }

  /**
   * Gets the first inherited class of the specified class that has an
   * explicit constructor.
   */
  getConstructorBaseClass(node: ts.ClassDeclaration): ts.ClassDeclaration|null {
    let currentClass = node;
    while (currentClass) {
      const baseTypes = this.getBaseTypeIdentifiers(currentClass);
      if (!baseTypes || baseTypes.length !== 1) {
        return null;
      }
      const symbol = this.typeChecker.getTypeAtLocation(baseTypes[0]).getSymbol();
      if (!symbol || !ts.isClassDeclaration(symbol.valueDeclaration)) {
        return null;
      }
      if (this.hasExplicitConstructor(symbol.valueDeclaration)) {
        return symbol.valueDeclaration;
      }
      currentClass = symbol.valueDeclaration;
    }
    return null;
  }

  /** Determines the base type identifiers of a specified class declaration. */
  getBaseTypeIdentifiers(node: ts.ClassDeclaration): ts.Identifier[]|null {
    if (!node.heritageClauses) {
      return null;
    }

    return node.heritageClauses.filter(clause => clause.token === ts.SyntaxKind.ExtendsKeyword)
        .reduce(
            (types, clause) => types.concat(clause.types), [] as ts.ExpressionWithTypeArguments[])
        .map(typeExpression => typeExpression.expression)
        .filter(ts.isIdentifier);
  }
}
