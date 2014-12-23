import {EmulatedShadowDomStrategy, NativeShadowDomStrategy} from './shadow_dom_strategy';
export * from './shadow_dom_strategy';

export var ShadowDomEmulated = new EmulatedShadowDomStrategy();
export var ShadowDomNative = new NativeShadowDomStrategy();