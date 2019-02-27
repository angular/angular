/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {DeclarationUsageVisitor} from './declaration_usage_visitor';
import {DerivedClassesMap} from './ng_query_visitor';
import {NgQueryDefinition, QueryTiming, QueryType} from './query-definition';

/**
 * Object that maps a given type of query to a list of lifecycle hooks that
 * could be used to access such a query statically.
 */
const STATIC_QUERY_LIFECYCLE_HOOKS = {
  [QueryType.ViewChild]: ['ngOnInit', 'ngAfterContentInit', 'ngAfterContentChecked'],
  [QueryType.ContentChild]: ['ngOnInit'],
};

/**
 * Analyzes the usage of the given query and determines the query timing based
 * on the current usage of the query.
 */
export function analyzeNgQueryUsage(
    query: NgQueryDefinition, derivedClassesMap: DerivedClassesMap,
    typeChecker: ts.TypeChecker): QueryTiming {
  const classDecl = query.container;

  // List of classes that derive from the query container and need to be analyzed as well.
  // e.g. a ViewQuery could be used statically in a derived class.
  const derivedClasses = derivedClassesMap.get(classDecl);
  let isStatic = isQueryUsedStatically(classDecl, query, typeChecker);

  // We don't need to check the derived classes if the container class already
  // uses the query statically. This improves performances for a large chain of
  // derived classes.
  if (derivedClasses && !isStatic) {
    isStatic = derivedClasses.some(
        derivedClass => isQueryUsedStatically(derivedClass, query, typeChecker));
  }

  return isStatic ? QueryTiming.STATIC : QueryTiming.DYNAMIC;
}

/** Checks whether the given class uses the specified query statically. */
function isQueryUsedStatically(
    classDecl: ts.ClassDeclaration, query: NgQueryDefinition,
    typeChecker: ts.TypeChecker): boolean {
  const staticQueryHooks = classDecl.members.filter(
      m => ts.isMethodDeclaration(m) &&
          (ts.isStringLiteralLike(m.name) || ts.isIdentifier(m.name)) &&
          STATIC_QUERY_LIFECYCLE_HOOKS[query.type].indexOf(m.name.text) !== -1);

  // In case there are no lifecycle hooks defined which could access a query
  // statically, we can consider the query as dynamic as nothing in the class declaration
  // could reasonably access the query in a static way.
  if (!staticQueryHooks.length) {
    return false;
  }

  const usageVisitor = new DeclarationUsageVisitor(query.property, typeChecker);

  // Visit each defined lifecycle hook and check whether the query property is used
  // inside the method declaration.
  return staticQueryHooks.some(hookDeclNode => usageVisitor.isUsedInNode(hookDeclNode));
}
