/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FieldPath} from './api/types';
import {DYNAMIC, Predicate} from './logic_node';
import {LogicNodeBuilder} from './logic_node_2';

/**
 * Special key which is used to retrieve the `FieldPathNode` instance from its `FieldPath` proxy wrapper.
 */
const PATH = Symbol('PATH');

export class FieldPathNode {
  readonly root: FieldRootPathNode;
  private readonly children = new Map<PropertyKey, FieldPathNode>();

  readonly fieldPathProxy: FieldPath<any> = new Proxy(
    this,
    FIELD_PATH_PROXY_HANDLER,
  ) as unknown as FieldPath<any>;

  protected constructor(
    readonly keys: PropertyKey[],
    readonly logic: LogicNodeBuilder,
    root: FieldRootPathNode | undefined,
  ) {
    this.root = root ?? (this as unknown as FieldRootPathNode);
  }

  get element(): FieldPathNode {
    return this.getChild(DYNAMIC);
  }

  getChild(key: PropertyKey): FieldPathNode {
    if (!this.children.has(key)) {
      this.children.set(
        key,
        new FieldPathNode([...this.keys, key], this.logic.getChild(key), this.root),
      );
    }
    return this.children.get(key)!;
  }

  mergeIn(other: FieldRootPathNode, predicate?: Predicate) {
    // Copy over the prefix lists for each subroot in the other node.
    for (const [subroot, prefixes] of other.subroots) {
      // Initialize the prefix list for this node if it doesn't exist yet.
      if (!this.root.subroots.has(subroot)) {
        this.root.subroots.set(subroot, []);
      }
      // Copy over the prefixes from the other subroot into our list.
      const existingPrefixes = this.root.subroots.get(subroot)!;
      for (const prefix of prefixes) {
        existingPrefixes.push([...this.keys, ...prefix]);
      }
    }
    this.logic.mergeIn(other.logic, predicate);
  }

  static unwrapFieldPath(formPath: FieldPath<unknown>): FieldPathNode {
    return (formPath as any)[PATH] as FieldPathNode;
  }
}

export class FieldRootPathNode extends FieldPathNode {
  /**
   * Maps each sub-FieldRootPathNode to all of the prefixes for which that path has been applied.
   * It is possible for it to map to multiple prefixes, since a precompiled schema can be applied
   * to multiple different properties within the schema. For example:
   *
   * const addrSchema = schema<Address>(...)
   * const orderSchema = shcema<Order>(p => {
   *   apply(p.shippingAddress, addrSchema);
   *   apply(p.billingAddress, addrScheam);
   * });
   */
  // TODO: Might need to keep the prefixes sorted from longest to shortest?
  readonly subroots = new Map<FieldRootPathNode, PropertyKey[][]>([[this, [[]]]]);

  constructor() {
    super([], LogicNodeBuilder.newRoot(), undefined);
  }
}

/**
 * Proxy handler which implements `FormPath` on top of a `LogicNode`.
 */
export const FIELD_PATH_PROXY_HANDLER: ProxyHandler<FieldPathNode> = {
  get(node: FieldPathNode, property: string | symbol) {
    if (property === PATH) {
      return node;
    }

    return node.getChild(property).fieldPathProxy;
  },
};
