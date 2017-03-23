export class MockScriptElement {
  constructor() {}

  listeners: {
    load?: (event: Event) => void,
    error?: (err: Error) => void,
  } = {};

  addEventListener(event: 'load'|'error', handler: Function): void {
    this.listeners[event] = handler as any;
  }

  removeEventListener(event: 'load'|'error'): void { delete this.listeners[event]; }
}

export class MockDocument {
  mock: MockScriptElement|null;

  createElement(tag: 'script'): HTMLScriptElement {
    return new MockScriptElement() as any as HTMLScriptElement;
  }

  get body(): any { return this; }

  appendChild(node: any): void { this.mock = node; }

  removeNode(node: any): void {
    if (this.mock === node) {
      this.mock = null;
    }
  }

  mockLoad(): void { this.mock !.listeners.load !(null as any); }

  mockError(err: Error) { this.mock !.listeners.error !(err); }
}