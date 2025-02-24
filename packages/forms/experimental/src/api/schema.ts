import {LogicNode} from '../engine/logic';
import {FormNode} from '../engine/node';

type FormPathTerminal<T> = {_: T};
type FormPath<T> = T extends any[]
  ? FormPathTerminal<T>
  : T extends Record<PropertyKey, any>
    ? {[K in keyof T]: FormPath<T[K]>}
    : FormPathTerminal<T>;

export function schema<T>(fn: (p: FormPath<T>) => void): LogicNode {
  const node = new LogicNode();
  const handler: ProxyHandler<LogicNode> = {
    get(tgt: LogicNode, property: string | symbol) {
      if (property === '$logic') {
        return tgt;
      }

      if (!node.children.has(property)) {
        node.children.set(property, new LogicNode());
      }
      const child = node.children.get(property)!;
      return new Proxy(child, handler);
    },
  };

  const p: FormPath<T> = new Proxy(node, handler) as unknown as FormPath<T>;
  fn(p);
  return (p as any)['$logic'];
}

export function disabled<T>(path: FormPath<T>, fn: (v: T) => boolean): void {
  const logic = (path as any)['$logic'] as LogicNode;
  const prevDisabled = logic.disabled ?? (() => false);
  logic.disabled = (node: FormNode) => prevDisabled(node) || fn(node.value() as T);
}

export function array<T>(path: FormPathTerminal<T[]>, fn: (p: FormPath<T>) => LogicNode): void {
  const logic = (path as any)['$logic'] as LogicNode;
  logic.element = schema<T>(fn);
}
