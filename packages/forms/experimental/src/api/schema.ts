import {WritableSignal} from '@angular/core';
import {LogicNode} from '../engine/logic';
import {FormNode} from '../engine/node';

export type FormPathTerminal<T, TRoots extends any[]> = {_: T; __: TRoots};
export type FormPath<T, TRoots extends any[]> = T extends any[]
  ? FormPathTerminal<T, TRoots>
  : T extends Record<PropertyKey, any>
    ? {[K in keyof T]: FormPath<T[K], TRoots>}
    : FormPathTerminal<T, TRoots>;

export function schema<T>(fn: (p: FormPath<T, []>) => void): LogicNode {
  const node = new LogicNode([0]);
  fn(makeFormPath(node));
  return node;
}

export function disabled<T, TRoots extends any[]>(
  path: FormPath<T, TRoots>,
  fn: NoInfer<(v: T, local: FormNode, ...roots: TRoots) => boolean>,
): void {
  const logic = (path as any)['$logic'] as LogicNode;
  const prevDisabled = logic.disabled ?? (() => false);
  logic.disabled = (node: FormNode) => {
    const roots = getRoots(logic.parentDepths, node) as TRoots;
    return prevDisabled(node) || fn(node.value() as T, roots.shift(), ...roots);
  };
}

function getRoots(parentDepths: number[], node: FormNode, depth = 0): FormNode[] {
  const roots: FormNode[] = [];

  for (let depth of parentDepths) {
    // find node at `depth`
    let root = node;
    while (depth-- > 0) {
      root = node.parent!;
    }
    roots.push(root);
  }
  return roots;
}

export function array<T, TRoots extends any[]>(
  path: FormPathTerminal<T[], TRoots>,
  fn: (p: FormPath<T, [FormNode, ...TRoots]>) => void,
): void {
  const logic = (path as any)['$logic'] as LogicNode;
  logic.element = new LogicNode([0, ...logic.parentDepths.map((depth) => depth + 1)]);
  fn(makeFormPath(logic.element));
}

export function form<T>(
  v: WritableSignal<T>,
  s: ((p: FormPath<T, []>) => void) | LogicNode,
): FormNode {
  if (typeof s === 'function') {
    s = schema(s);
  }
  return new FormNode(v, undefined, s);
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

/**
 * 

(node: FormNode)
node.parent().parent().parent()

F:
  FormPath<T, []>
  f.user.addresses ->
  f.user.first: (c: Field(user.first), f: Form(F))
    logic: [2]
  Address:
    FormPath<Address, [Form<T>]>
    a.street: (c: Field(street), a: Form(Address), f: Form(F))
      [1, 3]
    a.street.lines -> Line
        FormPath<Line, [Form<Address>, Form<T>]
        l: (c: Field(l), l: Form(Line), a: Form(Address), f: Form(F))
          [0, 3, 3]


schema<Address>(p: FormPath<T, []>)

 */
