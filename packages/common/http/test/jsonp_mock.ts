/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class MockScriptElement {
  constructor() {}

  listeners: {
    load?: (event: Event) => void,
    error?: (err: Error) => void,
  } = {};

  addEventListener(event: 'load'|'error', handler: Function): void {
    this.listeners[event] = handler as any;
  }

  removeEventListener(event: 'load'|'error'): void {
    delete this.listeners[event];
  }
}

export class MockDocument {
  // TODO(issue/24571): remove '!'.
  mock!: MockScriptElement|null;
  readonly body: any = this;

  createElement(tag: 'script'): HTMLScriptElement {
    return new MockScriptElement() as any as HTMLScriptElement;
  }

  appendChild(node: any): void {
    this.mock = node;
  }

  removeNode(node: any): void {
    if (this.mock === node) {
      this.mock = null;
    }
  }

  mockLoad(): void {
    this.mock!.listeners.load!(null as any);
  }

  mockError(err: Error) {
    this.mock!.listeners.error!(err);
  }
}
