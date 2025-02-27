import {untracked} from '@angular/core';
import type {FormNode} from './node';

export type FormProxy = {$: FormNode};

const FORM_NODE_HANDLER: ProxyHandler<FormNode> = {
  get(tgt: FormNode, p: string | symbol) {
    if (p === '$') {
      return tgt;
    }
    const child = tgt.getChild(p);
    if (child !== undefined) {
      return child.proxy;
    }

    const v = untracked(tgt.value);
    if (Array.isArray(v)) {
      if (p === 'length') {
        return (tgt.value() as Array<unknown>).length;
      }
      return (Array.prototype as any)[p];
    }

    return undefined;
  },
};

export function formProxy(node: FormNode): FormProxy {
  return new Proxy(node, FORM_NODE_HANDLER) as unknown as FormProxy;
}
