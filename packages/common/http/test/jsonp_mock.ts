/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export class MockScriptElement {
  constructor(public ownerDocument: MockDocument) {}

  listeners: {
    load?: (event: Event) => void;
    error?: (err: Error) => void;
  } = {};

  addEventListener(event: 'load' | 'error', handler: Function): void {
    this.listeners[event] = handler as any;
  }

  removeEventListener(event: 'load' | 'error'): void {
    delete this.listeners[event];
  }

  remove() {
    this.ownerDocument.removeNode(this);
  }

  private attrs: Record<string, string> = {};

  setAttribute(name: string, value: string): void {
    this.attrs[name] = value;
  }

  getAttribute(name: string): string | null {
    return this.attrs.hasOwnProperty(name) ? this.attrs[name] : null;
  }
}

export class MockDocument {
  mock!: MockScriptElement | null;
  readonly body: any = this;

  implementation = {
    createHTMLDocument: () => new MockDocument(),
  };

  createElement(tag: 'script'): HTMLScriptElement {
    return new MockScriptElement(this) as any as HTMLScriptElement;
  }

  appendChild(node: any): void {
    this.mock = node;
  }

  removeNode(node: any): void {
    if (this.mock === node) {
      this.mock = null;
    }
  }

  adoptNode(node: any) {
    node.ownerDocument = this;
  }

  mockLoad(): void {
    // Mimic behavior described by
    // https://html.spec.whatwg.org/multipage/scripting.html#execute-the-script-block
    if (this.mock!.ownerDocument === this) {
      this.mock!.listeners.load!(null as any);
    }
  }

  mockError(err: Error) {
    // Mimic behavior described by
    // https://html.spec.whatwg.org/multipage/scripting.html#execute-the-script-block
    if (this.mock!.ownerDocument === this) {
      this.mock!.listeners.error!(err);
    }
  }
}
