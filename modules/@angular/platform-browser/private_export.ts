import * as animation_builder from './src/animate/animation_builder';
import * as css_animation_builder from './src/animate/css_animation_builder';
import * as browser_details from './src/animate/browser_details';
import * as css_animation_options from './src/animate/css_animation_options';
import * as animation from './src/animate/animation';
import * as dom_adapter from './src/dom/dom_adapter';
import * as browser_adapter from './src/browser/browser_adapter';
import * as browser_common from './src/platform/common/browser';

export namespace __platform_browser_private__ {
  export type DomAdapter = dom_adapter.DomAdapter;
  export var DomAdapter = dom_adapter.DomAdapter;

  export function getDOM(): DomAdapter { return dom_adapter.getDOM(); }

  export var setRootDomAdapter = dom_adapter.setRootDomAdapter;
}
