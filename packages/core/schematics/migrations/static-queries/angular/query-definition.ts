/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {NgDecorator} from './decorators';


/** Timing of a given query. Either static or dynamic. */
export enum QueryTiming {
  STATIC,
  DYNAMIC
}

/** Type of a given query. */
export enum QueryType {
  ViewChild,
  ContentChild
}

export interface NgQueryDefinition {
  /** Type of the query definition. */
  type: QueryType;

  /** Property that declares the query. */
  property: ts.PropertyDeclaration;

  /** Decorator that declares this as a query. */
  decorator: NgDecorator;

  /** Class declaration that holds this query. */
  container: ts.ClassDeclaration;
}
