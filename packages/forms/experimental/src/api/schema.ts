import {FormError, LogicNode} from '../engine/logic';
import {FormNode} from '../engine/node';
import {type Form} from './form';

export type FormPathTerminal<T, TRoots extends Form<any>[]> = {_: T; __: TRoots};
export type FormPath<T, TRoots extends Form<any>[]> = T extends any[]
  ? FormPathTerminal<T, TRoots>
  : T extends Record<PropertyKey, any>
    ? {[K in keyof T]: FormPath<T[K], TRoots>}
    : FormPathTerminal<T, TRoots>;

export function schema<T>(fn: (p: FormPath<T, [Form<T>]>) => void): LogicNode {
  const node = new LogicNode([0]);
  fn(makeFormPath(node));
  return node;
}

export function disabled<T, TRoots extends Form<any>[]>(
  path: FormPath<T, TRoots>,
  fn: NoInfer<(v: T, ...roots: TRoots) => boolean>,
): void {
  const logic = (path as any)['$logic'] as LogicNode;
  const prevDisabled = logic.disabled ?? (() => false);
  logic.disabled = (node: FormNode, ...roots: Form<any>[]) => {
    return prevDisabled(node) || fn(node.value() as T, ...(roots as TRoots));
  };
}

export function array<T extends any[], TRoots extends Form<any>[]>(
  path: FormPathTerminal<T, TRoots>,
  fn: NoInfer<(p: FormPath<T[number], [Form<T[number]>, ...TRoots]>) => void>,
): void {
  const logic = (path as any)['$logic'] as LogicNode;
  logic.element = new LogicNode([0, ...logic.parentDepths.map((depth) => depth + 1)]);
  fn(makeFormPath(logic.element));
}

export function validate<T, TRoots extends Form<any>[]>(
  path: FormPathTerminal<T, TRoots>,

  validator: NoInfer<(v: T, ...roots: TRoots) => FormError | Array<FormError> | undefined>,
): void {
  const logic = (path as any)['$logic'] as LogicNode;
  const prevErrors = logic.errors ?? (() => []);
  logic.errors = (node: FormNode, ...roots: Form<any>[]) => {
    let myErrors = validator(node.value() as T, ...(roots as TRoots));
    if (!Array.isArray(myErrors)) {
      myErrors = myErrors ? [myErrors] : [];
    }
    return [...prevErrors(node), ...myErrors];
  };
}

function makeFormPath<T, TRoots extends any[]>(node: LogicNode): FormPath<T, TRoots> {
  const handler: ProxyHandler<LogicNode> = {
    get(tgt: LogicNode, property: string | symbol) {
      if (property === '$logic') {
        return tgt;
      }

      if (!node.children.has(property)) {
        node.children.set(property, new LogicNode(node.parentDepths.map((depth) => depth + 1)));
      }
      const child = node.children.get(property)!;
      return new Proxy(child, handler);
    },
  };

  return new Proxy(node, handler) as unknown as FormPath<T, TRoots>;
}
