import type {Form} from '../api/form';
import {FormNode} from './node';

export interface FormError {
  kind: string;
  message?: string;
}

export class LogicNode {
  disabled?: (node: FormNode, ...roots: Form<any>[]) => boolean;
  errors?: (node: FormNode, ...roots: Form<any>[]) => FormError[];

  element?: LogicNode;
  readonly children = new Map<PropertyKey, LogicNode>();

  constructor(readonly parentDepths: number[]) {}

  getRoots(node: FormNode): Form<any>[] {
    const roots: Form<unknown>[] = [];
    for (
      let depth = 0, idx = 0, root = node;
      idx < this.parentDepths.length;
      depth++, root = root.parent!
    ) {
      if (depth === this.parentDepths[idx]) {
        roots.push(root.proxy as Form<unknown>);
        idx++;
      }
    }

    return roots;
  }
}
