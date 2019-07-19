/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ClassDeclaration, ClassMember, ClassMemberKind, ClassSymbol, CtorParameter, Declaration, Decorator, FunctionDefinition, Parameter, TsHelperFn, isNamedVariableDeclaration, reflectObjectLiteral} from '../../../src/ngtsc/reflection';
import {isFromDtsFile} from '../../../src/ngtsc/util/src/typescript';
import {getNameText, hasNameIdentifier, stripDollarSuffix} from '../utils';

import {Esm2015ReflectionHost, ParamInfo, getPropertyValueFromSymbol, isAssignmentStatement} from './esm2015_host';



/**
 * ESM5 packages contain ECMAScript IIFE functions that act like classes. For example:
 *
 * ```
 * var CommonModule = (function () {
 *  function CommonModule() {
 *  }
 *  CommonModule.decorators = [ ... ];
 * ```
 *
 * * "Classes" are decorated if they have a static property called `decorators`.
 * * Members are decorated if there is a matching key on a static property
 *   called `propDecorators`.
 * * Constructor parameters decorators are found on an object returned from
 *   a static method called `ctorParameters`.
 *
 */
export class Esm5ReflectionHost extends Esm2015ReflectionHost {
  /**
   * Determines whether the given declaration, which should be a "class", has a base "class".
   *
   * In ES5 code, we need to determine if the IIFE wrapper takes a `_super` parameter .
   *
   * @param clazz a `ClassDeclaration` representing the class over which to reflect.
   */
  hasBaseClass(clazz: ClassDeclaration): boolean {
    if (super.hasBaseClass(clazz)) return true;

    const classDeclaration = this.getClassDeclaration(clazz);
    if (!classDeclaration) return false;

    const iifeBody = getIifeBody(classDeclaration);
    if (!iifeBody) return false;

    const iife = iifeBody.parent;
    if (!iife || !ts.isFunctionExpression(iife)) return false;

    return iife.parameters.length === 1 && isSuperIdentifier(iife.parameters[0].name);
  }

  getBaseClassExpression(clazz: ClassDeclaration): ts.Expression|null {
    const superBaseClassIdentifier = super.getBaseClassExpression(clazz);
    if (superBaseClassIdentifier) {
      return superBaseClassIdentifier;
    }

    const classDeclaration = this.getClassDeclaration(clazz);
    if (!classDeclaration) return null;

    const iifeBody = getIifeBody(classDeclaration);
    if (!iifeBody) return null;

    const iife = iifeBody.parent;
    if (!iife || !ts.isFunctionExpression(iife)) return null;

    if (iife.parameters.length !== 1 || !isSuperIdentifier(iife.parameters[0].name)) {
      return null;
    }

    if (!ts.isCallExpression(iife.parent)) {
      return null;
    }

    return iife.parent.arguments[0];
  }

  /**
   * Find the declaration of a class given a node that we think represents the class.
   *
   * In ES5, the implementation of a class is a function expression that is hidden inside an IIFE,
   * whose value is assigned to a variable (which represents the class to the rest of the program).
   * So we might need to dig around to get hold of the "class" declaration.
   *
   * `node` might be one of:
   * - A class declaration (from a typings file).
   * - The declaration of the outer variable, which is assigned the result of the IIFE.
   * - The function declaration inside the IIFE, which is eventually returned and assigned to the
   *   outer variable.
   *
   * The returned declaration is either the class declaration (from the typings file) or the outer
   * variable declaration.
   *
   * @param node the node that represents the class whose declaration we are finding.
   * @returns the declaration of the class or `undefined` if it is not a "class".
   */
  getClassDeclaration(node: ts.Node): ClassDeclaration|undefined {
    const superDeclaration = super.getClassDeclaration(node);
    if (superDeclaration) return superDeclaration;

    const outerClass = getClassDeclarationFromInnerFunctionDeclaration(node);
    if (outerClass) return outerClass;

    // At this point, `node` could be the outer variable declaration of an ES5 class.
    // If so, ensure that it has a `name` identifier and the correct structure.
    if (!isNamedVariableDeclaration(node) ||
        !this.getInnerFunctionDeclarationFromClassDeclaration(node)) {
      return undefined;
    }

    return node;
  }

  /**
   * Trace an identifier to its declaration, if possible.
   *
   * This method attempts to resolve the declaration of the given identifier, tracing back through
   * imports and re-exports until the original declaration statement is found. A `Declaration`
   * object is returned if the original declaration is found, or `null` is returned otherwise.
   *
   * In ES5, the implementation of a class is a function expression that is hidden inside an IIFE.
   * If we are looking for the declaration of the identifier of the inner function expression, we
   * will get hold of the outer "class" variable declaration and return its identifier instead. See
   * `getClassDeclarationFromInnerFunctionDeclaration()` for more info.
   *
   * @param id a TypeScript `ts.Identifier` to trace back to a declaration.
   *
   * @returns metadata about the `Declaration` if the original declaration is found, or `null`
   * otherwise.
   */
  getDeclarationOfIdentifier(id: ts.Identifier): Declaration|null {
    // Get the identifier for the outer class node (if any).
    const outerClassNode = getClassDeclarationFromInnerFunctionDeclaration(id.parent);
    const declaration = super.getDeclarationOfIdentifier(outerClassNode ? outerClassNode.name : id);

    if (!declaration || !ts.isVariableDeclaration(declaration.node) ||
        declaration.node.initializer !== undefined ||
        // VariableDeclaration => VariableDeclarationList => VariableStatement => IIFE Block
        !ts.isBlock(declaration.node.parent.parent.parent)) {
      return declaration;
    }

    // We might have an alias to another variable declaration.
    // Search the containing iife body for it.
    const block = declaration.node.parent.parent.parent;
    const aliasSymbol = this.checker.getSymbolAtLocation(declaration.node.name);
    for (let i = 0; i < block.statements.length; i++) {
      const statement = block.statements[i];
      // Looking for statement that looks like: `AliasedVariable = OriginalVariable;`
      if (isAssignmentStatement(statement) && ts.isIdentifier(statement.expression.left) &&
          ts.isIdentifier(statement.expression.right) &&
          this.checker.getSymbolAtLocation(statement.expression.left) === aliasSymbol) {
        return this.getDeclarationOfIdentifier(statement.expression.right);
      }
    }

    return declaration;
  }

  /**
   * Parse a function declaration to find the relevant metadata about it.
   *
   * In ESM5 we need to do special work with optional arguments to the function, since they get
   * their own initializer statement that needs to be parsed and then not included in the "body"
   * statements of the function.
   *
   * @param node the function declaration to parse.
   * @returns an object containing the node, statements and parameters of the function.
   */
  getDefinitionOfFunction(node: ts.Node): FunctionDefinition|null {
    if (!ts.isFunctionDeclaration(node) && !ts.isMethodDeclaration(node) &&
        !ts.isFunctionExpression(node) && !ts.isVariableDeclaration(node)) {
      return null;
    }

    const tsHelperFn = getTsHelperFn(node);
    if (tsHelperFn !== null) {
      return {
        node,
        body: null,
        helper: tsHelperFn,
        parameters: [],
      };
    }

    // If the node was not identified to be a TypeScript helper, a variable declaration at this
    // point cannot be resolved as a function.
    if (ts.isVariableDeclaration(node)) {
      return null;
    }

    const parameters =
        node.parameters.map(p => ({name: getNameText(p.name), node: p, initializer: null}));
    let lookingForParamInitializers = true;

    const statements = node.body && node.body.statements.filter(s => {
      lookingForParamInitializers =
          lookingForParamInitializers && reflectParamInitializer(s, parameters);
      // If we are no longer looking for parameter initializers then we include this statement
      return !lookingForParamInitializers;
    });

    return {node, body: statements || null, helper: null, parameters};
  }

  /**
   * Examine a declaration which should be of a class, and return metadata about the members of the
   * class.
   *
   * @param declaration a TypeScript `ts.Declaration` node representing the class over which to
   * reflect.
   *
   * @returns an array of `ClassMember` metadata representing the members of the class.
   *
   * @throws if `declaration` does not resolve to a class declaration.
   */
  getMembersOfClass(clazz: ClassDeclaration): ClassMember[] {
    // Do not follow ES5's resolution logic when the node resides in a .d.ts file.
    if (isFromDtsFile(clazz)) {
      return super.getMembersOfClass(clazz);
    }

    // The necessary info is on the inner function declaration (inside the ES5 class IIFE).
    const innerFunctionSymbol = this.getInnerFunctionSymbolFromClassDeclaration(clazz);
    if (!innerFunctionSymbol) {
      throw new Error(
          `Attempted to get members of a non-class: "${(clazz as ClassDeclaration).getText()}"`);
    }

    return this.getMembersOfSymbol(innerFunctionSymbol);
  }

  /** Gets all decorators of the given class symbol. */
  getDecoratorsOfSymbol(symbol: ClassSymbol): Decorator[]|null {
    // The necessary info is on the inner function declaration (inside the ES5 class IIFE).
    const innerFunctionSymbol =
        this.getInnerFunctionSymbolFromClassDeclaration(symbol.valueDeclaration);
    if (!innerFunctionSymbol) return null;

    return super.getDecoratorsOfSymbol(innerFunctionSymbol);
  }


  ///////////// Protected Helpers /////////////

  /**
   * Get the inner function declaration of an ES5-style class.
   *
   * In ES5, the implementation of a class is a function expression that is hidden inside an IIFE
   * and returned to be assigned to a variable outside the IIFE, which is what the rest of the
   * program interacts with.
   *
   * Given the outer variable declaration, we want to get to the inner function declaration.
   *
   * @param node a node that could be the variable expression outside an ES5 class IIFE.
   * @param checker the TS program TypeChecker
   * @returns the inner function declaration or `undefined` if it is not a "class".
   */
  protected getInnerFunctionDeclarationFromClassDeclaration(node: ts.Node): ts.FunctionDeclaration
      |undefined {
    if (!ts.isVariableDeclaration(node)) return undefined;

    // Extract the IIFE body (if any).
    const iifeBody = getIifeBody(node);
    if (!iifeBody) return undefined;

    // Extract the function declaration from inside the IIFE.
    const functionDeclaration = iifeBody.statements.find(ts.isFunctionDeclaration);
    if (!functionDeclaration) return undefined;

    // Extract the return identifier of the IIFE.
    const returnIdentifier = getReturnIdentifier(iifeBody);
    const returnIdentifierSymbol =
        returnIdentifier && this.checker.getSymbolAtLocation(returnIdentifier);
    if (!returnIdentifierSymbol) return undefined;

    // Verify that the inner function is returned.
    if (returnIdentifierSymbol.valueDeclaration !== functionDeclaration) return undefined;

    return functionDeclaration;
  }

  /**
   * Get the identifier symbol of the inner function declaration of an ES5-style class.
   *
   * In ES5, the implementation of a class is a function expression that is hidden inside an IIFE
   * and returned to be assigned to a variable outside the IIFE, which is what the rest of the
   * program interacts with.
   *
   * Given the outer variable declaration, we want to get to the identifier symbol of the inner
   * function declaration.
   *
   * @param clazz a node that could be the variable expression outside an ES5 class IIFE.
   * @param checker the TS program TypeChecker
   * @returns the inner function declaration identifier symbol or `undefined` if it is not a "class"
   * or has no identifier.
   */
  protected getInnerFunctionSymbolFromClassDeclaration(clazz: ClassDeclaration): ClassSymbol
      |undefined {
    const innerFunctionDeclaration = this.getInnerFunctionDeclarationFromClassDeclaration(clazz);
    if (!innerFunctionDeclaration || !hasNameIdentifier(innerFunctionDeclaration)) return undefined;

    return this.checker.getSymbolAtLocation(innerFunctionDeclaration.name) as ClassSymbol;
  }

  /**
   * Find the declarations of the constructor parameters of a class identified by its symbol.
   *
   * In ESM5, there is no "class" so the constructor that we want is actually the inner function
   * declaration inside the IIFE, whose return value is assigned to the outer variable declaration
   * (that represents the class to the rest of the program).
   *
   * @param classSymbol the symbol of the class (i.e. the outer variable declaration) whose
   * parameters we want to find.
   * @returns an array of `ts.ParameterDeclaration` objects representing each of the parameters in
   * the class's constructor or `null` if there is no constructor.
   */
  protected getConstructorParameterDeclarations(classSymbol: ClassSymbol):
      ts.ParameterDeclaration[]|null {
    const constructor =
        this.getInnerFunctionDeclarationFromClassDeclaration(classSymbol.valueDeclaration);
    if (!constructor) return null;

    if (constructor.parameters.length > 0) {
      return Array.from(constructor.parameters);
    }

    if (isSynthesizedConstructor(constructor)) {
      return null;
    }

    return [];
  }

  /**
   * Get the parameter decorators of a class constructor.
   *
   * @param classSymbol the symbol of the class (i.e. the outer variable declaration) whose
   * parameter info we want to get.
   * @param parameterNodes the array of TypeScript parameter nodes for this class's constructor.
   * @returns an array of constructor parameter info objects.
   */
  protected getConstructorParamInfo(
      classSymbol: ClassSymbol, parameterNodes: ts.ParameterDeclaration[]): CtorParameter[] {
    // The necessary info is on the inner function declaration (inside the ES5 class IIFE).
    const innerFunctionSymbol =
        this.getInnerFunctionSymbolFromClassDeclaration(classSymbol.valueDeclaration);
    if (!innerFunctionSymbol) return [];

    return super.getConstructorParamInfo(innerFunctionSymbol, parameterNodes);
  }

  /**
   * Get the parameter type and decorators for the constructor of a class,
   * where the information is stored on a static method of the class.
   *
   * In this case the decorators are stored in the body of a method
   * (`ctorParatemers`) attached to the constructor function.
   *
   * Note that unlike ESM2015 this is a function expression rather than an arrow
   * function:
   *
   * ```
   * SomeDirective.ctorParameters = function() { return [
   *   { type: ViewContainerRef, },
   *   { type: TemplateRef, },
   *   { type: IterableDiffers, },
   *   { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN,] },] },
   * ]; };
   * ```
   *
   * @param paramDecoratorsProperty the property that holds the parameter info we want to get.
   * @returns an array of objects containing the type and decorators for each parameter.
   */
  protected getParamInfoFromStaticProperty(paramDecoratorsProperty: ts.Symbol): ParamInfo[]|null {
    const paramDecorators = getPropertyValueFromSymbol(paramDecoratorsProperty);
    // The decorators array may be wrapped in a function. If so unwrap it.
    const returnStatement = getReturnStatement(paramDecorators);
    const expression = returnStatement ? returnStatement.expression : paramDecorators;
    if (expression && ts.isArrayLiteralExpression(expression)) {
      const elements = expression.elements;
      return elements.map(reflectArrayElement).map(paramInfo => {
        const typeExpression = paramInfo && paramInfo.has('type') ? paramInfo.get('type') ! : null;
        const decoratorInfo =
            paramInfo && paramInfo.has('decorators') ? paramInfo.get('decorators') ! : null;
        const decorators = decoratorInfo && this.reflectDecorators(decoratorInfo);
        return {typeExpression, decorators};
      });
    } else if (paramDecorators !== undefined) {
      this.logger.warn(
          'Invalid constructor parameter decorator in ' + paramDecorators.getSourceFile().fileName +
              ':\n',
          paramDecorators.getText());
    }
    return null;
  }

  /**
   * Reflect over a symbol and extract the member information, combining it with the
   * provided decorator information, and whether it is a static member.
   *
   * If a class member uses accessors (e.g getters and/or setters) then it gets downleveled
   * in ES5 to a single `Object.defineProperty()` call. In that case we must parse this
   * call to extract the one or two ClassMember objects that represent the accessors.
   *
   * @param symbol the symbol for the member to reflect over.
   * @param decorators an array of decorators associated with the member.
   * @param isStatic true if this member is static, false if it is an instance property.
   * @returns the reflected member information, or null if the symbol is not a member.
   */
  protected reflectMembers(symbol: ts.Symbol, decorators?: Decorator[], isStatic?: boolean):
      ClassMember[]|null {
    const node = symbol.valueDeclaration || symbol.declarations && symbol.declarations[0];
    const propertyDefinition = node && getPropertyDefinition(node);
    if (propertyDefinition) {
      const members: ClassMember[] = [];
      if (propertyDefinition.setter) {
        members.push({
          node,
          implementation: propertyDefinition.setter,
          kind: ClassMemberKind.Setter,
          type: null,
          name: symbol.name,
          nameNode: null,
          value: null,
          isStatic: isStatic || false,
          decorators: decorators || [],
        });

        // Prevent attaching the decorators to a potential getter. In ES5, we can't tell where the
        // decorators were originally attached to, however we only want to attach them to a single
        // `ClassMember` as otherwise ngtsc would handle the same decorators twice.
        decorators = undefined;
      }
      if (propertyDefinition.getter) {
        members.push({
          node,
          implementation: propertyDefinition.getter,
          kind: ClassMemberKind.Getter,
          type: null,
          name: symbol.name,
          nameNode: null,
          value: null,
          isStatic: isStatic || false,
          decorators: decorators || [],
        });
      }
      return members;
    }

    const members = super.reflectMembers(symbol, decorators, isStatic);
    members && members.forEach(member => {
      if (member && member.kind === ClassMemberKind.Method && member.isStatic && member.node &&
          ts.isPropertyAccessExpression(member.node) && member.node.parent &&
          ts.isBinaryExpression(member.node.parent) &&
          ts.isFunctionExpression(member.node.parent.right)) {
        // Recompute the implementation for this member:
        // ES5 static methods are variable declarations so the declaration is actually the
        // initializer of the variable assignment
        member.implementation = member.node.parent.right;
      }
    });
    return members;
  }

  /**
   * Find statements related to the given class that may contain calls to a helper.
   *
   * In ESM5 code the helper calls are hidden inside the class's IIFE.
   *
   * @param classSymbol the class whose helper calls we are interested in. We expect this symbol
   * to reference the inner identifier inside the IIFE.
   * @returns an array of statements that may contain helper calls.
   */
  protected getStatementsForClass(classSymbol: ClassSymbol): ts.Statement[] {
    const classDeclarationParent = classSymbol.valueDeclaration.parent;
    return ts.isBlock(classDeclarationParent) ? Array.from(classDeclarationParent.statements) : [];
  }

  /**
   * Try to retrieve the symbol of a static property on a class.
   *
   * In ES5, a static property can either be set on the inner function declaration inside the class'
   * IIFE, or it can be set on the outer variable declaration. Therefore, the ES5 host checks both
   * places, first looking up the property on the inner symbol, and if the property is not found it
   * will fall back to looking up the property on the outer symbol.
   *
   * @param symbol the class whose property we are interested in.
   * @param propertyName the name of static property.
   * @returns the symbol if it is found or `undefined` if not.
   */
  protected getStaticProperty(symbol: ClassSymbol, propertyName: ts.__String): ts.Symbol|undefined {
    // The symbol corresponds with the inner function declaration. First lets see if the static
    // property is set there.
    const prop = super.getStaticProperty(symbol, propertyName);
    if (prop !== undefined) {
      return prop;
    }

    // Otherwise, obtain the outer variable declaration and resolve its symbol, in order to lookup
    // static properties there.
    const outerClass = getClassDeclarationFromInnerFunctionDeclaration(symbol.valueDeclaration);
    if (outerClass === undefined) {
      return undefined;
    }

    const outerSymbol = this.checker.getSymbolAtLocation(outerClass.name);
    if (outerSymbol === undefined || outerSymbol.valueDeclaration === undefined) {
      return undefined;
    }

    return super.getStaticProperty(outerSymbol as ClassSymbol, propertyName);
  }
}

///////////// Internal Helpers /////////////

/**
 * Represents the details about property definitions that were set using `Object.defineProperty`.
 */
interface PropertyDefinition {
  setter: ts.FunctionExpression|null;
  getter: ts.FunctionExpression|null;
}

/**
 * In ES5, getters and setters have been downleveled into call expressions of
 * `Object.defineProperty`, such as
 *
 * ```
 * Object.defineProperty(Clazz.prototype, "property", {
 *   get: function () {
 *       return 'value';
 *   },
 *   set: function (value) {
 *       this.value = value;
 *   },
 *   enumerable: true,
 *   configurable: true
 * });
 * ```
 *
 * This function inspects the given node to determine if it corresponds with such a call, and if so
 * extracts the `set` and `get` function expressions from the descriptor object, if they exist.
 *
 * @param node The node to obtain the property definition from.
 * @returns The property definition if the node corresponds with accessor, null otherwise.
 */
function getPropertyDefinition(node: ts.Node): PropertyDefinition|null {
  if (!ts.isCallExpression(node)) return null;

  const fn = node.expression;
  if (!ts.isPropertyAccessExpression(fn) || !ts.isIdentifier(fn.expression) ||
      fn.expression.text !== 'Object' || fn.name.text !== 'defineProperty')
    return null;

  const descriptor = node.arguments[2];
  if (!descriptor || !ts.isObjectLiteralExpression(descriptor)) return null;

  return {
    setter: readPropertyFunctionExpression(descriptor, 'set'),
    getter: readPropertyFunctionExpression(descriptor, 'get'),
  };
}

function readPropertyFunctionExpression(object: ts.ObjectLiteralExpression, name: string) {
  const property = object.properties.find(
      (p): p is ts.PropertyAssignment =>
          ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === name);

  return property && ts.isFunctionExpression(property.initializer) && property.initializer || null;
}

/**
 * Get the actual (outer) declaration of a class.
 *
 * In ES5, the implementation of a class is a function expression that is hidden inside an IIFE and
 * returned to be assigned to a variable outside the IIFE, which is what the rest of the program
 * interacts with.
 *
 * Given the inner function declaration, we want to get to the declaration of the outer variable
 * that represents the class.
 *
 * @param node a node that could be the function expression inside an ES5 class IIFE.
 * @returns the outer variable declaration or `undefined` if it is not a "class".
 */
function getClassDeclarationFromInnerFunctionDeclaration(node: ts.Node):
    ClassDeclaration<ts.VariableDeclaration>|undefined {
  if (ts.isFunctionDeclaration(node)) {
    // It might be the function expression inside the IIFE. We need to go 5 levels up...

    // 1. IIFE body.
    let outerNode = node.parent;
    if (!outerNode || !ts.isBlock(outerNode)) return undefined;

    // 2. IIFE function expression.
    outerNode = outerNode.parent;
    if (!outerNode || !ts.isFunctionExpression(outerNode)) return undefined;

    // 3. IIFE call expression.
    outerNode = outerNode.parent;
    if (!outerNode || !ts.isCallExpression(outerNode)) return undefined;

    // 4. Parenthesis around IIFE.
    outerNode = outerNode.parent;
    if (!outerNode || !ts.isParenthesizedExpression(outerNode)) return undefined;

    // 5. Outer variable declaration.
    outerNode = outerNode.parent;
    if (!outerNode || !ts.isVariableDeclaration(outerNode)) return undefined;

    // Finally, ensure that the variable declaration has a `name` identifier.
    return hasNameIdentifier(outerNode) ? outerNode : undefined;
  }

  return undefined;
}

export function getIifeBody(declaration: ts.Declaration): ts.Block|undefined {
  if (!ts.isVariableDeclaration(declaration) || !declaration.initializer ||
      !ts.isParenthesizedExpression(declaration.initializer)) {
    return undefined;
  }
  const call = declaration.initializer;
  return ts.isCallExpression(call.expression) &&
          ts.isFunctionExpression(call.expression.expression) ?
      call.expression.expression.body :
      undefined;
}

function getReturnIdentifier(body: ts.Block): ts.Identifier|undefined {
  const returnStatement = body.statements.find(ts.isReturnStatement);
  return returnStatement && returnStatement.expression &&
          ts.isIdentifier(returnStatement.expression) ?
      returnStatement.expression :
      undefined;
}

function getReturnStatement(declaration: ts.Expression | undefined): ts.ReturnStatement|undefined {
  return declaration && ts.isFunctionExpression(declaration) ?
      declaration.body.statements.find(ts.isReturnStatement) :
      undefined;
}

function reflectArrayElement(element: ts.Expression) {
  return ts.isObjectLiteralExpression(element) ? reflectObjectLiteral(element) : null;
}

/**
 * Inspects a function declaration to determine if it corresponds with a TypeScript helper function,
 * returning its kind if so or null if the declaration does not seem to correspond with such a
 * helper.
 */
function getTsHelperFn(node: ts.NamedDeclaration): TsHelperFn|null {
  const name = node.name !== undefined && ts.isIdentifier(node.name) ?
      stripDollarSuffix(node.name.text) :
      null;

  if (name === '__spread') {
    return TsHelperFn.Spread;
  } else {
    return null;
  }
}

/**
 * A constructor function may have been "synthesized" by TypeScript during JavaScript emit,
 * in the case no user-defined constructor exists and e.g. property initializers are used.
 * Those initializers need to be emitted into a constructor in JavaScript, so the TypeScript
 * compiler generates a synthetic constructor.
 *
 * We need to identify such constructors as ngcc needs to be able to tell if a class did
 * originally have a constructor in the TypeScript source. For ES5, we can not tell an
 * empty constructor apart from a synthesized constructor, but fortunately that does not
 * matter for the code generated by ngtsc.
 *
 * When a class has a superclass however, a synthesized constructor must not be considered
 * as a user-defined constructor as that prevents a base factory call from being created by
 * ngtsc, resulting in a factory function that does not inject the dependencies of the
 * superclass. Hence, we identify a default synthesized super call in the constructor body,
 * according to the structure that TypeScript's ES2015 to ES5 transformer generates in
 * https://github.com/Microsoft/TypeScript/blob/v3.2.2/src/compiler/transformers/es2015.ts#L1082-L1098
 *
 * @param constructor a constructor function to test
 * @returns true if the constructor appears to have been synthesized
 */
function isSynthesizedConstructor(constructor: ts.FunctionDeclaration): boolean {
  if (!constructor.body) return false;

  const firstStatement = constructor.body.statements[0];
  if (!firstStatement) return false;

  return isSynthesizedSuperThisAssignment(firstStatement) ||
      isSynthesizedSuperReturnStatement(firstStatement);
}

/**
 * Identifies a synthesized super call of the form:
 *
 * ```
 * var _this = _super !== null && _super.apply(this, arguments) || this;
 * ```
 *
 * @param statement a statement that may be a synthesized super call
 * @returns true if the statement looks like a synthesized super call
 */
function isSynthesizedSuperThisAssignment(statement: ts.Statement): boolean {
  if (!ts.isVariableStatement(statement)) return false;

  const variableDeclarations = statement.declarationList.declarations;
  if (variableDeclarations.length !== 1) return false;

  const variableDeclaration = variableDeclarations[0];
  if (!ts.isIdentifier(variableDeclaration.name) ||
      !variableDeclaration.name.text.startsWith('_this'))
    return false;

  const initializer = variableDeclaration.initializer;
  if (!initializer) return false;

  return isSynthesizedDefaultSuperCall(initializer);
}
/**
 * Identifies a synthesized super call of the form:
 *
 * ```
 * return _super !== null && _super.apply(this, arguments) || this;
 * ```
 *
 * @param statement a statement that may be a synthesized super call
 * @returns true if the statement looks like a synthesized super call
 */
function isSynthesizedSuperReturnStatement(statement: ts.Statement): boolean {
  if (!ts.isReturnStatement(statement)) return false;

  const expression = statement.expression;
  if (!expression) return false;

  return isSynthesizedDefaultSuperCall(expression);
}

/**
 * Tests whether the expression is of the form:
 *
 * ```
 * _super !== null && _super.apply(this, arguments) || this;
 * ```
 *
 * This structure is generated by TypeScript when transforming ES2015 to ES5, see
 * https://github.com/Microsoft/TypeScript/blob/v3.2.2/src/compiler/transformers/es2015.ts#L1148-L1163
 *
 * @param expression an expression that may represent a default super call
 * @returns true if the expression corresponds with the above form
 */
function isSynthesizedDefaultSuperCall(expression: ts.Expression): boolean {
  if (!isBinaryExpr(expression, ts.SyntaxKind.BarBarToken)) return false;
  if (expression.right.kind !== ts.SyntaxKind.ThisKeyword) return false;

  const left = expression.left;
  if (!isBinaryExpr(left, ts.SyntaxKind.AmpersandAmpersandToken)) return false;

  return isSuperNotNull(left.left) && isSuperApplyCall(left.right);
}

function isSuperNotNull(expression: ts.Expression): boolean {
  return isBinaryExpr(expression, ts.SyntaxKind.ExclamationEqualsEqualsToken) &&
      isSuperIdentifier(expression.left);
}

/**
 * Tests whether the expression is of the form
 *
 * ```
 * _super.apply(this, arguments)
 * ```
 *
 * @param expression an expression that may represent a default super call
 * @returns true if the expression corresponds with the above form
 */
function isSuperApplyCall(expression: ts.Expression): boolean {
  if (!ts.isCallExpression(expression) || expression.arguments.length !== 2) return false;

  const targetFn = expression.expression;
  if (!ts.isPropertyAccessExpression(targetFn)) return false;
  if (!isSuperIdentifier(targetFn.expression)) return false;
  if (targetFn.name.text !== 'apply') return false;

  const thisArgument = expression.arguments[0];
  if (thisArgument.kind !== ts.SyntaxKind.ThisKeyword) return false;

  const argumentsArgument = expression.arguments[1];
  return ts.isIdentifier(argumentsArgument) && argumentsArgument.text === 'arguments';
}

function isBinaryExpr(
    expression: ts.Expression, operator: ts.BinaryOperator): expression is ts.BinaryExpression {
  return ts.isBinaryExpression(expression) && expression.operatorToken.kind === operator;
}

function isSuperIdentifier(node: ts.Node): boolean {
  // Verify that the identifier is prefixed with `_super`. We don't test for equivalence
  // as TypeScript may have suffixed the name, e.g. `_super_1` to avoid name conflicts.
  // Requiring only a prefix should be sufficiently accurate.
  return ts.isIdentifier(node) && node.text.startsWith('_super');
}

/**
 * Parse the statement to extract the ESM5 parameter initializer if there is one.
 * If one is found, add it to the appropriate parameter in the `parameters` collection.
 *
 * The form we are looking for is:
 *
 * ```
 * if (arg === void 0) { arg = initializer; }
 * ```
 *
 * @param statement a statement that may be initializing an optional parameter
 * @param parameters the collection of parameters that were found in the function definition
 * @returns true if the statement was a parameter initializer
 */
function reflectParamInitializer(statement: ts.Statement, parameters: Parameter[]) {
  if (ts.isIfStatement(statement) && isUndefinedComparison(statement.expression) &&
      ts.isBlock(statement.thenStatement) && statement.thenStatement.statements.length === 1) {
    const ifStatementComparison = statement.expression;           // (arg === void 0)
    const thenStatement = statement.thenStatement.statements[0];  // arg = initializer;
    if (isAssignmentStatement(thenStatement)) {
      const comparisonName = ifStatementComparison.left.text;
      const assignmentName = thenStatement.expression.left.text;
      if (comparisonName === assignmentName) {
        const parameter = parameters.find(p => p.name === comparisonName);
        if (parameter) {
          parameter.initializer = thenStatement.expression.right;
          return true;
        }
      }
    }
  }
  return false;
}

function isUndefinedComparison(expression: ts.Expression): expression is ts.Expression&
    {left: ts.Identifier, right: ts.Expression} {
  return ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
      ts.isVoidExpression(expression.right) && ts.isIdentifier(expression.left);
}
