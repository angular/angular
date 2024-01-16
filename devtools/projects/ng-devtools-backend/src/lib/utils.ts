/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export const ngDebug = () => (window as any).ng;

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

export function hasDiDebugAPIs(): boolean {
  if (!ngDebugApiIsSupported('ɵgetInjectorResolutionPath')) {
    return false;
  }
  if (!ngDebugApiIsSupported('ɵgetDependenciesFromInjectable')) {
    return false;
  }
  if (!ngDebugApiIsSupported('ɵgetInjectorProviders')) {
    return false;
  }
  if (!ngDebugApiIsSupported('ɵgetInjectorMetadata')) {
    return false;
  }

  return true;
}

export function ngDebugApiIsSupported(api: string): boolean {
  const ng = ngDebug();
  return typeof ng[api] === 'function';
}

export function isSignal(prop: unknown): prop is () => unknown {
  if (!ngDebugApiIsSupported('isSignal')) {
    return false;
  }
  return (window as any).ng.isSignal(prop);
}

export function unwrapSignal(s: any): any {
  return isSignal(s) ? s() : s;
}
