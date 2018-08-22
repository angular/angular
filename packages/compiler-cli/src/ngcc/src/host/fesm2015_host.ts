/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ClassMember, ClassMemberKind, CtorParameter, Decorator} from '../../../ngtsc/host';
import {TypeScriptReflectionHost, reflectObjectLiteral} from '../../../ngtsc/metadata';
import {getNameText} from '../utils';

import {NgccReflectionHost} from './ngcc_host';

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
export class Fesm2015ReflectionHost extends TypeScriptReflectionHost implements NgccReflectionHost {
  constructor(checker: ts.TypeChecker) { super(checker); }

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
    if (symbol) {
      if (symbol.exports && symbol.exports.has(DECORATORS)) {
        // Symbol of the identifier for `SomeDirective.decorators`.
        const decoratorsSymbol = symbol.exports.get(DECORATORS) !;
        const decoratorsIdentifier = decoratorsSymbol.valueDeclaration;

        if (decoratorsIdentifier && decoratorsIdentifier.parent) {
          if (ts.isBinaryExpression(decoratorsIdentifier.parent)) {
            // AST of the array of decorator values
            const decoratorsArray = decoratorsIdentifier.parent.right;
            return this.reflectDecorators(decoratorsArray);
          }
        }
      }
    }
    return null;
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
      const parameters: CtorParameter[] = [];
      const decoratorInfo = this.getConstructorDecorators(classSymbol);
      parameterNodes.forEach((node, index) => {
        const info = decoratorInfo[index];
        const decorators =
            info && info.has('decorators') && this.reflectDecorators(info.get('decorators') !) ||
            null;
        const type = info && info.get('type') || null;
        const nameNode = node.name;
        parameters.push({name: getNameText(nameNode), nameNode, type, decorators});
      });
      return parameters;
    }
    return null;
  }

  /**
   * Find a symbol for a node that we think is a class.
   * @param node The node whose symbol we are finding.
   * @returns The symbol for the node or `undefined` if it is not a "class" or has no symbol.
   */
  getClassSymbol(declaration: ts.Node): ts.Symbol|undefined {
    return ts.isClassDeclaration(declaration) ?
        declaration.name && this.checker.getSymbolAtLocation(declaration.name) :
        undefined;
  }

  /**
   * Member decorators are declared as static properties of the class in ES2015:
   *
   * ```
   * SomeDirective.propDecorators = {
   *   "ngForOf": [{ type: Input },],
   *   "ngForTrackBy": [{ type: Input },],
   *   "ngForTemplate": [{ type: Input },],
   * };
   * ```
   */
  protected getMemberDecorators(classSymbol: ts.Symbol): Map<string, Decorator[]> {
    const memberDecorators = new Map<string, Decorator[]>();
    if (classSymbol.exports && classSymbol.exports.has(PROP_DECORATORS)) {
      // Symbol of the identifier for `SomeDirective.propDecorators`.
      const propDecoratorsMap =
          getPropertyValueFromSymbol(classSymbol.exports.get(PROP_DECORATORS) !);
      if (propDecoratorsMap && ts.isObjectLiteralExpression(propDecoratorsMap)) {
        const propertiesMap = reflectObjectLiteral(propDecoratorsMap);
        propertiesMap.forEach(
            (value, name) => { memberDecorators.set(name, this.reflectDecorators(value)); });
      }
    }
    return memberDecorators;
  }

  /**
   * Reflect over the given expression and extract decorator information.
   * @param decoratorsArray An expression that contains decorator information.
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
              import: this.getImportOfIdentifier(typeIdentifier), node,
              args: getDecoratorArgs(node),
            });
          }
        }
      });
    }
    return decorators;
  }

  protected reflectMember(symbol: ts.Symbol, decorators?: Decorator[], isStatic?: boolean):
      ClassMember|null {
    let kind: ClassMemberKind|null = null;
    let value: ts.Expression|null = null;
    let name: string|null = null;
    let nameNode: ts.Identifier|null = null;
    let type = null;


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
   * the
   * class's constructor or null if there is no constructor.
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
   * Constructors parameter decorators are declared in the body of static method of the class in
   * ES2015:
   *
   * ```
   * SomeDirective.ctorParameters = () => [
   *   { type: ViewContainerRef, },
   *   { type: TemplateRef, },
   *   { type: IterableDiffers, },
   *   { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN,] },] },
   * ];
   * ```
   */
  protected getConstructorDecorators(classSymbol: ts.Symbol): (Map<string, ts.Expression>|null)[] {
    if (classSymbol.exports && classSymbol.exports.has(CONSTRUCTOR_PARAMS)) {
      const paramDecoratorsProperty =
          getPropertyValueFromSymbol(classSymbol.exports.get(CONSTRUCTOR_PARAMS) !);
      if (paramDecoratorsProperty && ts.isArrowFunction(paramDecoratorsProperty)) {
        if (ts.isArrayLiteralExpression(paramDecoratorsProperty.body)) {
          return paramDecoratorsProperty.body.elements.map(
              element =>
                  ts.isObjectLiteralExpression(element) ? reflectObjectLiteral(element) : null);
        }
      }
    }
    return [];
  }
}

/**
 * The arguments of a decorator are held in the `args` property of its declaration object.
 */
function getDecoratorArgs(node: ts.ObjectLiteralExpression): ts.Expression[] {
  const argsProperty = node.properties.filter(ts.isPropertyAssignment)
                           .find(property => getNameText(property.name) === 'args');
  const argsExpression = argsProperty && argsProperty.initializer;
  return argsExpression && ts.isArrayLiteralExpression(argsExpression) ?
      Array.from(argsExpression.elements) :
      [];
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
