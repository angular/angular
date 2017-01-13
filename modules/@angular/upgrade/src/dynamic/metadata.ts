/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectiveResolver} from '@angular/compiler';
import {Directive, Type} from '@angular/core';

import {PropertyBinding} from '../common/component_info';


const COMPONENT_SELECTOR = /^[\w|-]*$/;
const SKEWER_CASE = /-(\w)/g;
const directiveResolver = new DirectiveResolver();

export interface ComponentInfo {
  type: Type<any>;
  selector: string;
  inputs?: PropertyBinding[];
  outputs?: PropertyBinding[];
}

export function getComponentInfo(type: Type<any>): ComponentInfo {
  const resolvedMetadata: Directive = directiveResolver.resolve(type);
  const selector = resolvedMetadata.selector;

  return {
    type,
    selector,
    inputs: parseFields(resolvedMetadata.inputs),
    outputs: parseFields(resolvedMetadata.outputs)
  };
}

export function parseFields(bindings: string[]): PropertyBinding[] {
  return (bindings || []).map(binding => new PropertyBinding(binding));
}
