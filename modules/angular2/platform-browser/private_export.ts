import * as dom_adapter from './src/dom/dom_adapter';
import * as animation_builder from './src/animate/animation_builder';
import * as css_animation_builder from './src/animate/css_animation_builder';
import * as browser_details from './src/animate/browser_details';
import * as css_animation_options from './src/animate/css_animation_options';
import * as animation from './src/animate/animation';

export namespace __platform_browser_private__ {
  export var DomAdapter = dom_adapter.DomAdapter;

  export type DomAdapter = dom_adapter.DomAdapter;
  export var setRootDomAdapter = dom_adapter.setRootDomAdapter;

  export type AnimationBuilder = animation_builder.AnimationBuilder;
  export var AnimationBuilder = animation_builder.AnimationBuilder;

  export type CssAnimationBuilder = css_animation_builder.CssAnimationBuilder
  export var CssAnimationBuilder = css_animation_builder.CssAnimationBuilder;

  export type CssAnimationOptions = css_animation_options.CssAnimationOptions;
  export var CssAnimationOptions = css_animation_options.CssAnimationOptions;

  export type Animation = animation.Animation;
  export var Animation = animation.Animation;

  export type BrowserDetails = browser_details.BrowserDetails;
  export var BrowserDetails = browser_details.BrowserDetails;
}

