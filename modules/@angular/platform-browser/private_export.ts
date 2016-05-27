import * as dom_adapter from './src/dom/dom_adapter';
import * as dom_renderer from './src/dom/dom_renderer';
import * as shared_styles_host from './src/dom/shared_styles_host';

export namespace __platform_browser_private__ {
  export type DomAdapter = dom_adapter.DomAdapter;
  export var DomAdapter = dom_adapter.DomAdapter;

  export function getDOM(): DomAdapter { return dom_adapter.getDOM(); }

  export var setRootDomAdapter = dom_adapter.setRootDomAdapter;

  export type DomRootRenderer = dom_renderer.DomRootRenderer;
  export var DomRootRenderer = dom_renderer.DomRootRenderer;
  export type DomRootRenderer_ = dom_renderer.DomRootRenderer_;
  export var DomRootRenderer_ = dom_renderer.DomRootRenderer_;
  export type DomSharedStylesHost = shared_styles_host.DomSharedStylesHost;
  export var DomSharedStylesHost = shared_styles_host.DomSharedStylesHost;
  export type SharedStylesHost = shared_styles_host.SharedStylesHost;
  export var SharedStylesHost = shared_styles_host.SharedStylesHost;
}
