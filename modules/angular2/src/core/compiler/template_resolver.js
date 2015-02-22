import {Template} from 'angular2/src/core/annotations/template';

import {Type, stringify, isBlank, BaseException} from 'angular2/src/facade/lang';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';

import {reflector} from 'angular2/src/reflection/reflection';


export class TemplateResolver {
  _cache: Map;

  constructor() {
    this._cache = MapWrapper.create();
  }

  resolve(component: Type): Template {
    var template = MapWrapper.get(this._cache, component);

    if (isBlank(template)) {
      template = this._resolve(component);
      MapWrapper.set(this._cache, component, template);
    }

    return template;
  }

  _resolve(component: Type) {
    var annotations = reflector.annotations(component);
    for (var i = 0; i < annotations.length; i++) {
      var annotation = annotations[i];
      if (annotation instanceof Template) {
        return annotation;
      }
    }

    throw new BaseException(`No template found for ${stringify(component)}`);
  }
}
