import {isBlank, isPresent} from 'angular2/src/facade/lang';

export class ShadowDomStrategy {
  // Whether the strategy understands the native <content> tag
  hasNativeContentElement(): boolean { return true; }

  // An optional step that can modify the template style elements.
  processStyleElement(hostComponentId: string, templateUrl: string, styleElement: HTMLStyleElement):
      void {}

  // An optional step that can modify the template elements (style elements exlcuded).
  processElement(hostComponentId: string, elementComponentId: string, element: HTMLElement): void {}
}
