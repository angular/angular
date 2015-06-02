import {ElementBinder} from './element_binder';
import {DomViewContainer} from './view_container';
import {LightDom} from '../shadow_dom/light_dom';
import {Content} from '../shadow_dom/content_tag';

export class DomElement {
  viewContainer: DomViewContainer;
  lightDom: LightDom;
  constructor(public proto: ElementBinder, public element: any /* element */,
              public contentTag: Content) {}
}
