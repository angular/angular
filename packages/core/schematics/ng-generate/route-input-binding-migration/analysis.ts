/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ProgramInfo, projectFile} from '../../utils/tsurge';
import {getAngularDecorators} from '../../utils/ng_decorators';
import {getImportOfIdentifier} from '../../utils/typescript/imports';
import {ComponentID, RouteInfo, RouteReadKey, RouteReadSource, RouterSetupInfo} from './types';

/** A read of route state from an `ActivatedRoute` snapshot that may be replaced by an input. */
export interface RouteRead {
  /** Expression that will be replaced, e.g. `this.route.snapshot.paramMap.get('id')`. */
  node: ts.Expression;
  source: RouteReadSource;
  key: string;
  /** Whether the read goes through `ParamMap.get`, which returns `null` for missing values. */
  isMapGet: boolean;
}

/** A class member holding an injected `ActivatedRoute`. */
export interface ActivatedRouteMember {
  node: ts.ParameterDeclaration | ts.PropertyDeclaration;
  isPrivate: boolean;
  /** Whether the member is initialized through `inject(ActivatedRoute)`. */
  usesInjectFunction: boolean;
  /** Reads that can be replaced with an input, if approved by the global analysis. */
  reads: RouteRead[];
  /** Whether the member is used in ways that cannot be migrated. */
  hasOtherUsages: boolean;
}

/** Result of analyzing a component class that injects `ActivatedRoute`. */
export interface ComponentAnalysis {
  members: ActivatedRouteMember[];
  /** Names of the inputs that would be generated for each read. */
  inputNames: Map<RouteReadKey, string>;
}

const ROUTER_MODULE = '@angular/router';
const CORE_MODULE = '@angular/core';

/** Whether the given file is a test file. Router setups in tests don't affect the app. */
export function isTestFile(sf: ts.SourceFile): boolean {
  return /\.(spec|test)\.ts$/.test(sf.fileName);
}

/** Gets the unique ID of a component class. */
export function getComponentId(node: ts.ClassDeclaration, info: ProgramInfo): ComponentID | null {
  if (node.name === undefined) {
    return null;
  }
  return `${projectFile(node.getSourceFile(), info).id}@@${node.name.text}` as ComponentID;
}

/** Whether the given class is decorated with `@Component`. */
export function isComponentClass(node: ts.ClassDeclaration, checker: ts.TypeChecker): boolean {
  return getAngularDecorators(checker, ts.getDecorators(node) ?? []).some(
    (d) => d.name === 'Component' && d.moduleName === CORE_MODULE,
  );
}

/** Creates the key identifying a route read. */
export function getReadKey(source: RouteReadSource, key: string): RouteReadKey {
  return `${source}:${key}`;
}

/** Splits a read key into its source and route state key. */
export function parseReadKey(readKey: RouteReadKey): {source: RouteReadSource; key: string} {
  const separator = readKey.indexOf(':');
  return {
    source: readKey.slice(0, separator) as RouteReadSource,
    key: readKey.slice(separator + 1),
  };
}

/** Whether the identifier refers to the given export of a module. */
function isImportOf(
  checker: ts.TypeChecker,
  node: ts.Node,
  name: string,
  moduleName: string,
): node is ts.Identifier {
  if (!ts.isIdentifier(node)) {
    return false;
  }
  const importInfo = getImportOfIdentifier(checker, node);
  return importInfo !== null && importInfo.name === name && importInfo.importModule === moduleName;
}

/** Gets a property with a static name from an object literal. */
function getObjectProperty(
  node: ts.ObjectLiteralExpression,
  name: string,
): ts.ObjectLiteralElementLike | null {
  return (
    node.properties.find(
      (p) =>
        p.name !== undefined &&
        (ts.isIdentifier(p.name) || ts.isStringLiteralLike(p.name)) &&
        p.name.text === name,
    ) ?? null
  );
}

function getPropertyInitializer(
  node: ts.ObjectLiteralExpression,
  name: string,
): ts.Expression | null {
  const prop = getObjectProperty(node, name);
  return prop !== null && ts.isPropertyAssignment(prop) ? prop.initializer : null;
}

/** Analyzes calls to `provideRouter` and `RouterModule.forRoot` in a source file. */
export function analyzeRouterSetup(
  sf: ts.SourceFile,
  checker: ts.TypeChecker,
  result: RouterSetupInfo,
): void {
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      if (isImportOf(checker, node.expression, 'provideRouter', ROUTER_MODULE)) {
        const bindingFeature = node.arguments
          .slice(1)
          .find(
            (arg): arg is ts.CallExpression =>
              ts.isCallExpression(arg) &&
              isImportOf(checker, arg.expression, 'withComponentInputBinding', ROUTER_MODULE),
          );

        if (bindingFeature === undefined) {
          result.withoutBinding++;
        } else {
          result.withBinding++;
          if (!areQueryParamsBound(bindingFeature.arguments[0])) {
            result.queryParamsNotBound++;
          }
        }
      } else if (
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === 'forRoot' &&
        isImportOf(checker, node.expression.expression, 'RouterModule', ROUTER_MODULE)
      ) {
        const options = node.arguments[1];
        const bindOption =
          options !== undefined && ts.isObjectLiteralExpression(options)
            ? getPropertyInitializer(options, 'bindToComponentInputs')
            : null;

        if (bindOption === null || bindOption.kind === ts.SyntaxKind.FalseKeyword) {
          result.withoutBinding++;
        } else if (
          bindOption.kind === ts.SyntaxKind.TrueKeyword ||
          ts.isObjectLiteralExpression(bindOption)
        ) {
          result.withBinding++;
          if (!areQueryParamsBound(bindOption)) {
            result.queryParamsNotBound++;
          }
        } else {
          // The option can't be determined statically.
          result.withoutBinding++;
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sf, visit);
}

/** Whether the given component input binding options bind query parameters. */
function areQueryParamsBound(options: ts.Expression | undefined): boolean {
  if (options === undefined || options.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }
  if (!ts.isObjectLiteralExpression(options)) {
    return false;
  }
  if (getObjectProperty(options, 'queryParams') === null) {
    return true;
  }
  return getPropertyInitializer(options, 'queryParams')?.kind === ts.SyntaxKind.TrueKeyword;
}

/** Finds all route definitions in a file and records the components they render. */
export function analyzeRoutes(
  sf: ts.SourceFile,
  info: ProgramInfo,
  checker: ts.TypeChecker,
  result: Record<ComponentID, RouteInfo[]>,
): void {
  const visit = (node: ts.Node) => {
    if (ts.isObjectLiteralExpression(node) && isRouteDefinition(node, checker)) {
      const component = resolveRoutedComponent(node, checker);
      const id = component !== null ? getComponentId(component, info) : null;

      if (id !== null) {
        (result[id] ??= []).push({
          pathParams: Array.from(getAvailablePathParams(node)),
          dataKeys: getAvailableDataKeys(node),
        });
      }
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sf, visit);
}

/** Whether an object literal looks like a route definition that renders a component. */
function isRouteDefinition(node: ts.ObjectLiteralExpression, checker: ts.TypeChecker): boolean {
  if (
    getObjectProperty(node, 'component') === null &&
    getObjectProperty(node, 'loadComponent') === null
  ) {
    return false;
  }
  // Objects with a known type are only routes if they're typed as such. Otherwise, e.g.
  // for untyped route arrays, fall back to checking for a `path`.
  const contextualType = checker.getContextualType(node);
  const typeSymbol = contextualType?.aliasSymbol ?? contextualType?.getSymbol();
  if (typeSymbol !== undefined && !(typeSymbol.flags & ts.SymbolFlags.ObjectLiteral)) {
    return typeSymbol.getName() === 'Route';
  }
  return getObjectProperty(node, 'path') !== null;
}

/** Resolves the component class rendered by a route definition. */
function resolveRoutedComponent(
  node: ts.ObjectLiteralExpression,
  checker: ts.TypeChecker,
): ts.ClassDeclaration | null {
  const component = getPropertyInitializer(node, 'component');
  if (component !== null) {
    const target = ts.isPropertyAccessExpression(component) ? component.name : component;
    let symbol = checker.getSymbolAtLocation(target);
    if (symbol !== undefined && symbol.flags & ts.SymbolFlags.Alias) {
      symbol = checker.getAliasedSymbol(symbol);
    }
    return getClassDeclaration(symbol);
  }

  const loadComponent = getObjectProperty(node, 'loadComponent');
  if (loadComponent === null) {
    return null;
  }
  return (
    resolveLazyComponentFromImport(loadComponent, checker) ??
    resolveLazyComponentFromType(loadComponent, checker)
  );
}

/**
 * Resolves the component of the common `loadComponent` patterns
 * `() => import('./a')` and `() => import('./a').then(m => m.A)`.
 */
function resolveLazyComponentFromImport(
  loadComponent: ts.ObjectLiteralElementLike,
  checker: ts.TypeChecker,
): ts.ClassDeclaration | null {
  if (
    !ts.isPropertyAssignment(loadComponent) ||
    !ts.isArrowFunction(loadComponent.initializer) ||
    !ts.isExpression(loadComponent.initializer.body)
  ) {
    return null;
  }

  let body = loadComponent.initializer.body;
  let exportName = 'default';

  if (
    ts.isCallExpression(body) &&
    ts.isPropertyAccessExpression(body.expression) &&
    body.expression.name.text === 'then' &&
    body.arguments.length === 1
  ) {
    const callback = body.arguments[0];
    if (
      !ts.isArrowFunction(callback) ||
      callback.parameters.length !== 1 ||
      !ts.isIdentifier(callback.parameters[0].name) ||
      !ts.isPropertyAccessExpression(callback.body) ||
      !ts.isIdentifier(callback.body.expression) ||
      callback.body.expression.text !== callback.parameters[0].name.text
    ) {
      return null;
    }
    exportName = callback.body.name.text;
    body = body.expression.expression;
  }

  if (
    !ts.isCallExpression(body) ||
    body.expression.kind !== ts.SyntaxKind.ImportKeyword ||
    body.arguments.length !== 1
  ) {
    return null;
  }

  const moduleSymbol = checker.getSymbolAtLocation(body.arguments[0]);
  if (moduleSymbol === undefined) {
    return null;
  }
  let exportSymbol = checker
    .getExportsOfModule(moduleSymbol)
    .find((s) => s.getName() === exportName);
  if (exportSymbol !== undefined && exportSymbol.flags & ts.SymbolFlags.Alias) {
    exportSymbol = checker.getAliasedSymbol(exportSymbol);
  }
  return getClassDeclaration(exportSymbol);
}

/** Resolves the component of a `loadComponent` function based on its return type. */
function resolveLazyComponentFromType(
  loadComponent: ts.ObjectLiteralElementLike,
  checker: ts.TypeChecker,
): ts.ClassDeclaration | null {
  let signature: ts.Signature | undefined;

  if (ts.isMethodDeclaration(loadComponent)) {
    signature = checker.getSignatureFromDeclaration(loadComponent);
  } else if (ts.isPropertyAssignment(loadComponent)) {
    signature = checker.getTypeAtLocation(loadComponent.initializer).getCallSignatures()[0];
  }
  if (signature === undefined) {
    return null;
  }

  // `loadComponent` resolves to either the component class, or a module with a default export.
  const returnType = signature.getReturnType();
  let resolvedType = checker.getAwaitedType(returnType) ?? returnType;
  const defaultExport = resolvedType.getProperty('default');
  const resolvedSymbol = resolvedType.getSymbol();

  if (
    defaultExport !== undefined &&
    resolvedSymbol !== undefined &&
    resolvedSymbol.flags & ts.SymbolFlags.ValueModule
  ) {
    resolvedType = checker.getTypeOfSymbolAtLocation(defaultExport, loadComponent);
  }
  return getClassDeclaration(resolvedType.getSymbol());
}

function getClassDeclaration(symbol: ts.Symbol | undefined): ts.ClassDeclaration | null {
  return symbol?.declarations?.find(ts.isClassDeclaration) ?? null;
}

/** Gets the parent route definition, if the route is defined inline in its `children`. */
function getParentRoute(node: ts.ObjectLiteralExpression): ts.ObjectLiteralExpression | null {
  const array = node.parent;
  const property = array?.parent;
  const parentRoute = property?.parent;

  if (
    ts.isArrayLiteralExpression(array) &&
    property !== undefined &&
    ts.isPropertyAssignment(property) &&
    ts.isIdentifier(property.name) &&
    property.name.text === 'children' &&
    parentRoute !== undefined &&
    ts.isObjectLiteralExpression(parentRoute)
  ) {
    return parentRoute;
  }
  return null;
}

/**
 * Whether a route inherits params and data from its parent under the
 * default `emptyOnly` inheritance strategy. That is the case for routes
 * with an empty path, or when the parent route doesn't render a component.
 */
function inheritsFromParent(
  node: ts.ObjectLiteralExpression,
  parent: ts.ObjectLiteralExpression,
): boolean {
  const path = getPropertyInitializer(node, 'path');
  const hasEmptyPath = path !== null && ts.isStringLiteralLike(path) && path.text === '';
  const isParentComponentless =
    getObjectProperty(parent, 'component') === null &&
    getObjectProperty(parent, 'loadComponent') === null;
  return hasEmptyPath || isParentComponentless;
}

/** Gets the path params that are guaranteed to be available in a route. */
function getAvailablePathParams(node: ts.ObjectLiteralExpression): Set<string> {
  const params = new Set<string>();
  const path = getPropertyInitializer(node, 'path');

  if (path !== null && ts.isStringLiteralLike(path)) {
    for (const segment of path.text.split('/')) {
      if (segment.startsWith(':')) {
        params.add(segment.slice(1));
      }
    }
  }

  const parent = getParentRoute(node);
  if (parent !== null && inheritsFromParent(node, parent)) {
    getAvailablePathParams(parent).forEach((param) => params.add(param));
  }
  return params;
}

/**
 * Gets the keys of the route's static data and resolvers, including inherited ones.
 * Returns `null` if they can't be determined statically.
 */
function getAvailableDataKeys(node: ts.ObjectLiteralExpression): string[] | null {
  // Keys of route resources take precedence over everything else, and can't be determined.
  if (getObjectProperty(node, 'resources') !== null) {
    return null;
  }
  const keys: string[] = [];

  for (const name of ['data', 'resolve']) {
    if (getObjectProperty(node, name) === null) {
      continue;
    }
    const value = getPropertyInitializer(node, name);
    if (value === null || !ts.isObjectLiteralExpression(value)) {
      return null;
    }
    for (const prop of value.properties) {
      if (
        prop.name === undefined ||
        !(
          ts.isIdentifier(prop.name) ||
          ts.isStringLiteralLike(prop.name) ||
          ts.isNumericLiteral(prop.name)
        )
      ) {
        return null;
      }
      keys.push(prop.name.text);
    }
  }

  const parent = getParentRoute(node);
  if (parent !== null && inheritsFromParent(node, parent)) {
    const parentKeys = getAvailableDataKeys(parent);
    if (parentKeys === null) {
      return null;
    }
    keys.push(...parentKeys);
  }
  return keys;
}

/**
 * Finds components that may be used outside of a route, where route inputs aren't bound:
 * components referenced in the `imports` of other components, and classes that are extended.
 */
export function analyzeExcludedComponents(
  sf: ts.SourceFile,
  info: ProgramInfo,
  checker: ts.TypeChecker,
  result: Record<ComponentID, true>,
): void {
  const exclude = (expression: ts.Expression) => {
    let symbol = checker.getSymbolAtLocation(expression);
    if (symbol !== undefined && symbol.flags & ts.SymbolFlags.Alias) {
      symbol = checker.getAliasedSymbol(symbol);
    }
    const excludedClass = getClassDeclaration(symbol);
    const id = excludedClass !== null ? getComponentId(excludedClass, info) : null;
    if (id !== null) {
      result[id] = true;
    }
  };

  const visit = (node: ts.Node) => {
    if (ts.isClassLike(node)) {
      const extendsClause = node.heritageClauses?.find(
        (c) => c.token === ts.SyntaxKind.ExtendsKeyword,
      );
      extendsClause?.types.forEach((type) => exclude(type.expression));
    }
    if (ts.isClassDeclaration(node)) {
      for (const decorator of getAngularDecorators(checker, ts.getDecorators(node) ?? [])) {
        if (decorator.name !== 'Component' && decorator.name !== 'Directive') {
          continue;
        }
        const metadata = decorator.node.expression.arguments[0];
        const imports =
          metadata !== undefined && ts.isObjectLiteralExpression(metadata)
            ? getPropertyInitializer(metadata, 'imports')
            : null;

        if (imports === null || !ts.isArrayLiteralExpression(imports)) {
          continue;
        }
        imports.elements.forEach(exclude);
      }
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sf, visit);
}

/** Analyzes how a component class uses its injected `ActivatedRoute`. */
export function analyzeComponentClass(
  node: ts.ClassDeclaration,
  checker: ts.TypeChecker,
): ComponentAnalysis | null {
  const members = findActivatedRouteMembers(node, checker);
  if (members.length === 0) {
    return null;
  }

  const membersByName = new Map(members.map((m) => [m.node.name.getText(), m]));
  const constructionMembers = getMembersUsedDuringConstruction(node);

  const visit = (child: ts.Node) => {
    if (
      ts.isPropertyAccessExpression(child) &&
      child.expression.kind === ts.SyntaxKind.ThisKeyword &&
      membersByName.has(child.name.text) &&
      refersToClassInstance(child, node)
    ) {
      const member = membersByName.get(child.name.text)!;
      const read = getRouteRead(child);

      if (read !== null && isReadTimingSafe(read.node, node, constructionMembers)) {
        member.reads.push(read);
      } else {
        member.hasOtherUsages = true;
      }
    }
    ts.forEachChild(child, visit);
  };
  ts.forEachChild(node, visit);

  // Parameter properties can also be referenced by their name inside the constructor.
  for (const member of members) {
    if (ts.isParameter(member.node) && hasBareParameterReference(member.node, checker)) {
      member.hasOtherUsages = true;
    }
  }

  const inputNames = getInputNames(node, members, checker);

  // Reads for which no input can be generated are left as is.
  for (const member of members) {
    const convertibleReads = member.reads.filter((r) =>
      inputNames.has(getReadKey(r.source, r.key)),
    );
    if (convertibleReads.length !== member.reads.length) {
      member.hasOtherUsages = true;
      member.reads = convertibleReads;
    }
  }

  return {members, inputNames};
}

/** Finds constructor parameter properties and fields that hold an `ActivatedRoute`. */
function findActivatedRouteMembers(
  node: ts.ClassDeclaration,
  checker: ts.TypeChecker,
): ActivatedRouteMember[] {
  const members: ActivatedRouteMember[] = [];
  const isActivatedRouteType = (type: ts.TypeNode | undefined) =>
    type !== undefined &&
    ts.isTypeReferenceNode(type) &&
    isImportOf(checker, type.typeName, 'ActivatedRoute', ROUTER_MODULE);

  for (const member of node.members) {
    if (ts.isConstructorDeclaration(member)) {
      for (const param of member.parameters) {
        if (
          ts.isParameterPropertyDeclaration(param, member) &&
          ts.isIdentifier(param.name) &&
          isActivatedRouteType(param.type)
        ) {
          members.push({
            node: param,
            isPrivate: hasModifier(param, ts.SyntaxKind.PrivateKeyword),
            usesInjectFunction: false,
            reads: [],
            hasOtherUsages: false,
          });
        }
      }
    } else if (
      ts.isPropertyDeclaration(member) &&
      !hasModifier(member, ts.SyntaxKind.StaticKeyword) &&
      (ts.isIdentifier(member.name) || ts.isPrivateIdentifier(member.name)) &&
      member.initializer !== undefined &&
      ts.isCallExpression(member.initializer) &&
      isImportOf(checker, member.initializer.expression, 'inject', CORE_MODULE) &&
      member.initializer.arguments.length === 1 &&
      isImportOf(checker, member.initializer.arguments[0], 'ActivatedRoute', ROUTER_MODULE)
    ) {
      members.push({
        node: member,
        isPrivate:
          ts.isPrivateIdentifier(member.name) || hasModifier(member, ts.SyntaxKind.PrivateKeyword),
        usesInjectFunction: true,
        reads: [],
        hasOtherUsages: false,
      });
    }
  }
  return members;
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return (
    ts.canHaveModifiers(node) && (ts.getModifiers(node)?.some((m) => m.kind === kind) ?? false)
  );
}

/** Whether `this` in the given expression refers to an instance of the class. */
function refersToClassInstance(node: ts.Node, classDecl: ts.ClassDeclaration): boolean {
  let current = node.parent;
  while (current !== undefined && current !== classDecl) {
    if (
      ts.isFunctionExpression(current) ||
      ts.isFunctionDeclaration(current) ||
      ts.isClassLike(current) ||
      ((ts.isMethodDeclaration(current) || ts.isAccessor(current)) && current.parent !== classDecl)
    ) {
      return false;
    }
    current = current.parent;
  }
  return current === classDecl;
}

/**
 * Whether the read happens after inputs are set. Routed component inputs are set
 * right after the component is created, so they aren't available in the constructor,
 * in field initializers, or in methods that are called from those.
 */
function isReadTimingSafe(
  node: ts.Node,
  classDecl: ts.ClassDeclaration,
  constructionMembers: Set<ts.ClassElement>,
): boolean {
  let member: ts.Node = node;
  while (member.parent !== classDecl) {
    member = member.parent;
  }
  return (
    (ts.isMethodDeclaration(member) || ts.isAccessor(member)) &&
    !hasModifier(member, ts.SyntaxKind.StaticKeyword) &&
    !constructionMembers.has(member)
  );
}

/**
 * Gets the methods and accessors that may run while the class is constructed, i.e.
 * that are referenced from the constructor or field initializers, directly or transitively.
 */
function getMembersUsedDuringConstruction(node: ts.ClassDeclaration): Set<ts.ClassElement> {
  const callableMembers = new Map<string, ts.ClassElement[]>();
  const pending: ts.Node[] = [];
  const result = new Set<ts.ClassElement>();

  for (const member of node.members) {
    if (hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
      continue;
    }
    if (ts.isConstructorDeclaration(member) && member.body !== undefined) {
      pending.push(member.body);
    } else if (ts.isPropertyDeclaration(member) && member.initializer !== undefined) {
      pending.push(member.initializer);
    } else if (
      (ts.isMethodDeclaration(member) || ts.isAccessor(member)) &&
      (ts.isIdentifier(member.name) || ts.isPrivateIdentifier(member.name))
    ) {
      const name = member.name.text;
      callableMembers.set(name, [...(callableMembers.get(name) ?? []), member]);
    }
  }

  const visit = (child: ts.Node) => {
    if (
      ts.isPropertyAccessExpression(child) &&
      child.expression.kind === ts.SyntaxKind.ThisKeyword
    ) {
      for (const member of callableMembers.get(child.name.text) ?? []) {
        if (!result.has(member)) {
          result.add(member);
          pending.push(member);
        }
      }
    }
    ts.forEachChild(child, visit);
  };

  while (pending.length > 0) {
    visit(pending.pop()!);
  }
  return result;
}

/** Matches `this.<member>.snapshot` reads of path and query parameters. */
function getRouteRead(memberAccess: ts.PropertyAccessExpression): RouteRead | null {
  const snapshot = memberAccess.parent;
  if (!isPlainPropertyAccess(snapshot, memberAccess) || snapshot.name.text !== 'snapshot') {
    return null;
  }

  const state = snapshot.parent;
  if (!isPlainPropertyAccess(state, snapshot)) {
    return null;
  }

  switch (state.name.text) {
    case 'paramMap':
    case 'queryParamMap': {
      const getAccess = state.parent;
      const call = getAccess.parent;
      if (
        !isPlainPropertyAccess(getAccess, state) ||
        getAccess.name.text !== 'get' ||
        !ts.isCallExpression(call) ||
        call.expression !== getAccess ||
        call.questionDotToken !== undefined ||
        call.arguments.length !== 1 ||
        !ts.isStringLiteralLike(call.arguments[0])
      ) {
        return null;
      }
      return {
        node: call,
        source: state.name.text === 'paramMap' ? 'params' : 'queryParams',
        key: call.arguments[0].text,
        isMapGet: true,
      };
    }
    case 'params':
    case 'queryParams': {
      const access = state.parent;
      let key: string;

      if (isPlainPropertyAccess(access, state) && ts.isIdentifier(access.name)) {
        key = access.name.text;
      } else if (
        ts.isElementAccessExpression(access) &&
        access.expression === state &&
        access.questionDotToken === undefined &&
        ts.isStringLiteralLike(access.argumentExpression)
      ) {
        key = access.argumentExpression.text;
      } else {
        return null;
      }

      if (isWriteOrCall(access)) {
        return null;
      }
      return {node: access, source: state.name.text, key, isMapGet: false};
    }
  }
  return null;
}

function isPlainPropertyAccess(
  node: ts.Node,
  expression: ts.Expression,
): node is ts.PropertyAccessExpression {
  return (
    ts.isPropertyAccessExpression(node) &&
    node.expression === expression &&
    node.questionDotToken === undefined
  );
}

/** Whether the expression is written to, deleted or called. */
function isWriteOrCall(node: ts.Expression): boolean {
  const parent = node.parent;
  return (
    (ts.isBinaryExpression(parent) &&
      parent.left === node &&
      parent.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
      parent.operatorToken.kind <= ts.SyntaxKind.LastAssignment) ||
    ((ts.isPrefixUnaryExpression(parent) || ts.isPostfixUnaryExpression(parent)) &&
      (parent.operator === ts.SyntaxKind.PlusPlusToken ||
        parent.operator === ts.SyntaxKind.MinusMinusToken)) ||
    ts.isDeleteExpression(parent) ||
    (ts.isCallExpression(parent) && parent.expression === node)
  );
}

/** Whether a parameter property is referenced by its bare name in the constructor. */
function hasBareParameterReference(
  param: ts.ParameterDeclaration,
  checker: ts.TypeChecker,
): boolean {
  const body = (param.parent as ts.ConstructorDeclaration).body;
  const paramSymbol = checker.getSymbolAtLocation(param.name);
  let found = false;

  const visit = (node: ts.Node) => {
    if (
      !found &&
      ts.isIdentifier(node) &&
      node.text === (param.name as ts.Identifier).text &&
      checker.getSymbolAtLocation(node) === paramSymbol
    ) {
      found = true;
    }
    if (!found) {
      ts.forEachChild(node, visit);
    }
  };
  if (body !== undefined) {
    visit(body);
  }
  return found;
}

/**
 * Determines the names of the inputs that would be generated for the reads
 * of a class. Reads for which no conflict-free input can be generated are omitted.
 */
function getInputNames(
  node: ts.ClassDeclaration,
  members: ActivatedRouteMember[],
  checker: ts.TypeChecker,
): Map<RouteReadKey, string> {
  const classSymbol = node.name !== undefined ? checker.getSymbolAtLocation(node.name) : undefined;
  const instanceType =
    classSymbol !== undefined ? checker.getDeclaredTypeOfSymbol(classSymbol) : null;
  const existingBindingNames = getExistingInputBindingNames(node, checker);

  const readKeys = new Set(members.flatMap((m) => m.reads.map((r) => getReadKey(r.source, r.key))));
  const candidates = new Map<RouteReadKey, string>();
  const nameUsages = new Map<string, number>();

  for (const readKey of readKeys) {
    const name = getInputName(parseReadKey(readKey).key);
    if (name !== null) {
      candidates.set(readKey, name);
      nameUsages.set(name, (nameUsages.get(name) ?? 0) + 1);
    }
  }

  const result = new Map<RouteReadKey, string>();
  for (const [readKey, name] of candidates) {
    const {key} = parseReadKey(readKey);
    if (
      nameUsages.get(name)! === 1 &&
      !existingBindingNames.has(key) &&
      instanceType?.getProperty(name) === undefined
    ) {
      result.set(readKey, name);
    }
  }
  return result;
}

/** Gets a valid class member name for a route state key, e.g. `user-id` becomes `userId`. */
function getInputName(key: string): string | null {
  const name = key.replace(/[^a-zA-Z0-9_$]+(.)?/g, (_, char: string | undefined) =>
    char !== undefined ? char.toUpperCase() : '',
  );
  // Class members can be named after reserved words, so only the characters need to be checked.
  return /^[a-zA-Z_$][\w$]*$/.test(name) ? name : null;
}

/** Gets the public names of all inputs that are declared in the class. */
function getExistingInputBindingNames(
  node: ts.ClassDeclaration,
  checker: ts.TypeChecker,
): Set<string> {
  const names = new Set<string>();
  const getAlias = (options: ts.Expression | undefined) => {
    if (options !== undefined && ts.isObjectLiteralExpression(options)) {
      const alias = getPropertyInitializer(options, 'alias');
      if (alias !== null && ts.isStringLiteralLike(alias)) {
        return alias.text;
      }
    }
    return null;
  };

  for (const decorator of getAngularDecorators(checker, ts.getDecorators(node) ?? [])) {
    const metadata = decorator.node.expression.arguments[0];
    const inputs =
      metadata !== undefined && ts.isObjectLiteralExpression(metadata)
        ? getPropertyInitializer(metadata, 'inputs')
        : null;
    if (inputs !== null && ts.isArrayLiteralExpression(inputs)) {
      for (const element of inputs.elements) {
        if (ts.isStringLiteralLike(element)) {
          names.add(element.text.split(':').pop()!.trim());
        } else if (ts.isObjectLiteralExpression(element)) {
          const name = getPropertyInitializer(element, 'name');
          const alias = getAlias(element);
          if (alias !== null) {
            names.add(alias);
          } else if (name !== null && ts.isStringLiteralLike(name)) {
            names.add(name.text);
          }
        }
      }
    }
  }

  for (const member of node.members) {
    if (
      member.name === undefined ||
      !(ts.isIdentifier(member.name) || ts.isStringLiteralLike(member.name))
    ) {
      continue;
    }
    const memberName = member.name.text;

    const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;
    const inputDecorator = getAngularDecorators(checker, decorators ?? []).find(
      (d) => d.name === 'Input',
    );
    if (inputDecorator !== undefined) {
      const arg = inputDecorator.node.expression.arguments[0];
      names.add(
        arg !== undefined && ts.isStringLiteralLike(arg) ? arg.text : (getAlias(arg) ?? memberName),
      );
      continue;
    }

    if (
      ts.isPropertyDeclaration(member) &&
      member.initializer !== undefined &&
      ts.isCallExpression(member.initializer)
    ) {
      const callee = member.initializer.expression;
      const fn =
        ts.isPropertyAccessExpression(callee) && callee.name.text === 'required'
          ? callee.expression
          : callee;
      if (
        isImportOf(checker, fn, 'input', CORE_MODULE) ||
        isImportOf(checker, fn, 'model', CORE_MODULE)
      ) {
        const args = member.initializer.arguments;
        names.add(getAlias(args[args.length - 1]) ?? memberName);
      }
    }
  }
  return names;
}
