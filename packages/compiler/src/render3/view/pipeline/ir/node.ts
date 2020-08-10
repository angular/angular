/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';

import {ExpressionVisitor} from './expression';
import {LinkedList, LinkedListNode, Transform} from './linked_list';

/**
 * In the IR, some `CreateNode`s are assigned a unique identifier, which is only relevant to
 * internal processing of the IR and is never reflected in generated code.
 *
 * `UpdateNode`s can refer to specific `CreateNode`s via this identifier, without needing to keep
 * either a reference to the `CreateNode` or to have knowledge of its `DataSlot` (the runtime data
 * structure index which _is_ reflected in generated code). Using `Id`, this kind of relationship
 * between creation and update nodes can be defined before `DataSlot`s are assigned (which allows
 * for optimizations to take place beforehand). It can also persist even if the nodes themselves are
 * transformed or replaced. For example, an `ElementStart` node can be replaced with a self-closing
 * equivalent that keeps the same `Id`, preserving its relationship with any `UpdateNode`s that
 * affect it.
 */
export type Id = number&{__brand: 'IrId'};

const CREATE_BRAND = Symbol('CreateNode');

/**
 * A node in a template creation block list.
 */
export abstract class CreateNode implements LinkedListNode<CreateNode> {
  /**
   * Required because `CreateNode` and `UpdateNode` are otherwise type-compatible.
   */
  private readonly[CREATE_BRAND] = true;

  prev: CreateNode|null = null;
  next: CreateNode|null = null;

  /**
   * Apply an `ExpressionVisitor` to any `o.Expression` ASTs directly within this creation node.
   */
  visitExpressions(visitor: ExpressionVisitor, ctx?: any): void {
    // Most `CreateNode`s do not contain expressions, and so for convenience a default no-op
    // implementation of `visitExpressions` is provided.
  }

  /**
   * Change the `prev` and `next` pointers of this node in a fluent way.
   */
  withPrevAndNext(prev: CreateNode|null, next: CreateNode|null): this {
    this.prev = prev;
    this.next = next;
    return this;
  }
}

/**
 * Convenience type for a `LinkedList` of `CreateNode`s.
 */
export type CreateList = LinkedList<CreateNode>;
export const CreateList: {new (): CreateList} = LinkedList;

/**
 * Convenience type for a `Transform` that applies to `CreateNode`s.
 */
export type CreateTransform = Transform<CreateNode>;

/**
 * A code generator which can recognize some `CreateNode` instances and generate an `o.Statement`
 * for them.
 *
 * `CreateEmitter`s are not required to handle every subtype of `CreateNode`.
 */
export interface CreateEmitter {
  /**
   * Potentially generate a statement for the given `CreateNode`, or return `null` if the specific
   * node type is not handled by this emitter.
   */
  emit(node: CreateNode): o.Statement|null;
}

const UPDATE_BRAND = Symbol('UpdateNode');

/**
 * A node in a template update block list.
 */
export abstract class UpdateNode implements LinkedListNode<UpdateNode> {
  /**
   * Required because `CreateNode` and `UpdateNode` are otherwise type-compatible.
   */
  private readonly[UPDATE_BRAND] = true;

  prev: UpdateNode|null = null;
  next: UpdateNode|null = null;


  /**
   * Apply an `ExpressionVisitor` to any `o.Expression` ASTs directly within this update node.
   *
   * No default implementation is provided here as most `UpdateNode`s will have expressions within
   * them, so a no-op implementation would almost alwawys be incorrect.
   */
  abstract visitExpressions(visitor: ExpressionVisitor, ctx?: any): void;

  /**
   * Change the `prev` and `next` pointers of this node in a fluent way.
   */
  withPrevAndNext(prev: UpdateNode|null, next: UpdateNode|null): this {
    this.prev = prev;
    this.next = next;
    return this;
  }
}

/**
 * Convenience type for a `LinkedList` of `UpdateNode`s.
 */
export type UpdateList = LinkedList<UpdateNode>;
export const UpdateList: {new (): UpdateList} = LinkedList;

/**
 * Convenience type for a `Transform` that applies to `UpdateNode`s.
 */
export type UpdateTransform = Transform<UpdateNode>;

/**
 * A code generator which can recognize some `UpdateNode` instances and generate an `o.Statement`
 * for them.
 *
 * `UpdateEmitter`s are not required to handle every subtype of `UpdateNode`.
 */
export interface UpdateEmitter {
  /**
   * Potentially generate a statement for the given `UpdateNode`, or return `null` if the specific
   * node type is not handled by this emitter.
   */
  emit(node: UpdateNode): o.Statement|null;
}
