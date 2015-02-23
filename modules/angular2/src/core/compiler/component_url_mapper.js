import {Type, isPresent} from 'angular2/src/facade/lang';
import {Map, MapWrapper} from 'angular2/src/facade/lang';

export class ComponentUrlMapper {
  // Returns the url to the component source file.
  // The returned url could be:
  // - an absolute URL,
  // - a URL relative to the application
  getUrl(component: Type): string {
    return './';
  }
}

export class RuntimeComponentUrlMapper extends ComponentUrlMapper {
  _componentUrls: Map;

  constructor() {
    super();
    this._componentUrls = MapWrapper.create();
  }

  setComponentUrl(component: Type, url: string) {
    MapWrapper.set(this._componentUrls, component, url);
  }

  getUrl(component: Type): string {
    var url = MapWrapper.get(this._componentUrls, component);
    if (isPresent(url)) return url;
    return super.getUrl(component);
  }
}
