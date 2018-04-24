/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../output/output_ast';
import {ParseSourceSpan} from '../../parse_util';
import * as t from '../r3_ast';
import {R3DependencyMetadata} from '../r3_factory';


export interface R3DirectiveMetadata {
  name: string;
  type: o.Expression;
  typeSourceSpan: ParseSourceSpan;
  deps: R3DependencyMetadata[];
  selector: string|null;
  queries: R3QueryMetadata[];
  host: {
    attributes: {[key: string]: string}; listeners: {[key: string]: string};
    properties: {[key: string]: string};
  };
  inputs: {[prop: string]: string};
  outputs: {[prop: string]: string};
}

export interface R3ComponentMetadata extends R3DirectiveMetadata {
  template: {nodes: t.Node[]; hasNgContent: boolean; ngContentSelectors: string[];};
  lifecycle: {onChanges: boolean;};
  viewQueries: R3QueryMetadata[];
  pipes: Map<string, o.Expression>;
  directives: Map<string, o.Expression>;
}

export interface R3QueryMetadata {
  propertyName: string;
  first: boolean;
  selectors: o.Expression|string[];
  descendants: boolean;
  read: o.Expression|null;
}

export interface R3DirectiveDef {
  expression: o.Expression;
  type: o.Type;
}

export interface R3ComponentDef {
  expression: o.Expression;
  type: o.Type;
}
