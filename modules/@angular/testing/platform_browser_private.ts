import {__platform_browser_private__ as _} from '@angular/platform-browser';

export function getDOM(): _.DomAdapter {
  return _.getDOM();
}

export function setDOM(adapter:_.DomAdapter){
  _.setDOM(adapter)
}


export type BrowserDomAdapter = _.BrowserDomAdapter;
export var BrowserDomAdapter: typeof _.BrowserDomAdapter = _.BrowserDomAdapter;

export type AnimationBuilder = _.AnimationBuilder;
export var AnimationBuilder: typeof _.AnimationBuilder = _.AnimationBuilder;

export type CssAnimationBuilder = _.CssAnimationBuilder;
export var CssAnimationBuilder: typeof _.CssAnimationBuilder = _.CssAnimationBuilder;

export type CssAnimationOptions = _.CssAnimationOptions;
export var CssAnimationOptions: typeof _.CssAnimationOptions = _.CssAnimationOptions;

export type Animation = _.Animation;
export var Animation: typeof _.Animation = _.Animation;

export type BrowserDetails = _.BrowserDetails;
export var BrowserDetails: typeof _.BrowserDetails = _.BrowserDetails;
