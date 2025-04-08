import {FieldContext, FieldPath, LogicFn} from './api/types';
import {FieldNode} from './field_node';
import {DYNAMIC, FieldLogicNode} from './logic_node';

/**
 * Special key which is used to retrieve the `FieldPathNode` instance from its `FieldPath` proxy wrapper.
 */
const PATH = Symbol('PATH');

export interface Predicate {
  readonly fn: LogicFn<any, boolean>;
  readonly path: FieldPath<any>;
}

export class FieldPathNode {
  readonly root: FieldPathNode;
  readonly logic: FieldLogicNode;
  private readonly children = new Map<PropertyKey, FieldPathNode>();

  readonly fieldPathProxy: FieldPath<any> = new Proxy(
    this,
    FIELD_PATH_PROXY_HANDLER,
  ) as unknown as FieldPath<any>;

  private constructor(
    logic: FieldLogicNode | undefined,
    root: FieldPathNode | undefined,
    readonly predicate: Predicate | undefined,
  ) {
    this.logic = logic ?? FieldLogicNode.newRoot(this);
    this.root = root ?? this;
  }

  get element(): FieldPathNode {
    return this.getChild(DYNAMIC);
  }

  maybeWrapWithPredicate<TValue, TReturn>(
    logicFn: LogicFn<TValue, TReturn>,
    defaultValue: TReturn,
  ): LogicFn<TValue, TReturn> {
    const predicate = this.predicate;
    if (!predicate) {
      return logicFn;
    }

    return (arg: FieldContext<any>): TReturn => {
      const predicateField = arg.resolve(predicate.path).$state as FieldNode;
      if (!predicate.fn(predicateField.fieldContext)) {
        // don't actually run the user function
        return defaultValue;
      }
      return logicFn(arg);
    };
  }

  getChild(key: PropertyKey): FieldPathNode {
    if (!this.children.has(key)) {
      this.children.set(
        key,
        new FieldPathNode(this.logic.getChild(key), this.root, this.predicate),
      );
    }
    return this.children.get(key)!;
  }

  withPredicate(predicate: Predicate): FieldPathNode {
    return new FieldPathNode(this.logic, this.root, predicate);
  }

  static unwrapFieldPath(formPath: FieldPath<unknown>): FieldPathNode {
    return (formPath as any)[PATH] as FieldPathNode;
  }

  static newRoot(): FieldPathNode {
    return new FieldPathNode(undefined, undefined, undefined);
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
