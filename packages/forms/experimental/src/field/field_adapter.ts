/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldPathNode} from '../schema/path_node';

import {FormFieldManager} from './manager';
import {FieldNode} from './node';
import {FieldNodeState} from './state';
import {ChildFieldNodeOptions, FieldNodeOptions, FieldNodeStructure} from './structure';
import {ValidationState, FieldValidationState} from './validation';
import {WritableSignal} from '@angular/core';

export interface FieldAdapter {
  createStructure(node: FieldNode, options: FieldNodeOptions): FieldNodeStructure;

  createValidationState(param: FieldNode, options: FieldNodeOptions): ValidationState;

  createNodeState(param: FieldNode, options: FieldNodeOptions): FieldNodeState;

  createChildNode(options: ChildFieldNodeOptions): FieldNode;

  newRoot<TValue>(
    fieldManager: FormFieldManager,
    model: WritableSignal<TValue>,
    pathNode: FieldPathNode,
    adapter: FieldAdapter,
  ): FieldNode;
}

export class BasicFieldAdapter implements FieldAdapter {
  newRoot<TValue>(
    fieldManager: FormFieldManager,
    value: WritableSignal<TValue>,
    pathNode: FieldPathNode,
    adapter: FieldAdapter,
  ): FieldNode {
    return new FieldNode({
      kind: 'root',
      fieldManager,
      value,
      pathNode,
      logic: pathNode.logic.build(),
      fieldAdapter: adapter,
    });
  }

  createChildNode(options: ChildFieldNodeOptions): FieldNode {
    return new FieldNode(options);
  }

  createNodeState(node: FieldNode): FieldNodeState {
    return new FieldNodeState(node);
  }

  createValidationState(node: FieldNode): ValidationState {
    return new FieldValidationState(node);
  }

  createStructure(node: FieldNode, options: FieldNodeOptions): FieldNodeStructure {
    return node.createStructure(options);
  }
}
