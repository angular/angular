import {FieldPath} from './api/types';
import {DYNAMIC, FieldLogicNode, Predicate} from './logic_node';

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
    readonly logic: FieldLogicNode,
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

  mergeIn(other: FieldRootPathNode) {
    this.logic.mergeIn(other.logic);
    for (const [root, pathKeys] of other.subroots) {
      this.root.subroots.set(root, [...this.keys, ...pathKeys]);
    }
  }

  static unwrapFieldPath(formPath: FieldPath<unknown>): FieldPathNode {
    return (formPath as any)[PATH] as FieldPathNode;
  }
}

export class FieldRootPathNode extends FieldPathNode {
  readonly subroots = new Map<FieldPathNode, PropertyKey[]>([[this, []]]);

  constructor(predicate: Predicate | undefined) {
    super([], FieldLogicNode.newRoot(predicate), undefined);
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
