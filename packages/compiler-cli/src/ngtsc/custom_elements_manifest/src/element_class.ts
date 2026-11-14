/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/** A property of an element class that a template binding can assign. */
export interface ElementClassMember {
  /**
   * Whether an assignment to the property can be type-checked. It can't when the property's type
   * is `any`, or names a type that TypeScript fails to resolve, for example one of a package that
   * isn't installed. TypeScript then treats that type as `any` and reports nothing.
   */
  hasCheckType: boolean;
}

/**
 * Member names that can be written into a type-check block without escaping. A name that starts
 * with an underscore is excluded, because it marks a member as internal by convention.
 */
const MEMBER_NAME = /^[A-Za-z$][A-Za-z0-9_$]*$/;

/**
 * The public writable properties of an element class, read from its TypeScript declaration. A
 * manifest can omit members, most often inherited ones, and can give types that Angular can't
 * use. The class fills both gaps.
 *
 * Lookups avoid resolving the types of members where they can, because a load reads thousands of
 * members and resolving one type can take seconds, as for a union that is computed from the keys
 * of a large object.
 */
export class ElementClassMembers {
  /** Whether each type alias that a member uses is free of unresolved names. */
  private readonly resolvedAliases = new Map<ts.Symbol, boolean>();

  /** Whether the class or a base class passes an unresolved type to a class that it extends. */
  private extendsUnresolvedType: boolean | undefined;

  constructor(
    private readonly checker: ts.TypeChecker,
    private readonly type: ts.Type,
    /** The members of `HTMLElement` by name, which the DOM schema already covers. */
    private readonly htmlElementMembers: ReadonlyMap<string, ts.Symbol>,
  ) {}

  /** The member that a binding to `name` assigns, or `null` if the class has no such member. */
  get(name: string): ElementClassMember | null {
    const symbol = this.checker.getPropertyOfType(this.type, name);
    return symbol === undefined || !isBindableMember(symbol)
      ? null
      : {hasCheckType: this.hasCheckType(symbol)};
  }

  /**
   * The values that a member accepts when its type is a union of string literals, or `null`. Call
   * this only for a member that has a check type.
   */
  stringLiteralValues(name: string): string[] | null {
    const symbol = this.checker.getPropertyOfType(this.type, name);
    return symbol === undefined ? null : resolvedStringLiteralValues(this.writeType(symbol));
  }

  /**
   * Names of the members that the class or one of its base classes declares. A member that only
   * `HTMLElement` declares is excluded, but one that the class declares again is not: the class
   * can give it a narrower type, and TypeScript's `HTMLElement` has members that the DOM schema
   * doesn't know.
   */
  ownNames(): string[] {
    return this.checker
      .getPropertiesOfType(this.type)
      .filter((symbol) => !this.isDeclaredOnlyByHTMLElement(symbol) && isBindableMember(symbol))
      .map((symbol) => symbol.name);
  }

  private isDeclaredOnlyByHTMLElement(symbol: ts.Symbol): boolean {
    const inherited = this.htmlElementMembers.get(symbol.name);
    if (inherited === undefined) {
      return false;
    }
    const inheritedDeclarations = inherited.declarations ?? [];
    return (
      symbol === inherited ||
      (symbol.declarations ?? []).every((declaration) =>
        inheritedDeclarations.includes(declaration),
      )
    );
  }

  /**
   * The type of the values that can be assigned to the member. The type of the symbol is its
   * getter's, with the type arguments that the element class gives to a generic base class. A
   * setter's annotation lacks those arguments, so it is used only when it differs from the
   * getter's.
   */
  private writeType(symbol: ts.Symbol): ts.Type {
    const declarations = symbol.declarations ?? [];
    const setterType = declarations.find(ts.isSetAccessor)?.parameters[0]?.type;
    const getter = declarations.find(ts.isGetAccessor);
    return setterType === undefined ||
      getter === undefined ||
      getter.type?.getText() === setterType.getText()
      ? this.checker.getTypeOfSymbol(symbol)
      : this.checker.getTypeFromTypeNode(setterType);
  }

  private hasCheckType(symbol: ts.Symbol): boolean {
    const annotations = writeTypeNodes(symbol);
    // Without an annotation, TypeScript infers the type. It is `any` in a declaration file, and
    // where the inferred type is unresolved.
    return annotations.length === 0
      ? (this.checker.getTypeOfSymbol(symbol).flags & ts.TypeFlags.Any) === 0
      : annotations.every(
          (annotation) =>
            annotation.kind !== ts.SyntaxKind.AnyKeyword && !this.namesUnresolvedType(annotation),
        );
  }

  /**
   * Whether a type annotation, or a type alias that it uses, names a type that TypeScript can't
   * resolve. This reads the declarations and resolves only their names.
   */
  private namesUnresolvedType(node: ts.Node): boolean {
    const visit = (child: ts.Node): boolean =>
      (ts.isTypeReferenceNode(child) &&
        !this.resolves(this.checker.getSymbolAtLocation(child.typeName))) ||
      (ts.isTypeQueryNode(child) &&
        !this.resolves(this.checker.getSymbolAtLocation(child.exprName))) ||
      (ts.isImportTypeNode(child) && !this.importResolves(child)) ||
      ts.forEachChild(child, visit) === true;
    return visit(node);
  }

  /**
   * Whether the module of an `import()` type and the name that the type reads from it resolve.
   * The name is looked up among the exports, because TypeScript computes the type of an
   * `import()` type to resolve the name in place.
   */
  private importResolves(node: ts.ImportTypeNode): boolean {
    let symbol = ts.isLiteralTypeNode(node.argument)
      ? this.checker.getSymbolAtLocation(node.argument.literal)
      : undefined;
    if (node.qualifier === undefined) {
      return symbol !== undefined;
    }
    for (const name of entityNameParts(node.qualifier)) {
      symbol =
        symbol === undefined
          ? undefined
          : this.checker.tryGetMemberInModuleExports(name, this.aliased(symbol));
    }
    return this.resolves(symbol);
  }

  private aliased(symbol: ts.Symbol): ts.Symbol {
    return (symbol.flags & ts.SymbolFlags.Alias) !== 0
      ? this.checker.getAliasedSymbol(symbol)
      : symbol;
  }

  private resolves(symbol: ts.Symbol | undefined): boolean {
    symbol = symbol === undefined ? undefined : this.aliased(symbol);
    if (symbol === undefined || this.checker.isUnknownSymbol(symbol)) {
      return false;
    }
    if ((symbol.flags & ts.SymbolFlags.TypeParameter) !== 0) {
      // A type parameter of a class stands for a type that a derived class passes.
      return !(
        (symbol.declarations ?? []).some(({parent}) => isClassOrInterface(parent)) &&
        this.heritageNamesUnresolvedType()
      );
    }
    if ((symbol.flags & ts.SymbolFlags.TypeAlias) === 0) {
      return true;
    }
    let resolves = this.resolvedAliases.get(symbol);
    if (resolves === undefined) {
      // An alias that refers to itself resolves if its other names do.
      this.resolvedAliases.set(symbol, true);
      resolves = !(symbol.declarations ?? []).some(
        (declaration) =>
          ts.isTypeAliasDeclaration(declaration) && this.namesUnresolvedType(declaration.type),
      );
      this.resolvedAliases.set(symbol, resolves);
    }
    return resolves;
  }

  /**
   * Whether the element class or one of its base classes extends a class with a type argument
   * that names an unresolved type, or leaves out an argument whose default does.
   */
  private heritageNamesUnresolvedType(): boolean {
    if (this.extendsUnresolvedType === undefined) {
      // A type parameter that is passed on to a base class is unresolved where it is given.
      this.extendsUnresolvedType = false;
      const visited = new Set<ts.Declaration>();
      const unresolved = (node: ts.TypeNode | undefined) =>
        node !== undefined && this.namesUnresolvedType(node);
      const visit = (declaration: ts.Declaration, argumentCount: number): boolean => {
        if (visited.has(declaration) || !isClassOrInterface(declaration)) {
          return false;
        }
        visited.add(declaration);
        return (
          (declaration.typeParameters ?? [])
            .slice(argumentCount)
            .some((parameter) => unresolved(parameter.default)) ||
          (declaration.heritageClauses ?? []).some((clause) =>
            clause.types.some((base) => {
              const typeArguments = base.typeArguments ?? [];
              return (
                typeArguments.some(unresolved) ||
                this.declarationsOf(base.expression).some((target) =>
                  visit(target, typeArguments.length),
                )
              );
            }),
          )
        );
      };
      this.extendsUnresolvedType = (this.type.symbol?.declarations ?? []).some((declaration) =>
        visit(declaration, 0),
      );
    }
    return this.extendsUnresolvedType;
  }

  private declarationsOf(expression: ts.Expression): readonly ts.Declaration[] {
    const symbol = this.checker.getSymbolAtLocation(expression);
    return symbol === undefined ? [] : (this.aliased(symbol).declarations ?? []);
  }
}

function isClassOrInterface(
  node: ts.Node,
): node is ts.ClassLikeDeclaration | ts.InterfaceDeclaration {
  return ts.isClassLike(node) || ts.isInterfaceDeclaration(node);
}

/** The names of `A.B.C` from left to right. */
function entityNameParts(name: ts.EntityName): string[] {
  return ts.isIdentifier(name) ? [name.text] : [...entityNameParts(name.left), name.right.text];
}

/**
 * The type annotations for values assigned to the member: its setter's, if it has one. Empty for
 * a member whose type TypeScript infers.
 */
function writeTypeNodes(symbol: ts.Symbol): ts.TypeNode[] {
  const declarations = symbol.declarations ?? [];
  const setters = declarations.filter(ts.isSetAccessor);
  const annotations =
    setters.length > 0
      ? setters.map((setter) => setter.parameters[0]?.type)
      : declarations.map((declaration) =>
          ts.isPropertyDeclaration(declaration) ||
          ts.isPropertySignature(declaration) ||
          ts.isParameter(declaration)
            ? declaration.type
            : undefined,
        );
  return annotations.filter((annotation) => annotation !== undefined);
}

/**
 * Whether a binding can assign the member: a property or accessor that is public, not `readonly`,
 * has a setter if it has a getter, and has a name that doesn't start with an underscore. Methods
 * are excluded, but properties with a function type are not.
 */
function isBindableMember(symbol: ts.Symbol): boolean {
  if (
    (symbol.flags & (ts.SymbolFlags.Property | ts.SymbolFlags.Accessor)) === 0 ||
    !MEMBER_NAME.test(symbol.name)
  ) {
    return false;
  }
  const declarations = symbol.declarations ?? [];
  let hasGetter = false;
  let hasSetter = false;
  for (const declaration of declarations) {
    const modifiers = ts.getCombinedModifierFlags(declaration);
    if (
      (modifiers &
        (ts.ModifierFlags.Private | ts.ModifierFlags.Protected | ts.ModifierFlags.Readonly)) !==
      0
    ) {
      return false;
    }
    hasGetter ||= ts.isGetAccessor(declaration);
    hasSetter ||= ts.isSetAccessor(declaration);
  }
  return declarations.length > 0 && (!hasGetter || hasSetter);
}

/**
 * The values of a union of string literals, ignoring `undefined` and `null`. Returns `null` if the
 * type has any other member.
 */
export function resolvedStringLiteralValues(type: ts.Type): string[] | null {
  if (type.isUnion()) {
    const values: string[] = [];
    for (const member of type.types) {
      const memberValues = resolvedStringLiteralValues(member);
      if (memberValues === null) {
        return null;
      }
      values.push(...memberValues);
    }
    return Array.from(new Set(values));
  }
  if (
    (type.flags &
      (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Never | ts.TypeFlags.Void)) !==
    0
  ) {
    return [];
  }
  return type.isStringLiteral() ? [type.value] : null;
}
