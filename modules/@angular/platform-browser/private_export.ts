import * as dom_adapter from './src/dom/dom_adapter';

export namespace __platform_browser_private__ {
  export type DomAdapter = dom_adapter.DomAdapter;
  export var DomAdapter = dom_adapter.DomAdapter;

  export function getDOM(): DomAdapter { return dom_adapter.getDOM(); }

  export var setRootDomAdapter = dom_adapter.setRootDomAdapter;
}
