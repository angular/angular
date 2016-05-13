import * as animation_builder from './src/animate/animation_builder';
import * as css_animation_builder from './src/animate/css_animation_builder';
import * as browser_details from './src/animate/browser_details';
import * as css_animation_options from './src/animate/css_animation_options';
import * as animation from './src/animate/animation';
import * as dom_adapter from './src/dom/dom_adapter';
import * as browser_adapter from './src/browser/browser_adapter';
import * as browser_common from './src/browser_common';

export namespace __platform_browser_private__ {
  export type DomAdapter = dom_adapter.DomAdapter;
  export var DomAdapter = dom_adapter.DomAdapter;

  export function getDOM(): DomAdapter { return dom_adapter.getDOM(); }

  export function setDOM(adapter: DomAdapter) { return dom_adapter.setDOM(adapter); }

  export var setRootDomAdapter = dom_adapter.setRootDomAdapter;

  export type BrowserDomAdapter = browser_adapter.BrowserDomAdapter;
  export var BrowserDomAdapter = browser_adapter.BrowserDomAdapter;

  export type AnimationBuilder = animation_builder.AnimationBuilder;
  export var AnimationBuilder = animation_builder.AnimationBuilder;

  export type CssAnimationBuilder = css_animation_builder.CssAnimationBuilder;
  export var CssAnimationBuilder = css_animation_builder.CssAnimationBuilder;

  export type CssAnimationOptions = css_animation_options.CssAnimationOptions;
  export var CssAnimationOptions = css_animation_options.CssAnimationOptions;

  export type Animation = animation.Animation;
  export var Animation = animation.Animation;

  export type BrowserDetails = browser_details.BrowserDetails;
  export var BrowserDetails = browser_details.BrowserDetails;
}
