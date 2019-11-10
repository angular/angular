import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as tsutils from 'tsutils';

const TYPE_ACCEPT_MEMBER_PREFIX = 'ngAcceptInputType_';

/**
 * TSLint rule that verifies that classes declare corresponding `ngAcceptInputType_*`
 * static fields for inputs that use coercion inside of their setters. Also handles
 * inherited class members and members that come from an interface.
 */
export class Rule extends Lint.Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions(), program.getTypeChecker());
    return this.applyWithWalker(walker);
  }
}

class Walker extends Lint.RuleWalker {
  /** Names of the coercion functions that we should be looking for. */
  private _coercionFunctions: Set<string>;

  /** Mapping of interfaces known to have coercion properties and the property names themselves. */
  private _coercionInterfaces: {[interfaceName: string]: string[]};

  constructor(sourceFile: ts.SourceFile,
              options: Lint.IOptions,
              private _typeChecker: ts.TypeChecker) {
    super(sourceFile, options);
    this._coercionFunctions = new Set(options.ruleArguments[0] || []);
    this._coercionInterfaces = options.ruleArguments[1] || {};
  }

  visitPropertyDeclaration(node: ts.PropertyDeclaration) {
    if (ts.isIdentifier(node.name) && node.name.text.startsWith(TYPE_ACCEPT_MEMBER_PREFIX)) {
      this._lintCoercionMember(node);
    }
    super.visitPropertyDeclaration(node);
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    if (this._shouldLintClass(node)) {
      this._lintClass(node, node);
      this._lintSuperClasses(node);
      this._lintInterfaces(node, node);
    }
    super.visitClassDeclaration(node);
  }

  /**
   * Checks if the given property declaration of a coercion member includes null and
   * undefined in the type node. We enforce that all acceptance members accept these
   * values since we want coercion inputs to work with the async pipe.
   */
  private _lintCoercionMember(node: ts.PropertyDeclaration) {
    if (!node.type) {
      this.addFailureAtNode(node, 'Acceptance member needs to have an explicit type.');
      return;
    }

    if (node.type.kind === ts.SyntaxKind.AnyKeyword) {
      // if the type is "any", then it can be "null" and "undefined" too.
      return;
    } else if (!ts.isUnionTypeNode(node.type)) {
      this.addFailureAtNode(node, 'Acceptance member does not have an union type. The member ' +
        'should use an union type to also accept "null" and "undefined".');
      return;
    }

    let hasNull = false;
    let hasUndefined = false;
    for (let type of node.type.types) {
      if (type.kind === ts.SyntaxKind.NullKeyword) {
        hasNull = true;
      } else if (type.kind === ts.SyntaxKind.UndefinedKeyword) {
        hasUndefined = true;
      }
    }

    if (!hasNull && !hasUndefined) {
      this.addFailureAtNode(node, 'Acceptance member has to accept "null" and "undefined".',
          this.appendText(node.type.getEnd(), ' | null | undefined'));
    } else if (!hasNull) {
      this.addFailureAtNode(node, 'Acceptance member has to accept "null".',
        this.appendText(node.type.getEnd(), ' | null'));
    } else if (!hasUndefined) {
      this.addFailureAtNode(node, 'Acceptance member has to accept "undefined".',
        this.appendText(node.type.getEnd(), ' | undefined'));
    }
  }

  /**
   * Goes through the own setters of a class declaration and checks whether they use coercion.
   * @param node Class declaration to be checked.
   * @param sourceClass Class declaration on which to look for static properties that declare the
   *    accepted values for the setter.
   */
  private _lintClass(node: ts.ClassDeclaration, sourceClass: ts.ClassDeclaration): void {
    node.members.forEach(member => {
      if (ts.isSetAccessor(member) && usesCoercion(member, this._coercionFunctions) &&
          this._shouldCheckSetter(member)) {
        this._checkForStaticMember(sourceClass, member.name.getText());
      }
    });
  }

  /**
   * Goes up the inheritance chain of a class declaration and
   * checks whether it has any setters using coercion.
   * @param node Class declaration to be checked.
   */
  private _lintSuperClasses(node: ts.ClassDeclaration): void {
    let currentClass: ts.ClassDeclaration|null = node;

    while (currentClass) {
      const baseType = getBaseTypeIdentifier(currentClass);

      if (!baseType) {
        break;
      }

      const symbol = this._typeChecker.getTypeAtLocation(baseType).getSymbol();
      currentClass = symbol && ts.isClassDeclaration(symbol.valueDeclaration) ?
          symbol.valueDeclaration : null;

      if (currentClass) {
        this._lintClass(currentClass, node);
        this._lintInterfaces(currentClass, node);
      }
    }
  }

  /**
   * Checks whether the interfaces that a class implements contain any known coerced properties.
   * @param node Class declaration to be checked.
   * @param sourceClass Class declaration on which to look for static properties that declare the
   *    accepted values for the setter.
   */
  private _lintInterfaces(node: ts.ClassDeclaration, sourceClass: ts.ClassDeclaration): void {
    if (!node.heritageClauses) {
      return;
    }

    node.heritageClauses.forEach(clause => {
      if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
        clause.types.forEach(clauseType => {
          if (ts.isIdentifier(clauseType.expression)) {
            const propNames = this._coercionInterfaces[clauseType.expression.text];

            if (propNames) {
              propNames.forEach(propName => this._checkForStaticMember(sourceClass, propName));
            }
          }
        });
      }
    });
  }

  /**
   * Checks whether a class declaration has a static member, corresponding
   * to the specified setter name, and logs a failure if it doesn't.
   * @param node
   * @param setterName
   */
  private _checkForStaticMember(node: ts.ClassDeclaration, setterName: string) {
    const coercionPropertyName = `${TYPE_ACCEPT_MEMBER_PREFIX}${setterName}`;
    const correspondingCoercionProperty = node.members.find(member => {
      return ts.isPropertyDeclaration(member) &&
             tsutils.hasModifier(member.modifiers, ts.SyntaxKind.StaticKeyword) &&
             member.name.getText() === coercionPropertyName;
    });

    if (!correspondingCoercionProperty) {
      this.addFailureAtNode(node.name || node, `Class must declare static coercion ` +
                                               `property called ${coercionPropertyName}.`);
    }
  }

  /** Checks whether this rule should lint a class declaration. */
  private _shouldLintClass(node: ts.ClassDeclaration): boolean {
    // We don't need to lint undecorated classes.
    if (!node.decorators) {
      return false;
    }

    // If the class is a component we should lint.
    if (node.decorators.some(decorator => isDecoratorCalled(decorator, 'Component'))) {
      return true;
    }

    const directiveDecorator =
        node.decorators.find(decorator => isDecoratorCalled(decorator, 'Directive'));

    if (directiveDecorator) {
      const firstArg = (directiveDecorator.expression as ts.CallExpression).arguments[0];
      const metadata = firstArg && ts.isObjectLiteralExpression(firstArg) ? firstArg : null;
      const selectorProp = metadata ?
          metadata.properties.find((prop): prop is ts.PropertyAssignment => {
            return ts.isPropertyAssignment(prop) && prop.name && ts.isIdentifier(prop.name) &&
                prop.name.text === 'selector';
          }) :
          null;
      const selectorText =
          selectorProp != null && ts.isStringLiteralLike(selectorProp.initializer) ?
          selectorProp.initializer.text :
          null;

      // We only want to lint directives with a selector (i.e. no abstract directives).
      return selectorText !== null;
    }

    return false;
  }

  /** Determines whether a setter node should be checked by the lint rule. */
  private _shouldCheckSetter(node: ts.SetAccessorDeclaration): boolean {
    const param = node.parameters[0];
    const types = this._typeChecker.typeToString(this._typeChecker.getTypeAtLocation(param))
      .split('|').map(name => name.trim());
    // We shouldn't check setters which accept `any` or a `string`.
    return types.every(typeName => typeName !== 'any' && typeName !== 'string');
  }
}

/**
 * Checks whether a setter uses coercion.
 * @param setter Setter node that should be checked.
 * @param coercionFunctions Names of the coercion functions that we should be looking for.
 */
function usesCoercion(setter: ts.SetAccessorDeclaration, coercionFunctions: Set<string>): boolean {
  let coercionWasUsed = false;

  setter.forEachChild(function walk(node: ts.Node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
        coercionFunctions.has(node.expression.text)) {
      coercionWasUsed = true;
    }

    // Don't check callback functions since coercion used
    // inside them most-likely won't need to be declared.
    if (!coercionWasUsed && !ts.isArrowFunction(node) && !ts.isFunctionExpression(node)) {
      node.forEachChild(walk);
    }
  });

  return coercionWasUsed;
}

/** Gets the identifier node of the base type that a class is extending. */
function getBaseTypeIdentifier(node: ts.ClassDeclaration): ts.Identifier|null {
  if (node.heritageClauses) {
    for (let clause of node.heritageClauses) {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword && clause.types.length &&
          ts.isIdentifier(clause.types[0].expression)) {
        return clause.types[0].expression;
      }
    }
  }

  return null;
}

/** Checks whether a node is a decorator with a particular name. */
function isDecoratorCalled(node: ts.Decorator, name: string): boolean {
  return ts.isCallExpression(node.expression) &&
         ts.isIdentifier(node.expression.expression) &&
         node.expression.expression.text === name;
}
