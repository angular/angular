import {Injectable} from 'angular2/di';
import {Type, isPresent} from 'angular2/src/facade/lang';
import {Map, MapWrapper} from 'angular2/src/facade/collection';

@Injectable()
export class ComponentUrlMapper {
  // Returns the base URL to the component source file.
  // The returned URL could be:
  // - an absolute URL,
  // - a path relative to the application
  getUrl(component: Type): string { return './'; }
}

export class RuntimeComponentUrlMapper extends ComponentUrlMapper {
  _componentUrls: Map<Type, string>;

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
