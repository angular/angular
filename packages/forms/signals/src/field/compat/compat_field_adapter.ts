/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbstractControl} from '@angular/forms';
import {ChildFieldNodeOptions, FieldNodeOptions, FieldNodeStructure} from '../structure';
import {computed, Signal, WritableSignal} from '@angular/core';
import {CompatFieldNode} from './compat_field_node';
import {FieldNode} from '../node';
import {CompatValidationState} from './compat_validation_state';
import {ValidationState} from '../validation';
import {CompatChildFieldNodeOptions, CompatStructure} from './compat_structure';
import {CompatNodeState} from './compat_node_state';
import {FieldNodeState} from '../state';
import {FieldAdapter, BasicFieldAdapter} from '../field_adapter';
import {FieldPathNode} from '../../schema/path_node';
import {FormFieldManager} from '../manager';

export function isAbstractControl(value: unknown): value is AbstractControl {
  return value instanceof AbstractControl;
}

/**
 * This is a tree-shakable Field adapter that proxies FormControl state to a field.
 */
export class CompatFieldAdapter implements FieldAdapter {
  readonly basicAdapter = new BasicFieldAdapter();

  newRoot<TValue>(
    fieldManager: FormFieldManager,
    value: WritableSignal<TValue>,
    pathNode: FieldPathNode,
    adapter: FieldAdapter,
  ): FieldNode {
    if (isAbstractControl(value())) {
      return createCompatNode({
        kind: 'root',
        fieldManager,
        value,
        pathNode,
        logic: pathNode.logic.build(),
        fieldAdapter: adapter,
      });
    }

    return this.basicAdapter.newRoot<TValue>(fieldManager, value, pathNode, adapter);
  }

  createNodeState(node: CompatFieldNode, options: CompatChildFieldNodeOptions): FieldNodeState {
    if (!options.control) {
      return this.basicAdapter.createNodeState(node);
    }
    return new CompatNodeState(node, options);
  }

  createStructure(node: CompatFieldNode, options: CompatChildFieldNodeOptions): FieldNodeStructure {
    if (!options.control) {
      return this.basicAdapter.createStructure(node, options);
    }
    return new CompatStructure(node, options);
  }

  createValidationState(
    node: CompatFieldNode,
    options: CompatChildFieldNodeOptions,
  ): ValidationState {
    if (!options.control) {
      return this.basicAdapter.createValidationState(node);
    }
    return new CompatValidationState(options);
  }

  newChild(options: ChildFieldNodeOptions): FieldNode {
    const value = options.parent.value()[options.initialKeyInParent];

    if (isAbstractControl(value)) {
      return createCompatNode(options);
    }

    return new FieldNode(options);
  }
}

export function createCompatNode(options: FieldNodeOptions) {
  const control = (
    options.kind === 'root'
      ? options.value
      : computed(() => {
          return options.parent.value()[options.initialKeyInParent];
        })
  ) as Signal<AbstractControl>;

  return new CompatFieldNode({
    ...options,
    control,
  });
}
