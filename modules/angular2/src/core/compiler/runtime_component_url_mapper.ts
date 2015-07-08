import {Type, isPresent} from 'angular2/src/facade/lang';
import {Map} from 'angular2/src/facade/collection';
import {ComponentUrlMapper} from './component_url_mapper';

export class RuntimeComponentUrlMapper extends ComponentUrlMapper {
  _componentUrls: Map<Type, string>;

  constructor() {
    super();
    this._componentUrls = new Map();
  }

  setComponentUrl(component: Type, url: string) { this._componentUrls.set(component, url); }

  getUrl(component: Type): string {
    var url = this._componentUrls.get(component);
    if (isPresent(url)) return url;
    return super.getUrl(component);
  }
}
