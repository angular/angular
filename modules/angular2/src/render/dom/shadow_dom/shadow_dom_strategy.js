import {isBlank, isPresent} from 'angular2/src/facade/lang';

import {Promise} from 'angular2/src/facade/async';
import * as viewModule from '../view/view';
import {LightDom} from './light_dom';

export class ShadowDomStrategy {
  hasNativeContentElement():boolean {
    return true;
  }

  attachTemplate(el, view:viewModule.RenderView) {}

  constructLightDom(lightDomView:viewModule.RenderView, shadowDomView:viewModule.RenderView, el): LightDom {
    return null;
  }

  /**
   * An optional step that can modify the template style elements.
   */
  processStyleElement(hostComponentId:string, templateUrl:string, styleElement):Promise {
    return null;
  };

  /**
   * An optional step that can modify the template elements (style elements exlcuded).
   */
  processElement(hostComponentId:string, elementComponentId:string, element) {}
}
