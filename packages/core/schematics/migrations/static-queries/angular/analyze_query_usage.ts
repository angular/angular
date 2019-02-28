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
  return isQueryUsedStatically(query.container, query, derivedClassesMap, typeChecker) ?
      QueryTiming.STATIC :
      QueryTiming.DYNAMIC;
}

/** Checks whether a given class or it's derived classes use the specified query statically. */
function isQueryUsedStatically(
    classDecl: ts.ClassDeclaration, query: NgQueryDefinition, derivedClassesMap: DerivedClassesMap,
    typeChecker: ts.TypeChecker): boolean {
  const usageVisitor = new DeclarationUsageVisitor(query.property, typeChecker);
  const staticQueryHooks = classDecl.members.filter(
      m => ts.isMethodDeclaration(m) &&
          (ts.isStringLiteralLike(m.name) || ts.isIdentifier(m.name)) &&
          STATIC_QUERY_LIFECYCLE_HOOKS[query.type].indexOf(m.name.text) !== -1);

  // In case there lifecycle hooks defined which could access this type of query
  // statically, we look if the query declaration is statically accessed within
  // one of the lifecycle hook declarations.
  if (staticQueryHooks.length &&
      staticQueryHooks.some(hookNode => usageVisitor.isUsedInNode(hookNode))) {
    return true;
  }

  // List of classes that derive from the query container and need to be analyzed as well.
  // e.g. a ViewQuery could be used statically in a derived class.
  const derivedClasses = derivedClassesMap.get(classDecl);

  if (!derivedClasses) {
    return false;
  }

  return derivedClasses.some(
      derivedClass => isQueryUsedStatically(derivedClass, query, derivedClassesMap, typeChecker));
}
