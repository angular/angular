/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {hasPropertyNameText} from '../typescript/property_name';
import {DeclarationUsageVisitor} from './declaration_usage_visitor';
import {ClassMetadataMap} from './ng_query_visitor';
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
    query: NgQueryDefinition, classMetadata: ClassMetadataMap,
    typeChecker: ts.TypeChecker): QueryTiming {
  return isQueryUsedStatically(query.container, query, classMetadata, typeChecker, []) ?
      QueryTiming.STATIC :
      QueryTiming.DYNAMIC;
}

/** Checks whether a given class or it's derived classes use the specified query statically. */
function isQueryUsedStatically(
    classDecl: ts.ClassDeclaration, query: NgQueryDefinition, classMetadataMap: ClassMetadataMap,
    typeChecker: ts.TypeChecker, knownInputNames: string[]): boolean {
  const usageVisitor = new DeclarationUsageVisitor(query.property, typeChecker);
  const classMetadata = classMetadataMap.get(classDecl);

  // In case there is metadata for the current class, we collect all resolved Angular input
  // names and add them to the list of known inputs that need to be checked for usages of
  // the current query. e.g. queries used in an @Input() *setter* are always static.
  if (classMetadata) {
    knownInputNames.push(...classMetadata.ngInputNames);
  }

  // List of TypeScript nodes which can contain usages of the given query in order to
  // access it statically. e.g.
  //  (1) queries used in the "ngOnInit" lifecycle hook are static.
  //  (2) inputs with setters can access queries statically.
  const possibleStaticQueryNodes: ts.Node[] = classDecl.members.filter(m => {
    if (ts.isMethodDeclaration(m) && hasPropertyNameText(m.name) &&
        STATIC_QUERY_LIFECYCLE_HOOKS[query.type].indexOf(m.name.text) !== -1) {
      return true;
    } else if (
        knownInputNames && ts.isSetAccessor(m) && hasPropertyNameText(m.name) &&
        knownInputNames.indexOf(m.name.text) !== -1) {
      return true;
    }
    return false;
  });

  // In case nodes that can possibly access a query statically have been found, check
  // if the query declaration is used within any of these nodes.
  if (possibleStaticQueryNodes.length &&
      possibleStaticQueryNodes.some(hookNode => usageVisitor.isUsedInNode(hookNode))) {
    return true;
  }

  // In case there are classes that derive from the current class, visit each
  // derived class as inherited queries could be used statically.
  if (classMetadata) {
    return classMetadata.derivedClasses.some(
        derivedClass => isQueryUsedStatically(
            derivedClass, query, classMetadataMap, typeChecker, knownInputNames));
  }

  return false;
}
