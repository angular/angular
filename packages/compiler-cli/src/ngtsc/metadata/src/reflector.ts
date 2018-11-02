/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ClassMember, ClassMemberKind, CtorParameter, Declaration, Decorator, FunctionDefinition, Import, ReflectionHost} from '../../host';

/**
 * reflector.ts implements static reflection of declarations using the TypeScript `ts.TypeChecker`.
 */

export class TypeScriptReflectionHost implements ReflectionHost {
  constructor(protected checker: ts.TypeChecker) {}

  getDecoratorsOfDeclaration(declaration: ts.Declaration): Decorator[]|null {
    if (declaration.decorators === undefined || declaration.decorators.length === 0) {
      return null;
    }
    return declaration.decorators.map(decorator => this._reflectDecorator(decorator))
        .filter((dec): dec is Decorator => dec !== null);
  }

  getMembersOfClass(declaration: ts.Declaration): ClassMember[] {
    const clazz = castDeclarationToClassOrDie(declaration);
    return clazz.members.map(member => this._reflectMember(member))
        .filter((member): member is ClassMember => member !== null);
  }

  getConstructorParameters(declaration: ts.Declaration): CtorParameter[]|null {
    const clazz = castDeclarationToClassOrDie(declaration);

    // First, find the constructor.
    const ctor = clazz.members.find(ts.isConstructorDeclaration);
    if (ctor === undefined) {
      return null;
    }

    return ctor.parameters.map(node => {
      // The name of the parameter is easy.
      const name = parameterName(node.name);

      const decorators = this.getDecoratorsOfDeclaration(node);

      // It may or may not be possible to write an expression that refers to the value side of the
      // type named for the parameter.
      let typeValueExpr: ts.Expression|null = null;

      // It's not possible to get a value expression if the parameter doesn't even have a type.
      if (node.type !== undefined) {
        // It's only valid to convert a type reference to a value reference if the type actually has
        // a
        // value declaration associated with it.
        const type = this.checker.getTypeFromTypeNode(node.type);
        if (type.symbol !== undefined && type.symbol.valueDeclaration !== undefined) {
          // The type points to a valid value declaration. Rewrite the TypeReference into an
          // Expression
          // which references the value pointed to by the TypeReference, if possible.
          typeValueExpr = typeNodeToValueExpr(node.type);
        }
      }

      return {
        name,
        nameNode: node.name,
        type: typeValueExpr, decorators,
      };
    });
  }

  getImportOfIdentifier(id: ts.Identifier): Import|null {
    const symbol = this.checker.getSymbolAtLocation(id);

    if (symbol === undefined || symbol.declarations === undefined ||
        symbol.declarations.length !== 1) {
      return null;
    }

    // Ignore decorators that are defined locally (not imported).
    const decl: ts.Declaration = symbol.declarations[0];
    if (!ts.isImportSpecifier(decl)) {
      return null;
    }

    // Walk back from the specifier to find the declaration, which carries the module specifier.
    const importDecl = decl.parent !.parent !.parent !;

    // The module specifier is guaranteed to be a string literal, so this should always pass.
    if (!ts.isStringLiteral(importDecl.moduleSpecifier)) {
      // Not allowed to happen in TypeScript ASTs.
      return null;
    }

    // Read the module specifier.
    const from = importDecl.moduleSpecifier.text;

    // Compute the name by which the decorator was exported, not imported.
    const name = (decl.propertyName !== undefined ? decl.propertyName : decl.name).text;

    return {from, name};
  }

  getExportsOfModule(node: ts.Node): Map<string, Declaration>|null {
    // In TypeScript code, modules are only ts.SourceFiles. Throw if the node isn't a module.
    if (!ts.isSourceFile(node)) {
      throw new Error(`getDeclarationsOfModule() called on non-SourceFile in TS code`);
    }
    const map = new Map<string, Declaration>();

    // Reflect the module to a Symbol, and use getExportsOfModule() to get a list of exported
    // Symbols.
    const symbol = this.checker.getSymbolAtLocation(node);
    if (symbol === undefined) {
      return null;
    }
    this.checker.getExportsOfModule(symbol).forEach(exportSymbol => {
      // Map each exported Symbol to a Declaration and add it to the map.
      const decl = this.getDeclarationOfSymbol(exportSymbol);
      if (decl !== null) {
        map.set(exportSymbol.name, decl);
      }
    });
    return map;
  }

  isClass(node: ts.Node): boolean {
    // In TypeScript code, classes are ts.ClassDeclarations.
    return ts.isClassDeclaration(node);
  }

  hasBaseClass(node: ts.Declaration): boolean {
    return ts.isClassDeclaration(node) && node.heritageClauses !== undefined &&
        node.heritageClauses.some(clause => clause.token === ts.SyntaxKind.ExtendsKeyword);
  }

  getDeclarationOfIdentifier(id: ts.Identifier): Declaration|null {
    // Resolve the identifier to a Symbol, and return the declaration of that.
    let symbol: ts.Symbol|undefined = this.checker.getSymbolAtLocation(id);
    if (symbol === undefined) {
      return null;
    }
    return this.getDeclarationOfSymbol(symbol);
  }

  getDefinitionOfFunction<T extends ts.FunctionDeclaration|ts.MethodDeclaration|
                          ts.FunctionExpression>(node: T): FunctionDefinition<T> {
    return {
      node,
      body: node.body !== undefined ? Array.from(node.body.statements) : null,
      parameters: node.parameters.map(param => {
        const name = parameterName(param.name);
        const initializer = param.initializer || null;
        return {name, node: param, initializer};
      }),
    };
  }

  getGenericArityOfClass(clazz: ts.Declaration): number|null {
    if (!ts.isClassDeclaration(clazz)) {
      return null;
    }
    return clazz.typeParameters !== undefined ? clazz.typeParameters.length : 0;
  }

  getVariableValue(declaration: ts.VariableDeclaration): ts.Expression|null {
    return declaration.initializer || null;
  }

  getDtsDeclarationOfClass(_: ts.Declaration): ts.ClassDeclaration|null { return null; }

  /**
   * Resolve a `ts.Symbol` to its declaration, keeping track of the `viaModule` along the way.
   *
   * @internal
   */
  protected getDeclarationOfSymbol(symbol: ts.Symbol): Declaration|null {
    let viaModule: string|null = null;
    // Look through the Symbol's immediate declarations, and see if any of them are import-type
    // statements.
    if (symbol.declarations !== undefined && symbol.declarations.length > 0) {
      for (let i = 0; i < symbol.declarations.length; i++) {
        const decl = symbol.declarations[i];
        if (ts.isImportSpecifier(decl) && decl.parent !== undefined &&
            decl.parent.parent !== undefined && decl.parent.parent.parent !== undefined) {
          // Find the ImportDeclaration that imported this Symbol.
          const importDecl = decl.parent.parent.parent;
          // The moduleSpecifier should always be a string.
          if (ts.isStringLiteral(importDecl.moduleSpecifier)) {
            // Check if the moduleSpecifier is absolute. If it is, this symbol comes from an
            // external module, and the import path becomes the viaModule.
            const moduleSpecifier = importDecl.moduleSpecifier.text;
            if (!moduleSpecifier.startsWith('.')) {
              viaModule = moduleSpecifier;
              break;
            }
          }
        }
      }
    }

    // Now, resolve the Symbol to its declaration by following any and all aliases.
    while (symbol.flags & ts.SymbolFlags.Alias) {
      symbol = this.checker.getAliasedSymbol(symbol);
    }

    // Look at the resolved Symbol's declarations and pick one of them to return. Value declarations
    // are given precedence over type declarations.
    if (symbol.valueDeclaration !== undefined) {
      return {
        node: symbol.valueDeclaration,
        viaModule,
      };
    } else if (symbol.declarations !== undefined && symbol.declarations.length > 0) {
      return {
        node: symbol.declarations[0],
        viaModule,
      };
    } else {
      return null;
    }
  }

  private _reflectDecorator(node: ts.Decorator): Decorator|null {
    // Attempt to resolve the decorator expression into a reference to a concrete Identifier. The
    // expression may contain a call to a function which returns the decorator function, in which
    // case we want to return the arguments.
    let decoratorExpr: ts.Expression = node.expression;
    let args: ts.Expression[]|null = null;

    // Check for call expressions.
    if (ts.isCallExpression(decoratorExpr)) {
      args = Array.from(decoratorExpr.arguments);
      decoratorExpr = decoratorExpr.expression;
    }

    // The final resolved decorator should be a `ts.Identifier` - if it's not, then something is
    // wrong and the decorator can't be resolved statically.
    if (!ts.isIdentifier(decoratorExpr)) {
      return null;
    }

    const importDecl = this.getImportOfIdentifier(decoratorExpr);

    return {
      name: decoratorExpr.text,
      identifier: decoratorExpr,
      import: importDecl, node, args,
    };
  }

  private _reflectMember(node: ts.ClassElement): ClassMember|null {
    let kind: ClassMemberKind|null = null;
    let value: ts.Expression|null = null;
    let name: string|null = null;
    let nameNode: ts.Identifier|null = null;

    if (ts.isPropertyDeclaration(node)) {
      kind = ClassMemberKind.Property;
      value = node.initializer || null;
    } else if (ts.isGetAccessorDeclaration(node)) {
      kind = ClassMemberKind.Getter;
    } else if (ts.isSetAccessorDeclaration(node)) {
      kind = ClassMemberKind.Setter;
    } else if (ts.isMethodDeclaration(node)) {
      kind = ClassMemberKind.Method;
    } else if (ts.isConstructorDeclaration(node)) {
      kind = ClassMemberKind.Constructor;
    } else {
      return null;
    }

    if (ts.isConstructorDeclaration(node)) {
      name = 'constructor';
    } else if (ts.isIdentifier(node.name)) {
      name = node.name.text;
      nameNode = node.name;
    } else {
      return null;
    }

    const decorators = this.getDecoratorsOfDeclaration(node);
    const isStatic = node.modifiers !== undefined &&
        node.modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword);

    return {
      node,
      implementation: node, kind,
      type: node.type || null, name, nameNode, decorators, value, isStatic,
    };
  }
}

export function reflectNameOfDeclaration(decl: ts.Declaration): string|null {
  const id = reflectIdentifierOfDeclaration(decl);
  return id && id.text || null;
}

export function reflectIdentifierOfDeclaration(decl: ts.Declaration): ts.Identifier|null {
  if (ts.isClassDeclaration(decl) || ts.isFunctionDeclaration(decl)) {
    return decl.name || null;
  } else if (ts.isVariableDeclaration(decl)) {
    if (ts.isIdentifier(decl.name)) {
      return decl.name;
    }
  }
  return null;
}

export function reflectTypeEntityToDeclaration(
    type: ts.EntityName, checker: ts.TypeChecker): {node: ts.Declaration, from: string | null} {
  let realSymbol = checker.getSymbolAtLocation(type);
  if (realSymbol === undefined) {
    throw new Error(`Cannot resolve type entity ${type.getText()} to symbol`);
  }
  while (realSymbol.flags & ts.SymbolFlags.Alias) {
    realSymbol = checker.getAliasedSymbol(realSymbol);
  }

  let node: ts.Declaration|null = null;
  if (realSymbol.valueDeclaration !== undefined) {
    node = realSymbol.valueDeclaration;
  } else if (realSymbol.declarations !== undefined && realSymbol.declarations.length === 1) {
    node = realSymbol.declarations[0];
  } else {
    throw new Error(`Cannot resolve type entity symbol to declaration`);
  }

  if (ts.isQualifiedName(type)) {
    if (!ts.isIdentifier(type.left)) {
      throw new Error(`Cannot handle qualified name with non-identifier lhs`);
    }
    const symbol = checker.getSymbolAtLocation(type.left);
    if (symbol === undefined || symbol.declarations === undefined ||
        symbol.declarations.length !== 1) {
      throw new Error(`Cannot resolve qualified type entity lhs to symbol`);
    }
    const decl = symbol.declarations[0];
    if (ts.isNamespaceImport(decl)) {
      const clause = decl.parent !;
      const importDecl = clause.parent !;
      if (!ts.isStringLiteral(importDecl.moduleSpecifier)) {
        throw new Error(`Module specifier is not a string`);
      }
      return {node, from: importDecl.moduleSpecifier.text};
    } else {
      throw new Error(`Unknown import type?`);
    }
  } else {
    return {node, from: null};
  }
}

export function filterToMembersWithDecorator(members: ClassMember[], name: string, module?: string):
    {member: ClassMember, decorators: Decorator[]}[] {
  return members.filter(member => !member.isStatic)
      .map(member => {
        if (member.decorators === null) {
          return null;
        }

        const decorators = member.decorators.filter(dec => {
          if (dec.import !== null) {
            return dec.import.name === name && (module === undefined || dec.import.from === module);
          } else {
            return dec.name === name && module === undefined;
          }
        });

        if (decorators.length === 0) {
          return null;
        }

        return {member, decorators};
      })
      .filter((value): value is {member: ClassMember, decorators: Decorator[]} => value !== null);
}

export function findMember(
    members: ClassMember[], name: string, isStatic: boolean = false): ClassMember|null {
  return members.find(member => member.isStatic === isStatic && member.name === name) || null;
}

export function reflectObjectLiteral(node: ts.ObjectLiteralExpression): Map<string, ts.Expression> {
  const map = new Map<string, ts.Expression>();
  node.properties.forEach(prop => {
    if (ts.isPropertyAssignment(prop)) {
      const name = propertyNameToString(prop.name);
      if (name === null) {
        return;
      }
      map.set(name, prop.initializer);
    } else if (ts.isShorthandPropertyAssignment(prop)) {
      map.set(prop.name.text, prop.name);
    } else {
      return;
    }
  });
  return map;
}

function castDeclarationToClassOrDie(declaration: ts.Declaration): ts.ClassDeclaration {
  if (!ts.isClassDeclaration(declaration)) {
    throw new Error(
        `Reflecting on a ${ts.SyntaxKind[declaration.kind]} instead of a ClassDeclaration.`);
  }
  return declaration;
}

function parameterName(name: ts.BindingName): string|null {
  if (ts.isIdentifier(name)) {
    return name.text;
  } else {
    return null;
  }
}

function typeNodeToValueExpr(node: ts.TypeNode): ts.Expression|null {
  if (ts.isTypeReferenceNode(node)) {
    return entityNameToValue(node.typeName);
  } else {
    return null;
  }
}

function entityNameToValue(node: ts.EntityName): ts.Expression|null {
  if (ts.isQualifiedName(node)) {
    const left = entityNameToValue(node.left);
    return left !== null ? ts.createPropertyAccess(left, node.right) : null;
  } else if (ts.isIdentifier(node)) {
    return ts.getMutableClone(node);
  } else {
    return null;
  }
}

function propertyNameToString(node: ts.PropertyName): string|null {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  } else {
    return null;
  }
}
