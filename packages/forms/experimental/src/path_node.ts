/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FieldPath, SchemaFn} from './api/types';
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
    other.compile();
    this.logic.mergeIn(other.logic, predicate);
  }

  static unwrapFieldPath(formPath: FieldPath<unknown>): FieldPathNode {
    return (formPath as any)[PATH] as FieldPathNode;
  }
}

let currentRoot: FieldRootPathNode | undefined = undefined;

export function assertPathIsCurrent(path: FieldPath<unknown>): void {
  if (currentRoot !== FieldPathNode.unwrapFieldPath(path).root) {
    throw new Error(`🚨👮 Wrong path! 👮🚨

This error happens when using a path from outside of schema:

applyWhen(
      path,
      condition,
      (pathWhenTrue /* <-- Use this, not path  */) => {
        // ✅ This works
        applyEach(pathWhenTrue.friends, friendSchema);
        // 🚨 👮 🚓  You have to use nested path
        // This produces a this error:
        applyEach(path /*has to be pathWhenTrue*/.friends, friendSchema);
      }
    );

    `);
  }
}

export class FieldRootPathNode extends FieldPathNode {
  private isCompiled = false;

  constructor(private schemaFn: SchemaFn<unknown> | undefined) {
    super([], LogicNodeBuilder.newRoot(), undefined);
  }

  // TODO: This probably needs to happen once **per-form** rather than once ever, otherwise it gets
  // compiled with the injector from the first form that uses it and continues to use that injector
  // on all future forms.
  compile() {
    if (this.isCompiled) {
      return;
    }
    this.isCompiled = true;
    if (!this.schemaFn) {
      return;
    }
    const prevRoot = currentRoot;
    try {
      currentRoot = this;
      this.schemaFn(currentRoot.fieldPathProxy);
    } finally {
      currentRoot = prevRoot;
    }
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
