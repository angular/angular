/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal, WritableSignal} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {BasicFieldAdapter, FieldAdapter} from '../../src/field/field_adapter';
import {FormFieldManager} from '../../src/field/manager';
import {FieldNode} from '../../src/field/node';
import {FieldNodeState} from '../../src/field/state';
import {
  ChildFieldNodeOptions,
  FieldNodeOptions,
  FieldNodeStructure,
} from '../../src/field/structure';
import {ValidationState} from '../../src/field/validation';
import {FieldPathNode} from '../../src/schema/path_node';
import {CompatFieldNode} from './compat_field_node';
import {CompatNodeState} from './compat_node_state';
import {CompatChildFieldNodeOptions, CompatStructure} from './compat_structure';
import {CompatValidationState} from './compat_validation_state';

/**
 * This is a tree-shakable Field adapter that can create a compat node
 * that proxies FormControl state and value to a field.
 */
export class CompatFieldAdapter implements FieldAdapter {
  readonly basicAdapter = new BasicFieldAdapter();

  /**
   * Creates a regular or compat root node state based on whether the control is present.
   * @param fieldManager
   * @param value
   * @param pathNode
   * @param adapter
   */
  newRoot<TModel>(
    fieldManager: FormFieldManager,
    value: WritableSignal<TModel>,
    pathNode: FieldPathNode,
    adapter: FieldAdapter,
  ): FieldNode {
    if (value() instanceof AbstractControl) {
      return createCompatNode({
        kind: 'root',
        fieldManager,
        value,
        pathNode,
        logic: pathNode.builder.build(),
        fieldAdapter: adapter,
      });
    }

    return this.basicAdapter.newRoot<TModel>(fieldManager, value, pathNode, adapter);
  }

  /**
   * Creates a regular or compat node state based on whether the control is present.
   * @param node
   * @param options
   */
  createNodeState(node: CompatFieldNode, options: CompatChildFieldNodeOptions): FieldNodeState {
    if (!options.control) {
      return this.basicAdapter.createNodeState(node);
    }
    return new CompatNodeState(node, options);
  }

  /**
   * Creates a regular or compat structure based on whether the control is present.
   * @param node
   * @param options
   */
  createStructure(node: CompatFieldNode, options: CompatChildFieldNodeOptions): FieldNodeStructure {
    if (!options.control) {
      return this.basicAdapter.createStructure(node, options);
    }
    return new CompatStructure(node, options);
  }

  /**
   * Creates a regular or compat validation state based on whether the control is present.
   * @param node
   * @param options
   */
  createValidationState(
    node: CompatFieldNode,
    options: CompatChildFieldNodeOptions,
  ): ValidationState {
    if (!options.control) {
      return this.basicAdapter.createValidationState(node);
    }
    return new CompatValidationState(options);
  }

  /**
   * Creates a regular or compat node based on whether the control is present.
   * @param options
   */
  newChild(options: ChildFieldNodeOptions): FieldNode {
    const value = options.parent.value()[options.initialKeyInParent];

    if (value instanceof AbstractControl) {
      return createCompatNode(options);
    }

    return new FieldNode(options);
  }
}

/**
 * Creates a CompatFieldNode from options.
 * @param options
 */
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
