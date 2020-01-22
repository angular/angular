import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as tsutils from 'tsutils';

const TYPE_ACCEPT_MEMBER_PREFIX = 'ngAcceptInputType_';

/**
 * Type that describes the TypeScript type checker with internal methods for
 * the type relation API methods being exposed.
 */
// TODO: remove if https://github.com/microsoft/TypeScript/issues/9879 is resolved.
type TypeCheckerWithRelationApi = ts.TypeChecker & {
  getNullType: () => ts.Type;
  getUndefinedType: () => ts.Type;
  isTypeAssignableTo: (a: ts.Type, b: ts.Type) => boolean;
};

/**
 * TSLint rule that verifies that classes declare corresponding `ngAcceptInputType_*`
 * static fields for inputs that use coercion inside of their setters. Also handles
 * inherited class members and members that come from an interface.
 */
export class Rule extends Lint.Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions(),
        program.getTypeChecker() as TypeCheckerWithRelationApi);
    return this.applyWithWalker(walker);
  }
}

class Walker extends Lint.RuleWalker {
  /** Names of the coercion functions that we should be looking for. */
  private _coercionFunctions: Set<string>;

  /** Mapping of interfaces known to have coercion properties and the property names themselves. */
  private _coercionInterfaces: {[interfaceName: string]: string[]};

  /** Type resolving to the TS internal `null` type. */
  private _nullType = this._typeChecker.getNullType();

  /** Type resolving to the TS internal `undefined` type. */
  private _undefinedType = this._typeChecker.getUndefinedType();

  constructor(sourceFile: ts.SourceFile,
              options: Lint.IOptions,
              private _typeChecker: TypeCheckerWithRelationApi) {
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
      this._lintClass(node, node, true);
      this._lintSuperClasses(node);
      this._lintInterfaces(node, node, true);
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

    const type = this._typeChecker.getTypeFromTypeNode(node.type);
    const hasUndefined = this._typeChecker.isTypeAssignableTo(this._undefinedType, type);
    const hasNull = this._typeChecker.isTypeAssignableTo(this._nullType, type);

    if (!hasNull && !hasUndefined) {
      this.addFailureAtNode(
          node, 'Acceptance member has to accept "null" and "undefined".',
          this.appendText(node.type.getEnd(), ' | null | undefined'));
    } else if (!hasNull) {
      this.addFailureAtNode(
          node, 'Acceptance member has to accept "null".',
          this.appendText(node.type.getEnd(), ' | null'));
    } else if (!hasUndefined) {
      this.addFailureAtNode(
          node, 'Acceptance member has to accept "undefined".',
          this.appendText(node.type.getEnd(), ' | undefined'));
    }
  }

  /**
   * Goes through the own setters of a class declaration and checks whether they use coercion.
   * @param node Class declaration to be checked.
   * @param sourceClass Class declaration on which to look for static properties that declare the
   *    accepted values for the setter.
   * @param expectDeclaredMembers Whether acceptance members should be expected or unexpected.
   */
  private _lintClass(node: ts.ClassDeclaration, sourceClass: ts.ClassDeclaration,
      expectDeclaredMembers: boolean): void {
    node.members.forEach(member => {
      if (ts.isSetAccessor(member) && usesCoercion(member, this._coercionFunctions) &&
          this._shouldCheckSetter(member)) {
        this._checkStaticMember(sourceClass, member.name.getText(), expectDeclaredMembers);
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
        // Acceptance members should not be re-declared in the derived class. This
        // is because acceptance members are inherited.
        this._lintClass(currentClass, node, false);
        this._lintInterfaces(currentClass, node, false);
      }
    }
  }

  /**
   * Checks whether the interfaces that a class implements contain any known coerced properties.
   * @param node Class declaration to be checked.
   * @param sourceClass Class declaration on which to look for static properties that declare the
   *    accepted values for the setter.
   * @param expectDeclaredMembers Whether acceptance members should be expected or unexpected.
   */
  private _lintInterfaces(node: ts.ClassDeclaration, sourceClass: ts.ClassDeclaration,
                          expectDeclaredMembers: boolean): void {
    if (!node.heritageClauses) {
      return;
    }

    node.heritageClauses.forEach(clause => {
      if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
        clause.types.forEach(clauseType => {
          if (ts.isIdentifier(clauseType.expression)) {
            const propNames = this._coercionInterfaces[clauseType.expression.text];

            if (propNames) {
              propNames.forEach(propName =>
                  this._checkStaticMember(sourceClass, propName, expectDeclaredMembers));
            }
          }
        });
      }
    });
  }

  /**
   * Based on whether the acceptance members are expected or not, this method checks whether
   * the specified class declaration matches the condition.
   */
  private _checkStaticMember(node: ts.ClassDeclaration, setterName: string,
                             expectDeclaredMembers: boolean) {
    const {memberName, memberNode} = this._lookupStaticMember(node, setterName);
    if (expectDeclaredMembers && !memberNode) {
      this.addFailureAtNode(node.name || node, `Class must declare static coercion ` +
        `property called ${memberName}.`);
    } else if (!expectDeclaredMembers && memberNode) {
      this.addFailureAtNode(node.name || node, `Class should not declare static coercion ` +
        `property called ${memberName}. Acceptance members are inherited.`,
        Lint.Replacement.deleteText(memberNode.getFullStart(), memberNode.getFullWidth()));
    }
  }

  /** Checks whether this rule should lint a class declaration. */
  private _shouldLintClass(node: ts.ClassDeclaration): boolean {
    // We don't need to lint undecorated classes.
    if (!node.decorators) {
      return false;
    }
    // If the class is a component,  we should lint it.
    if (node.decorators.some(decorator => isDecoratorCalled(decorator, 'Component'))) {
      return true;
    }
    // If the class is a directive, we should lint it.
    return node.decorators.some(decorator => isDecoratorCalled(decorator, 'Directive'));
  }

  /** Looks for a static member that corresponds to the given property. */
  private _lookupStaticMember(node: ts.ClassDeclaration, propName: string)
    : {memberName: string, memberNode?: ts.PropertyDeclaration} {
    const coercionPropertyName = `${TYPE_ACCEPT_MEMBER_PREFIX}${propName}`;
    const correspondingCoercionProperty = node.members
      .find((member): member is ts.PropertyDeclaration => {
        return ts.isPropertyDeclaration(member) &&
          tsutils.hasModifier(member.modifiers, ts.SyntaxKind.StaticKeyword) &&
          member.name.getText() === coercionPropertyName;
      });
    return {memberName: coercionPropertyName, memberNode: correspondingCoercionProperty};
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
