import {isBlank, isPresent} from 'angular2/src/facade/lang';

import * as viewModule from '../view/view';
import {LightDom} from './light_dom';

export class ShadowDomStrategy {
  // Whether the strategy understands the native <content> tag
  hasNativeContentElement(): boolean { return true; }

  // Prepares and returns the (emulated) shadow root for the given element.
  prepareShadowRoot(el): any { return null; }

  constructLightDom(lightDomView: viewModule.DomView, el): LightDom { return null; }

  // An optional step that can modify the template style elements.
  processStyleElement(hostComponentId: string, templateUrl: string, styleElement): void {}

  // An optional step that can modify the template elements (style elements exlcuded).
  processElement(hostComponentId: string, elementComponentId: string, element): void {}
}
