/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import { ClassMember, ClassMemberKind, Decorator, Import, Parameter } from '../../../ngtsc/host';
import { getImportOfSymbol, reflectObjectLiteral } from '../../../ngtsc/metadata/src/reflector';
import { NgccReflectionHost } from './ngcc_host';

const DECORATORS = 'decorators' as ts.__String;
const PROP_DECORATORS = 'propDecorators' as ts.__String;
const CONSTRUCTOR = '__constructor' as ts.__String;
const CONSTRUCTOR_PARAMS = 'ctorParameters' as ts.__String;

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
export class Esm2015ReflectionHost implements NgccReflectionHost {
  constructor(protected checker: ts.TypeChecker) {}

  getDecoratorsOfDeclaration(declaration: ts.Declaration): Decorator[]|null {
    const symbol = this.getClassSymbol(declaration);
    if (symbol) {
      if (symbol.exports && symbol.exports.has(DECORATORS)) {

        // Symbol of the identifier for `SomeDirective.decorators`.
        const decoratorsSymbol = symbol.exports.get(DECORATORS)!;
        const decoratorsIdentifier = decoratorsSymbol.valueDeclaration;

        if (decoratorsIdentifier && decoratorsIdentifier.parent) {
          // AST of the array of decorator values
          const decoratorsArray = (decoratorsIdentifier.parent as ts.AssignmentExpression<ts.EqualsToken>).right;
          return this.getDecorators(decoratorsArray);
        }
      }
    }
    return null;
  }

  getMembersOfClass(clazz: ts.Declaration): ClassMember[] {
    const members: ClassMember[] = [];
    const symbol = this.getClassSymbol(clazz);
    if (symbol) {
      const memberDecorators = this.getMemberDecorators(symbol);
      memberDecorators.forEach((decorators, name) => {
        members.push({
          name,
          decorators,
          // TODO: it may be possible to determine if the member is actually a method/accessor
          // by checking the class prototype
          kind: ClassMemberKind.Property,
          // TODO: is it possible to have a static decorated property? Do we care?
          isStatic: false,
          node: null,
          type: null,
          nameNode: null,
          initializer: null,
        });
      });
    }
    return members;
  }

  getConstructorParameters(clazz: ts.Declaration): Parameter[]|null {
    const parameters: Parameter[] = [];
    const classSymbol = this.getClassSymbol(clazz);
    if (classSymbol) {
      const parameterNodes = getConstructorParameters(classSymbol);
      const decoratorInfo = getConstructorDecorators(classSymbol);
      parameterNodes.forEach((node, index) => {
        const info = decoratorInfo[index];
        const decorators = info && info.has('decorators') && this.getDecorators(info.get('decorators')!) || null;
        const type = info && info.get('type') || null;
        const nameNode = node.name;
        parameters.push({ name: nameNode.getText(), nameNode, type, decorators});
      });
    }
    return parameters;
  }

  getImportOfIdentifier(id: ts.Identifier): Import|null {
    const symbol = this.checker.getSymbolAtLocation(id);
    return getImportOfSymbol(symbol);
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
  protected getMemberDecorators(classSymbol: ts.Symbol) {
    const memberDecorators = new Map<string, Decorator[]>();
    if (classSymbol.exports && classSymbol.exports.has(PROP_DECORATORS)) {

      // Symbol of the identifier for `SomeDirective.propDecorators`.
      const propDecoratorsMap = getPropertyValueFromSymbol(classSymbol.exports.get(PROP_DECORATORS)!);
      if (propDecoratorsMap && ts.isObjectLiteralExpression(propDecoratorsMap)) {
        const propertiesMap = reflectObjectLiteral(propDecoratorsMap);
        propertiesMap.forEach((value, name) => {
          memberDecorators.set(name, this.getDecorators(value));
        });
      }
    }
    return memberDecorators;
  }

  protected getDecorators(decoratorsArray: ts.Expression) {
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
              name: typeIdentifier.getText(),
              import: this.getImportOfIdentifier(typeIdentifier),
              node,
              args: getDecoratorArgs(node),
            });
          }
        }
      });
    }

    return decorators;
  }

  protected getClassSymbol(declaration: ts.Declaration) {
    if (ts.isClassDeclaration(declaration)) {
      if (declaration.name) {
        return this.checker.getSymbolAtLocation(declaration.name);
      }
    }
  }
}


/**
 * Find the declarations of the constructor parameters of a class identified by its symbol.
 */
function getConstructorParameters(classSymbol: ts.Symbol) {
  const constructorSymbol = classSymbol.members && classSymbol.members.get(CONSTRUCTOR);
  if (constructorSymbol) {
    // For some reason the constructor does not have a `valueDeclaration` ?!?
    const constructor = constructorSymbol.declarations && constructorSymbol.declarations[0] as ts.ConstructorDeclaration;
    if (constructor && constructor.parameters) {
      return Array.from(constructor.parameters);
    }
  }
  return [];
}


/**
 * Constructors parameter decorators are declared in the body of static method of the class in ES2015:
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
function getConstructorDecorators(classSymbol: ts.Symbol) {
  if (classSymbol.exports && classSymbol.exports.has(CONSTRUCTOR_PARAMS)) {
    const paramDecoratorsProperty = getPropertyValueFromSymbol(classSymbol.exports.get(CONSTRUCTOR_PARAMS)!);
    if (paramDecoratorsProperty && ts.isArrowFunction(paramDecoratorsProperty)) {
      if (ts.isArrayLiteralExpression(paramDecoratorsProperty.body)) {
        return paramDecoratorsProperty.body.elements.map(element => ts.isObjectLiteralExpression(element) ? reflectObjectLiteral(element) : null);
      }
    }
  }
  return [];
}

/**
 * The arguments of a decorator are held in the `args` property of its declaration object.
 */
function getDecoratorArgs(node: ts.ObjectLiteralExpression) {
  const argsProperty = node.properties
    .filter(ts.isPropertyAssignment)
    .find(property => property.name.getText() === 'args');
  const argsExpression = argsProperty && argsProperty.initializer;
  if (argsExpression && ts.isArrayLiteralExpression(argsExpression)) {
    return Array.from(argsExpression.elements);
  } else {
    return [];
  }
}

/**
 * Helper method to extract the value of a property given the property's "symbol",
 * which is actually the symbol of the identifier of the property.
 */
function getPropertyValueFromSymbol(propSymbol: ts.Symbol) {
  const propIdentifier = propSymbol.valueDeclaration;
  if (propIdentifier && propIdentifier.parent) {
    return (propIdentifier.parent as ts.AssignmentExpression<ts.EqualsToken>).right;
  }
}
