/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ngDebugApiIsSupported, ngDebugClient} from './ng-debug-api/ng-debug-api';

export const runOutsideAngular = (f: () => void): void => {
  const w = window as any;
  if (!w.Zone || !w.Zone.current) {
    f();
    return;
  }
  if (w.Zone.current._name !== 'angular') {
    w.Zone.current.run(f);
    return;
  }
  const parent = w.Zone.current._parent;
  if (parent && parent.run) {
    parent.run(f);
    return;
  }
  f();
};

export const isCustomElement = (node: Node) => {
  if (typeof customElements === 'undefined') {
    return false;
  }
  if (!(node instanceof HTMLElement)) {
    return false;
  }
  const tagName = node.tagName.toLowerCase();
  return !!customElements.get(tagName);
};

export function isSignal(prop: unknown): prop is (() => unknown) & {set: (value: unknown) => void} {
  const ng = ngDebugClient();
  if (!ngDebugApiIsSupported(ng, 'isSignal')) {
    return false;
  }
  return (window as any).ng.isSignal(prop);
}

export function safelyReadSignalValue(signal: any): {error?: Error; value?: any} {
  try {
    const value = signal();
    return {error: undefined, value};
  } catch (error) {
    console.error('[Angular DevTools]: Error reading signal value:', error);
    return {error: error as Error, value: undefined};
  }
}

export function unwrapSignal(s: any): any {
  if (!isSignal(s)) {
    return s;
  }

  const {error, value} = safelyReadSignalValue(s);
  if (error) {
    return;
  }
  return value;
}
