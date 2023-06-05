/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PropertyAliases, PropertyAliasValue, TNode, TNodeType} from '../interfaces/node';

export enum TargetType {
  Input,
  DomBinding,
  Container,
}

export interface InputTarget {
  kind: TargetType.Input;
  data: PropertyAliasValue;
}

export interface DomBindingTarget {
  kind: TargetType.DomBinding;
}

export interface ContainerTarget {
  kind: TargetType.Container;
}

export function analyzePropertyForElement(tNode: TNode, propName: string): InputTarget|
    DomBindingTarget|ContainerTarget|null {
  const inputs = tNode.inputs;
  let inputData: PropertyAliasValue|null = null;
  if (inputs !== null && (inputData = inputs[propName]) !== undefined) {
    return {kind: TargetType.Input, data: inputData};
  }
  if (tNode.type & TNodeType.AnyRNode) {
    return {kind: TargetType.DomBinding};
  }
  if (tNode.type & TNodeType.AnyContainer) {
    return {kind: TargetType.DomBinding};
  }

  return null;
}
