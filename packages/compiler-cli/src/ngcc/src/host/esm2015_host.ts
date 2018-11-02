/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ClassMember, ClassMemberKind, CtorParameter, Decorator, Import} from '../../../ngtsc/host';
import {TypeScriptReflectionHost, reflectObjectLiteral} from '../../../ngtsc/metadata';
import {findAll, getNameText, getOriginalSymbol, isDefined} from '../utils';

import {DecoratedClass} from './decorated_class';
import {NgccReflectionHost, PRE_R3_MARKER, SwitchableVariableDeclaration, isSwitchableVariableDeclaration} from './ngcc_host';

export const DECORATORS = 'decorators' as ts.__String;
export const PROP_DECORATORS = 'propDecorators' as ts.__String;
export const CONSTRUCTOR = '__constructor' as ts.__String;
export const CONSTRUCTOR_PARAMS = 'ctorParameters' as ts.__String;

/**
 * Esm2015 packages contain ECMAScript 2015 classes, etc.
 * Decorators are defined via static properties on the class. For example:
 *
 * ```
 * class SomeDirective {
 * }
 * SomeDirective.decorators = [
 *   { type: Directive, args: [{ selector: '[someDirective]' },] }
 * ];
 * SomeDirective.ctorParameters = () => [
 *   { type: ViewContainerRef, },
 *   { type: TemplateRef, },
 *   { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN,] },] },
 * ];
 * SomeDirective.propDecorators = {
 *   "input1": [{ type: Input },],
 *   "input2": [{ type: Input },],
 * };
 * ```
 *
 * * Classes are decorated if they have a static property called `decorators`.
 * * Members are decorated if there is a matching key on a static property
 *   called `propDecorators`.
 * * Constructor parameters decorators are found on an object returned from
 *   a static method called `ctorParameters`.
 */
export class Esm2015ReflectionHost extends TypeScriptReflectionHost implements NgccReflectionHost {
  protected dtsClassMap: Map<string, ts.ClassDeclaration>|null;
  constructor(
      protected isCore: boolean, checker: ts.TypeChecker, dtsRootFileName?: string,
      dtsProgram?: ts.Program|null) {
    super(checker);
    this.dtsClassMap = (dtsRootFileName && dtsProgram) ?
        this.computeDtsClassMap(dtsRootFileName, dtsProgram) :
        null;
  }

  /**
   * Examine a declaration (for example, of a class or function) and return metadata about any
   * decorators present on the declaration.
   *
   * @param declaration a TypeScript `ts.Declaration` node representing the class or function over
   * which to reflect. For example, if the intent is to reflect the decorators of a class and the
   * source is in ES6 format, this will be a `ts.ClassDeclaration` node. If the source is in ES5
   * format, this might be a `ts.VariableDeclaration` as classes in ES5 are represented as the
   * result of an IIFE execution.
   *
   * @returns an array of `Decorator` metadata if decorators are present on the declaration, or
   * `null` if either no decorators were present or if the declaration is not of a decoratable type.
   */
  getDecoratorsOfDeclaration(declaration: ts.Declaration): Decorator[]|null {
    const symbol = this.getClassSymbol(declaration);
    if (!symbol) {
      return null;
    }
    return this.getDecoratorsOfSymbol(symbol);
  }

  /**
   * Examine a declaration which should be of a class, and return metadata about the members of the
   * class.
   *
   * @param declaration a TypeScript `ts.Declaration` node representing the class over which to
   * reflect. If the source is in ES6 format, this will be a `ts.ClassDeclaration` node. If the
   * source is in ES5 format, this might be a `ts.VariableDeclaration` as classes in ES5 are
   * represented as the result of an IIFE execution.
   *
   * @returns an array of `ClassMember` metadata representing the members of the class.
   *
   * @throws if `declaration` does not resolve to a class declaration.
   */
  getMembersOfClass(clazz: ts.Declaration): ClassMember[] {
    const members: ClassMember[] = [];
    const symbol = this.getClassSymbol(clazz);
    if (!symbol) {
      throw new Error(`Attempted to get members of a non-class: "${clazz.getText()}"`);
    }

    // The decorators map contains all the properties that are decorated
    const decoratorsMap = this.getMemberDecorators(symbol);

    // The member map contains all the method (instance and static); and any instance properties
    // that are initialized in the class.
    if (symbol.members) {
      symbol.members.forEach((value, key) => {
        const decorators = removeFromMap(decoratorsMap, key);
        const member = this.reflectMember(value, decorators);
        if (member) {
          members.push(member);
        }
      });
    }

    // The static property map contains all the static properties
    if (symbol.exports) {
      symbol.exports.forEach((value, key) => {
        const decorators = removeFromMap(decoratorsMap, key);
        const member = this.reflectMember(value, decorators, true);
        if (member) {
          members.push(member);
        }
      });
    }

    // If this class was declared as a VariableDeclaration then it may have static properties
    // attached to the variable rather than the class itself
    // For example:
    // ```
    // let MyClass = class MyClass {
    //   // no static properties here!
    // }
    // MyClass.staticProperty = ...;
    // ```
    if (ts.isVariableDeclaration(symbol.valueDeclaration.parent)) {
      const variableSymbol = this.checker.getSymbolAtLocation(symbol.valueDeclaration.parent.name);
      if (variableSymbol && variableSymbol.exports) {
        variableSymbol.exports.forEach((value, key) => {
          const decorators = removeFromMap(decoratorsMap, key);
          const member = this.reflectMember(value, decorators, true);
          if (member) {
            members.push(member);
          }
        });
      }
    }

    // Deal with any decorated properties that were not initialized in the class
    decoratorsMap.forEach((value, key) => {
      members.push({
        implementation: null,
        decorators: value,
        isStatic: false,
        kind: ClassMemberKind.Property,
        name: key,
        nameNode: null,
        node: null,
        type: null,
        value: null
      });
    });

    return members;
  }

  /**
   * Reflect over the constructor of a class and return metadata about its parameters.
   *
   * This method only looks at the constructor of a class directly and not at any inherited
   * constructors.
   *
   * @param declaration a TypeScript `ts.Declaration` node representing the class over which to
   * reflect. If the source is in ES6 format, this will be a `ts.ClassDeclaration` node. If the
   * source is in ES5 format, this might be a `ts.VariableDeclaration` as classes in ES5 are
   * represented as the result of an IIFE execution.
   *
   * @returns an array of `Parameter` metadata representing the parameters of the constructor, if
   * a constructor exists. If the constructor exists and has 0 parameters, this array will be empty.
   * If the class has no constructor, this method returns `null`.
   *
   * @throws if `declaration` does not resolve to a class declaration.
   */
  getConstructorParameters(clazz: ts.Declaration): CtorParameter[]|null {
    const classSymbol = this.getClassSymbol(clazz);
    if (!classSymbol) {
      throw new Error(
          `Attempted to get constructor parameters of a non-class: "${clazz.getText()}"`);
    }
    const parameterNodes = this.getConstructorParameterDeclarations(classSymbol);
    if (parameterNodes) {
      return this.getConstructorParamInfo(classSymbol, parameterNodes);
    }
    return null;
  }

  /**
   * Find a symbol for a node that we think is a class.
   * @param node the node whose symbol we are finding.
   * @returns the symbol for the node or `undefined` if it is not a "class" or has no symbol.
   */
  getClassSymbol(declaration: ts.Node): ts.Symbol|undefined {
    if (ts.isClassDeclaration(declaration)) {
      return declaration.name && this.checker.getSymbolAtLocation(declaration.name);
    }
    if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
      declaration = declaration.initializer;
    }
    if (ts.isClassExpression(declaration)) {
      return declaration.name && this.checker.getSymbolAtLocation(declaration.name);
    }
    return undefined;
  }

  /**
   * Search the given module for variable declarations in which the initializer
   * is an identifier marked with the `PRE_R3_MARKER`.
   * @param module the module in which to search for switchable declarations.
   * @returns an array of variable declarations that match.
   */
  getSwitchableDeclarations(module: ts.Node): SwitchableVariableDeclaration[] {
    // Don't bother to walk the AST if the marker is not found in the text
    return module.getText().indexOf(PRE_R3_MARKER) >= 0 ?
        findAll(module, isSwitchableVariableDeclaration) :
        [];
  }

  getVariableValue(declaration: ts.VariableDeclaration): ts.Expression|null {
    const value = super.getVariableValue(declaration);
    if (value) {
      return value;
    }

    // We have a variable declaration that has no initializer. For example:
    //
    // ```
    // var HttpClientXsrfModule_1;
    // ```
    //
    // So look for the special scenario where the variable is being assigned in
    // a nearby statement to the return value of a call to `__decorate`.
    // Then find the 2nd argument of that call, the "target", which will be the
    // actual class identifier. For example:
    //
    // ```
    // HttpClientXsrfModule = HttpClientXsrfModule_1 = tslib_1.__decorate([
    //   NgModule({
    //     providers: [],
    //   })
    // ], HttpClientXsrfModule);
    // ```
    //
    // And finally, find the declaration of the identifier in that argument.
    // Note also that the assignment can occur within another assignment.
    //
    const block = declaration.parent.parent.parent;
    const symbol = this.checker.getSymbolAtLocation(declaration.name);
    if (symbol && (ts.isBlock(block) || ts.isSourceFile(block))) {
      const decorateCall = this.findDecoratedVariableValue(block, symbol);
      const target = decorateCall && decorateCall.arguments[1];
      if (target && ts.isIdentifier(target)) {
        const targetSymbol = this.checker.getSymbolAtLocation(target);
        const targetDeclaration = targetSymbol && targetSymbol.valueDeclaration;
        if (targetDeclaration) {
          if (ts.isClassDeclaration(targetDeclaration) ||
              ts.isFunctionDeclaration(targetDeclaration)) {
            // The target is just a function or class declaration
            // so return its identifier as the variable value.
            return targetDeclaration.name || null;
          } else if (ts.isVariableDeclaration(targetDeclaration)) {
            // The target is a variable declaration, so find the far right expression,
            // in the case of multiple assignments (e.g. `var1 = var2 = value`).
            let targetValue = targetDeclaration.initializer;
            while (targetValue && isAssignment(targetValue)) {
              targetValue = targetValue.right;
            }
            if (targetValue) {
              return targetValue;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Determine if an identifier was imported from another module and return `Import` metadata
   * describing its origin.
   *
   * @param id a TypeScript `ts.Identifer` to reflect.
   *
   * @returns metadata about the `Import` if the identifier was imported from another module, or
   * `null` if the identifier doesn't resolve to an import but instead is locally defined.
   */
  getImportOfIdentifier(id: ts.Identifier): Import|null {
    return super.getImportOfIdentifier(id) || this.getImportOfNamespacedIdentifier(id);
  }

  /**
   * Find all the classes that contain decorations in a given file.
   * @param sourceFile The source file to search for decorated classes.
   * @returns An array of decorated classes.
   */
  findDecoratedClasses(sourceFile: ts.SourceFile): DecoratedClass[] {
    const classes: DecoratedClass[] = [];
    sourceFile.statements.map(statement => {
      if (ts.isVariableStatement(statement)) {
        statement.declarationList.declarations.forEach(declaration => {
          const decoratedClass = this.getDecoratedClassFromSymbol(this.getClassSymbol(declaration));
          if (decoratedClass) {
            classes.push(decoratedClass);
          }
        });
      } else if (ts.isClassDeclaration(statement)) {
        const decoratedClass = this.getDecoratedClassFromSymbol(this.getClassSymbol(statement));
        if (decoratedClass) {
          classes.push(decoratedClass);
        }
      }
    });
    return classes;
  }

  /**
   * Get the number of generic type parameters of a given class.
   *
   * @returns the number of type parameters of the class, if known, or `null` if the declaration
   * is not a class or has an unknown number of type parameters.
   */
  getGenericArityOfClass(clazz: ts.Declaration): number|null {
    const dtsClass = this.getDtsDeclarationOfClass(clazz);
    if (dtsClass) {
      return dtsClass.typeParameters ? dtsClass.typeParameters.length : 0;
    }
    return null;
  }

  /**
   * Take an exported declaration of a class (maybe downleveled to a variable) and look up the
   * declaration of its type in a separate .d.ts tree.
   *
   * This function is allowed to return `null` if the current compilation unit does not have a
   * separate .d.ts tree. When compiling TypeScript code this is always the case, since .d.ts files
   * are produced only during the emit of such a compilation. When compiling .js code, however,
   * there is frequently a parallel .d.ts tree which this method exposes.
   *
   * Note that the `ts.ClassDeclaration` returned from this function may not be from the same
   * `ts.Program` as the input declaration.
   */
  getDtsDeclarationOfClass(declaration: ts.Declaration): ts.ClassDeclaration|null {
    if (this.dtsClassMap) {
      if (ts.isClassDeclaration(declaration)) {
        if (!declaration.name || !ts.isIdentifier(declaration.name)) {
          throw new Error(
              `Cannot get the dts file for a class declaration that has no indetifier: ${declaration.getText()} in ${declaration.getSourceFile().fileName}`);
        }
        const dtsDeclaration = this.dtsClassMap.get(declaration.name.text);
        if (!dtsDeclaration) {
          throw new Error(
              `Unable to find matching typings (.d.ts) declaration for ${declaration.name.text} in ${declaration.getSourceFile().fileName}`);
        }
        return dtsDeclaration;
      }
    }
    return null;
  }


  ///////////// Protected Helpers /////////////

  protected getDecoratorsOfSymbol(symbol: ts.Symbol): Decorator[]|null {
    const decoratorsProperty = this.getStaticProperty(symbol, DECORATORS);
    if (decoratorsProperty) {
      return this.getClassDecoratorsFromStaticProperty(decoratorsProperty);
    } else {
      return this.getClassDecoratorsFromHelperCall(symbol);
    }
  }

  protected getDecoratedClassFromSymbol(symbol: ts.Symbol|undefined): DecoratedClass|null {
    if (symbol) {
      const decorators = this.getDecoratorsOfSymbol(symbol);
      if (decorators && decorators.length) {
        return new DecoratedClass(symbol.name, symbol.valueDeclaration, decorators);
      }
    }
    return null;
  }

  /**
   * Walk the AST looking for an assignment to the specified symbol.
   * @param node The current node we are searching.
   * @returns an expression that represents the value of the variable, or undefined if none can be
   * found.
   */
  protected findDecoratedVariableValue(node: ts.Node|undefined, symbol: ts.Symbol):
      ts.CallExpression|null {
    if (!node) {
      return null;
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const left = node.left;
      const right = node.right;
      if (ts.isIdentifier(left) && this.checker.getSymbolAtLocation(left) === symbol) {
        return (ts.isCallExpression(right) && getCalleeName(right) === '__decorate') ? right : null;
      }
      return this.findDecoratedVariableValue(right, symbol);
    }
    return node.forEachChild(node => this.findDecoratedVariableValue(node, symbol)) || null;
  }

  /**
   * Try to retrieve the symbol of a static property on a class.
   * @param symbol the class whose property we are interested in.
   * @param propertyName the name of static property.
   * @returns the symbol if it is found or `undefined` if not.
   */
  protected getStaticProperty(symbol: ts.Symbol, propertyName: ts.__String): ts.Symbol|undefined {
    return symbol.exports && symbol.exports.get(propertyName);
  }

  /**
   * Get all class decorators for the given class, where the decorators are declared
   * via a static property. For example:
   *
   * ```
   * class SomeDirective {}
   * SomeDirective.decorators = [
   *   { type: Directive, args: [{ selector: '[someDirective]' },] }
   * ];
   * ```
   *
   * @param decoratorsSymbol the property containing the decorators we want to get.
   * @returns an array of decorators or null if none where found.
   */
  protected getClassDecoratorsFromStaticProperty(decoratorsSymbol: ts.Symbol): Decorator[]|null {
    const decoratorsIdentifier = decoratorsSymbol.valueDeclaration;
    if (decoratorsIdentifier && decoratorsIdentifier.parent) {
      if (ts.isBinaryExpression(decoratorsIdentifier.parent) &&
          decoratorsIdentifier.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        // AST of the array of decorator values
        const decoratorsArray = decoratorsIdentifier.parent.right;
        return this.reflectDecorators(decoratorsArray)
            .filter(decorator => this.isFromCore(decorator));
      }
    }
    return null;
  }

  /**
   * Get all class decorators for the given class, where the decorators are declared
   * via the `__decorate` helper method. For example:
   *
   * ```
   * let SomeDirective = class SomeDirective {}
   * SomeDirective = __decorate([
   *   Directive({ selector: '[someDirective]' }),
   * ], SomeDirective);
   * ```
   *
   * @param symbol the class whose decorators we want to get.
   * @returns an array of decorators or null if none where found.
   */
  protected getClassDecoratorsFromHelperCall(symbol: ts.Symbol): Decorator[]|null {
    const decorators: Decorator[] = [];
    const helperCalls = this.getHelperCallsForClass(symbol, '__decorate');
    helperCalls.forEach(helperCall => {
      const {classDecorators} =
          this.reflectDecoratorsFromHelperCall(helperCall, makeClassTargetFilter(symbol.name));
      classDecorators.filter(decorator => this.isFromCore(decorator))
          .forEach(decorator => decorators.push(decorator));
    });
    return decorators.length ? decorators : null;
  }

  /**
   * Get all the member decorators for the given class.
   * @param classSymbol the class whose member decorators we are interested in.
   * @returns a map whose keys are the name of the members and whose values are collections of
   * decorators for the given member.
   */
  protected getMemberDecorators(classSymbol: ts.Symbol): Map<string, Decorator[]> {
    const decoratorsProperty = this.getStaticProperty(classSymbol, PROP_DECORATORS);
    if (decoratorsProperty) {
      return this.getMemberDecoratorsFromStaticProperty(decoratorsProperty);
    } else {
      return this.getMemberDecoratorsFromHelperCalls(classSymbol);
    }
  }

  /**
   * Member decorators may be declared as static properties of the class:
   *
   * ```
   * SomeDirective.propDecorators = {
   *   "ngForOf": [{ type: Input },],
   *   "ngForTrackBy": [{ type: Input },],
   *   "ngForTemplate": [{ type: Input },],
   * };
   * ```
   *
   * @param decoratorsProperty the class whose member decorators we are interested in.
   * @returns a map whose keys are the name of the members and whose values are collections of
   * decorators for the given member.
   */
  protected getMemberDecoratorsFromStaticProperty(decoratorsProperty: ts.Symbol):
      Map<string, Decorator[]> {
    const memberDecorators = new Map<string, Decorator[]>();
    // Symbol of the identifier for `SomeDirective.propDecorators`.
    const propDecoratorsMap = getPropertyValueFromSymbol(decoratorsProperty);
    if (propDecoratorsMap && ts.isObjectLiteralExpression(propDecoratorsMap)) {
      const propertiesMap = reflectObjectLiteral(propDecoratorsMap);
      propertiesMap.forEach((value, name) => {
        const decorators =
            this.reflectDecorators(value).filter(decorator => this.isFromCore(decorator));
        if (decorators.length) {
          memberDecorators.set(name, decorators);
        }
      });
    }
    return memberDecorators;
  }

  /**
   * Member decorators may be declared via helper call statements.
   *
   * ```
   * __decorate([
   *     Input(),
   *     __metadata("design:type", String)
   * ], SomeDirective.prototype, "input1", void 0);
   * ```
   *
   * @param classSymbol the class whose member decorators we are interested in.
   * @returns a map whose keys are the name of the members and whose values are collections of
   * decorators for the given member.
   */
  protected getMemberDecoratorsFromHelperCalls(classSymbol: ts.Symbol): Map<string, Decorator[]> {
    const memberDecoratorMap = new Map<string, Decorator[]>();
    const helperCalls = this.getHelperCallsForClass(classSymbol, '__decorate');
    helperCalls.forEach(helperCall => {
      const {memberDecorators} = this.reflectDecoratorsFromHelperCall(
          helperCall, makeMemberTargetFilter(classSymbol.name));
      memberDecorators.forEach((decorators, memberName) => {
        if (memberName) {
          const memberDecorators = memberDecoratorMap.get(memberName) || [];
          const coreDecorators = decorators.filter(decorator => this.isFromCore(decorator));
          memberDecoratorMap.set(memberName, memberDecorators.concat(coreDecorators));
        }
      });
    });
    return memberDecoratorMap;
  }

  /**
   * Extract decorator info from `__decorate` helper function calls.
   * @param helperCall the call to a helper that may contain decorator calls
   * @param targetFilter a function to filter out targets that we are not interested in.
   * @returns a mapping from member name to decorators, where the key is either the name of the
   * member or `undefined` if it refers to decorators on the class as a whole.
   */
  protected reflectDecoratorsFromHelperCall(
      helperCall: ts.CallExpression, targetFilter: TargetFilter):
      {classDecorators: Decorator[], memberDecorators: Map<string, Decorator[]>} {
    const classDecorators: Decorator[] = [];
    const memberDecorators = new Map<string, Decorator[]>();

    // First check that the `target` argument is correct
    if (targetFilter(helperCall.arguments[1])) {
      // Grab the `decorators` argument which should be an array of calls
      const decoratorCalls = helperCall.arguments[0];
      if (decoratorCalls && ts.isArrayLiteralExpression(decoratorCalls)) {
        decoratorCalls.elements.forEach(element => {
          // We only care about those elements that are actual calls
          if (ts.isCallExpression(element)) {
            const decorator = this.reflectDecoratorCall(element);
            if (decorator) {
              const keyArg = helperCall.arguments[2];
              const keyName = keyArg && ts.isStringLiteral(keyArg) ? keyArg.text : undefined;
              if (keyName === undefined) {
                classDecorators.push(decorator);
              } else {
                const decorators = memberDecorators.get(keyName) || [];
                decorators.push(decorator);
                memberDecorators.set(keyName, decorators);
              }
            }
          }
        });
      }
    }
    return {classDecorators, memberDecorators};
  }

  /**
   * Extract the decorator information from a call to a decorator as a function.
   * This happens when the decorators has been used in a `__decorate` helper call.
   * For example:
   *
   * ```
   * __decorate([
   *   Directive({ selector: '[someDirective]' }),
   * ], SomeDirective);
   * ```
   *
   * Here the `Directive` decorator is decorating `SomeDirective` and the options for
   * the decorator are passed as arguments to the `Directive()` call.
   *
   * @param call the call to the decorator.
   * @returns a decorator containing the reflected information, or null if the call
   * is not a valid decorator call.
   */
  protected reflectDecoratorCall(call: ts.CallExpression): Decorator|null {
    // The call could be of the form `Decorator(...)` or `namespace_1.Decorator(...)`
    const decoratorExpression =
        ts.isPropertyAccessExpression(call.expression) ? call.expression.name : call.expression;
    if (ts.isIdentifier(decoratorExpression)) {
      // We found a decorator!
      const decoratorIdentifier = decoratorExpression;
      return {
        name: decoratorIdentifier.text,
        identifier: decoratorIdentifier,
        import: this.getImportOfIdentifier(decoratorIdentifier),
        node: call,
        args: Array.from(call.arguments)
      };
    }
    return null;
  }

  /**
   * Check the given statement to see if it is a call to the specified helper function or null if
   * not found.
   *
   * Matching statements will look like:  `tslib_1.__decorate(...);`.
   * @param statement the statement that may contain the call.
   * @param helperName the name of the helper we are looking for.
   * @returns the node that corresponds to the `__decorate(...)` call or null if the statement does
   * not match.
   */
  protected getHelperCall(statement: ts.Statement, helperName: string): ts.CallExpression|null {
    if (ts.isExpressionStatement(statement)) {
      const expression =
          isAssignmentStatement(statement) ? statement.expression.right : statement.expression;
      if (ts.isCallExpression(expression) && getCalleeName(expression) === helperName) {
        return expression;
      }
    }
    return null;
  }



  /**
   * Reflect over the given array node and extract decorator information from each element.
   *
   * This is used for decorators that are defined in static properties. For example:
   *
   * ```
   * SomeDirective.decorators = [
   *   { type: Directive, args: [{ selector: '[someDirective]' },] }
   * ];
   * ```
   *
   * @param decoratorsArray an expression that contains decorator information.
   * @returns an array of decorator info that was reflected from the array node.
   */
  protected reflectDecorators(decoratorsArray: ts.Expression): Decorator[] {
    const decorators: Decorator[] = [];

    if (ts.isArrayLiteralExpression(decoratorsArray)) {
      // Add each decorator that is imported from `@angular/core` into the `decorators` array
      decoratorsArray.elements.forEach(node => {

        // If the decorator is not an object literal expression then we are not interested
        if (ts.isObjectLiteralExpression(node)) {
          // We are only interested in objects of the form: `{ type: DecoratorType, args: [...] }`
          const decorator = reflectObjectLiteral(node);

          // Is the value of the `type` property an identifier?
          const typeIdentifier = decorator.get('type');
          if (typeIdentifier && ts.isIdentifier(typeIdentifier)) {
            decorators.push({
              name: typeIdentifier.text,
              identifier: typeIdentifier,
              import: this.getImportOfIdentifier(typeIdentifier), node,
              args: getDecoratorArgs(node),
            });
          }
        }
      });
    }
    return decorators;
  }

  /**
   * Reflect over a symbol and extract the member information, combining it with the
   * provided decorator information, and whether it is a static member.
   * @param symbol the symbol for the member to reflect over.
   * @param decorators an array of decorators associated with the member.
   * @param isStatic true if this member is static, false if it is an instance property.
   * @returns the reflected member information, or null if the symbol is not a member.
   */
  protected reflectMember(symbol: ts.Symbol, decorators?: Decorator[], isStatic?: boolean):
      ClassMember|null {
    let kind: ClassMemberKind|null = null;
    let value: ts.Expression|null = null;
    let name: string|null = null;
    let nameNode: ts.Identifier|null = null;


    const node = symbol.valueDeclaration || symbol.declarations && symbol.declarations[0];
    if (!node || !isClassMemberType(node)) {
      return null;
    }

    if (symbol.flags & ts.SymbolFlags.Method) {
      kind = ClassMemberKind.Method;
    } else if (symbol.flags & ts.SymbolFlags.Property) {
      kind = ClassMemberKind.Property;
    } else if (symbol.flags & ts.SymbolFlags.GetAccessor) {
      kind = ClassMemberKind.Getter;
    } else if (symbol.flags & ts.SymbolFlags.SetAccessor) {
      kind = ClassMemberKind.Setter;
    }

    if (isStatic && isPropertyAccess(node)) {
      name = node.name.text;
      value = symbol.flags & ts.SymbolFlags.Property ? node.parent.right : null;
    } else if (isThisAssignment(node)) {
      kind = ClassMemberKind.Property;
      name = node.left.name.text;
      value = node.right;
      isStatic = false;
    } else if (ts.isConstructorDeclaration(node)) {
      kind = ClassMemberKind.Constructor;
      name = 'constructor';
      isStatic = false;
    }

    if (kind === null) {
      console.warn(`Unknown member type: "${node.getText()}`);
      return null;
    }

    if (!name) {
      if (isNamedDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
        name = node.name.text;
        nameNode = node.name;
      } else {
        return null;
      }
    }

    // If we have still not determined if this is a static or instance member then
    // look for the `static` keyword on the declaration
    if (isStatic === undefined) {
      isStatic = node.modifiers !== undefined &&
          node.modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword);
    }

    const type: ts.TypeNode = (node as any).type || null;
    return {
      node,
      implementation: node, kind, type, name, nameNode, value, isStatic,
      decorators: decorators || []
    };
  }

  /**
   * Find the declarations of the constructor parameters of a class identified by its symbol.
   * @param classSymbol the class whose parameters we want to find.
   * @returns an array of `ts.ParameterDeclaration` objects representing each of the parameters in
   * the class's constructor or null if there is no constructor.
   */
  protected getConstructorParameterDeclarations(classSymbol: ts.Symbol):
      ts.ParameterDeclaration[]|null {
    const constructorSymbol = classSymbol.members && classSymbol.members.get(CONSTRUCTOR);
    if (constructorSymbol) {
      // For some reason the constructor does not have a `valueDeclaration` ?!?
      const constructor = constructorSymbol.declarations &&
          constructorSymbol.declarations[0] as ts.ConstructorDeclaration;
      if (constructor && constructor.parameters) {
        return Array.from(constructor.parameters);
      }
      return [];
    }
    return null;
  }

  /**
   * Get the parameter decorators of a class constructor.
   *
   * @param classSymbol the class whose parameter info we want to get.
   * @param parameterNodes the array of TypeScript parameter nodes for this class's constructor.
   * @returns an array of constructor parameter info objects.
   */
  protected getConstructorParamInfo(
      classSymbol: ts.Symbol, parameterNodes: ts.ParameterDeclaration[]): CtorParameter[] {
    const paramsProperty = this.getStaticProperty(classSymbol, CONSTRUCTOR_PARAMS);
    const paramInfo: ParamInfo[]|null = paramsProperty ?
        this.getParamInfoFromStaticProperty(paramsProperty) :
        this.getParamInfoFromHelperCall(classSymbol, parameterNodes);

    return parameterNodes.map((node, index) => {
      const {decorators, type} =
          paramInfo && paramInfo[index] ? paramInfo[index] : {decorators: null, type: null};
      const nameNode = node.name;
      return {name: getNameText(nameNode), nameNode, type, decorators};
    });
  }

  /**
   * Get the parameter type and decorators for the constructor of a class,
   * where the information is stored on a static method of the class.
   *
   * Note that in ESM2015, the method is defined by an arrow function that returns an array of
   * decorator and type information.
   *
   * ```
   * SomeDirective.ctorParameters = () => [
   *   { type: ViewContainerRef, },
   *   { type: TemplateRef, },
   *   { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN,] },] },
   * ];
   * ```
   *
   * @param paramDecoratorsProperty the property that holds the parameter info we want to get.
   * @returns an array of objects containing the type and decorators for each parameter.
   */
  protected getParamInfoFromStaticProperty(paramDecoratorsProperty: ts.Symbol): ParamInfo[]|null {
    const paramDecorators = getPropertyValueFromSymbol(paramDecoratorsProperty);
    if (paramDecorators && ts.isArrowFunction(paramDecorators)) {
      if (ts.isArrayLiteralExpression(paramDecorators.body)) {
        const elements = paramDecorators.body.elements;
        return elements
            .map(
                element =>
                    ts.isObjectLiteralExpression(element) ? reflectObjectLiteral(element) : null)
            .map(paramInfo => {
              const type = paramInfo && paramInfo.get('type') || null;
              const decoratorInfo = paramInfo && paramInfo.get('decorators') || null;
              const decorators = decoratorInfo &&
                  this.reflectDecorators(decoratorInfo)
                      .filter(decorator => this.isFromCore(decorator));
              return {type, decorators};
            });
      }
    }
    return null;
  }

  /**
   * Get the parmeter type and decorators for a class where the information is stored on
   * in calls to `__decorate` helpers.
   *
   * Reflect over the helpers to find the decorators and types about each of
   * the class's constructor parameters.
   *
   * @param classSymbol the class whose parameter info we want to get.
   * @param parameterNodes the array of TypeScript parameter nodes for this class's constructor.
   * @returns an array of objects containing the type and decorators for each parameter.
   */
  protected getParamInfoFromHelperCall(
      classSymbol: ts.Symbol, parameterNodes: ts.ParameterDeclaration[]): ParamInfo[] {
    const parameters: ParamInfo[] = parameterNodes.map(() => ({type: null, decorators: null}));
    const helperCalls = this.getHelperCallsForClass(classSymbol, '__decorate');
    helperCalls.forEach(helperCall => {
      const {classDecorators} =
          this.reflectDecoratorsFromHelperCall(helperCall, makeClassTargetFilter(classSymbol.name));
      classDecorators.forEach(call => {
        switch (call.name) {
          case '__metadata':
            const metadataArg = call.args && call.args[0];
            const typesArg = call.args && call.args[1];
            const isParamTypeDecorator = metadataArg && ts.isStringLiteral(metadataArg) &&
                metadataArg.text === 'design:paramtypes';
            const types = typesArg && ts.isArrayLiteralExpression(typesArg) && typesArg.elements;
            if (isParamTypeDecorator && types) {
              types.forEach((type, index) => parameters[index].type = type);
            }
            break;
          case '__param':
            const paramIndexArg = call.args && call.args[0];
            const decoratorCallArg = call.args && call.args[1];
            const paramIndex = paramIndexArg && ts.isNumericLiteral(paramIndexArg) ?
                parseInt(paramIndexArg.text, 10) :
                NaN;
            const decorator = decoratorCallArg && ts.isCallExpression(decoratorCallArg) ?
                this.reflectDecoratorCall(decoratorCallArg) :
                null;
            if (!isNaN(paramIndex) && decorator) {
              const decorators = parameters[paramIndex].decorators =
                  parameters[paramIndex].decorators || [];
              decorators.push(decorator);
            }
            break;
        }
      });
    });
    return parameters;
  }

  /**
   * Search statements related to the given class for calls to the specified helper.
   * @param classSymbol the class whose helper calls we are interested in.
   * @param helperName the name of the helper (e.g. `__decorate`) whose calls we are interested in.
   * @returns an array of CallExpression nodes for each matching helper call.
   */
  protected getHelperCallsForClass(classSymbol: ts.Symbol, helperName: string):
      ts.CallExpression[] {
    return this.getStatementsForClass(classSymbol)
        .map(statement => this.getHelperCall(statement, helperName))
        .filter(isDefined);
  }

  /**
   * Find statements related to the given class that may contain calls to a helper.
   *
   * In ESM2015 code the helper calls are in the top level module, so we have to consider
   * all the statements in the module.
   *
   * @param classSymbol the class whose helper calls we are interested in.
   * @returns an array of statements that may contain helper calls.
   */
  protected getStatementsForClass(classSymbol: ts.Symbol): ts.Statement[] {
    return Array.from(classSymbol.valueDeclaration.getSourceFile().statements);
  }

  /**
   * Try to get the import info for this identifier as though it is a namespaced import.
   * For example, if the identifier is the `__metadata` part of a property access chain like:
   *
   * ```
   * tslib_1.__metadata
   * ```
   *
   * then it might be that `tslib_1` is a namespace import such as:
   *
   * ```
   * import * as tslib_1 from 'tslib';
   * ```
   * @param id the TypeScript identifier to find the import info for.
   * @returns The import info if this is a namespaced import or `null`.
   */
  protected getImportOfNamespacedIdentifier(id: ts.Identifier): Import|null {
    if (!(ts.isPropertyAccessExpression(id.parent) && id.parent.name === id)) {
      return null;
    }

    const namespaceIdentifier = getFarLeftIdentifier(id.parent);
    const namespaceSymbol =
        namespaceIdentifier && this.checker.getSymbolAtLocation(namespaceIdentifier);
    const declaration = namespaceSymbol && namespaceSymbol.declarations.length === 1 ?
        namespaceSymbol.declarations[0] :
        null;
    const namespaceDeclaration =
        declaration && ts.isNamespaceImport(declaration) ? declaration : null;
    if (!namespaceDeclaration) {
      return null;
    }

    const importDeclaration = namespaceDeclaration.parent.parent;
    if (!ts.isStringLiteral(importDeclaration.moduleSpecifier)) {
      // Should not happen as this would be invalid TypesScript
      return null;
    }

    return {
      from: importDeclaration.moduleSpecifier.text,
      name: id.text,
    };
  }

  /**
   * Test whether a decorator was imported from `@angular/core`.
   *
   * Is the decorator:
   * * externally imported from `@angulare/core`?
   * * the current hosted program is actually `@angular/core` and
   *   - relatively internally imported; or
   *   - not imported, from the current file.
   *
   * @param decorator the decorator to test.
   */
  protected isFromCore(decorator: Decorator): boolean {
    if (this.isCore) {
      return !decorator.import || /^\./.test(decorator.import.from);
    } else {
      return !!decorator.import && decorator.import.from === '@angular/core';
    }
  }

  protected computeDtsClassMap(dtsRootFileName: string, dtsProgram: ts.Program):
      Map<string, ts.ClassDeclaration> {
    const dtsClassMap = new Map<string, ts.ClassDeclaration>();
    const checker = dtsProgram.getTypeChecker();
    const dtsRootFile = dtsProgram.getSourceFile(dtsRootFileName);
    const rootModule = dtsRootFile && checker.getSymbolAtLocation(dtsRootFile);
    const moduleExports = rootModule && checker.getExportsOfModule(rootModule);
    if (moduleExports) {
      moduleExports.forEach(exportedSymbol => {
        if (exportedSymbol.flags & ts.SymbolFlags.Alias) {
          exportedSymbol = checker.getAliasedSymbol(exportedSymbol);
        }
        const declaration = exportedSymbol.declarations[0];
        if (declaration && ts.isClassDeclaration(declaration)) {
          const name = exportedSymbol.name;
          const previousDeclaration = dtsClassMap.get(name);
          if (previousDeclaration && previousDeclaration !== declaration) {
            console.warn(
                `Ambiguous class name ${name} in typings files: ${previousDeclaration.getSourceFile().fileName} and ${declaration.getSourceFile().fileName}`);
          } else {
            dtsClassMap.set(name, declaration);
          }
        }
      });
    }
    return dtsClassMap;
  }
}

///////////// Exported Helpers /////////////

export type ParamInfo = {
  decorators: Decorator[] | null,
  type: ts.Expression | null
};

/**
 * A statement node that represents an assignment.
 */
export type AssignmentStatement =
    ts.ExpressionStatement & {expression: {left: ts.Identifier, right: ts.Expression}};

/**
 * Test whether a statement node is an assignment statement.
 * @param statement the statement to test.
 */
export function isAssignmentStatement(statement: ts.Statement): statement is AssignmentStatement {
  return ts.isExpressionStatement(statement) && isAssignment(statement.expression) &&
      ts.isIdentifier(statement.expression.left);
}

export function isAssignment(expression: ts.Expression):
    expression is ts.AssignmentExpression<ts.EqualsToken> {
  return ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.EqualsToken;
}

/**
 * The type of a function that can be used to filter out helpers based on their target.
 * This is used in `reflectDecoratorsFromHelperCall()`.
 */
export type TargetFilter = (target: ts.Expression) => boolean;

/**
 * Creates a function that tests whether the given expression is a class target.
 * @param className the name of the class we want to target.
 */
export function makeClassTargetFilter(className: string): TargetFilter {
  return (target: ts.Expression): boolean => ts.isIdentifier(target) && target.text === className;
}

/**
 * Creates a function that tests whether the given expression is a class member target.
 * @param className the name of the class we want to target.
 */
export function makeMemberTargetFilter(className: string): TargetFilter {
  return (target: ts.Expression): boolean => ts.isPropertyAccessExpression(target) &&
      ts.isIdentifier(target.expression) && target.expression.text === className &&
      target.name.text === 'prototype';
}

/**
 * Helper method to extract the value of a property given the property's "symbol",
 * which is actually the symbol of the identifier of the property.
 */
export function getPropertyValueFromSymbol(propSymbol: ts.Symbol): ts.Expression|undefined {
  const propIdentifier = propSymbol.valueDeclaration;
  const parent = propIdentifier && propIdentifier.parent;
  return parent && ts.isBinaryExpression(parent) ? parent.right : undefined;
}

/**
 * A callee could be one of: `__decorate(...)` or `tslib_1.__decorate`.
 */
function getCalleeName(call: ts.CallExpression): string|null {
  if (ts.isIdentifier(call.expression)) {
    return call.expression.text;
  }
  if (ts.isPropertyAccessExpression(call.expression)) {
    return call.expression.name.text;
  }
  return null;
}

///////////// Internal Helpers /////////////

function getDecoratorArgs(node: ts.ObjectLiteralExpression): ts.Expression[] {
  // The arguments of a decorator are held in the `args` property of its declaration object.
  const argsProperty = node.properties.filter(ts.isPropertyAssignment)
                           .find(property => getNameText(property.name) === 'args');
  const argsExpression = argsProperty && argsProperty.initializer;
  return argsExpression && ts.isArrayLiteralExpression(argsExpression) ?
      Array.from(argsExpression.elements) :
      [];
}

function removeFromMap<T>(map: Map<string, T>, key: ts.__String): T|undefined {
  const mapKey = key as string;
  const value = map.get(mapKey);
  if (value !== undefined) {
    map.delete(mapKey);
  }
  return value;
}

function isPropertyAccess(node: ts.Node): node is ts.PropertyAccessExpression&
    {parent: ts.BinaryExpression} {
  return !!node.parent && ts.isBinaryExpression(node.parent) && ts.isPropertyAccessExpression(node);
}

function isThisAssignment(node: ts.Declaration): node is ts.BinaryExpression&
    {left: ts.PropertyAccessExpression} {
  return ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left) &&
      node.left.expression.kind === ts.SyntaxKind.ThisKeyword;
}

function isNamedDeclaration(node: ts.Declaration): node is ts.NamedDeclaration {
  return !!(node as any).name;
}


function isClassMemberType(node: ts.Declaration): node is ts.ClassElement|
    ts.PropertyAccessExpression|ts.BinaryExpression {
  return ts.isClassElement(node) || isPropertyAccess(node) || ts.isBinaryExpression(node);
}

/**
 * Compute the left most identifier in a property access chain. E.g. the `a` of `a.b.c.d`.
 * @param propertyAccess The starting property access expression from which we want to compute
 * the left most identifier.
 * @returns the left most identifier in the chain or `null` if it is not an identifier.
 */
function getFarLeftIdentifier(propertyAccess: ts.PropertyAccessExpression): ts.Identifier|null {
  while (ts.isPropertyAccessExpression(propertyAccess.expression)) {
    propertyAccess = propertyAccess.expression;
  }
  return ts.isIdentifier(propertyAccess.expression) ? propertyAccess.expression : null;
}
