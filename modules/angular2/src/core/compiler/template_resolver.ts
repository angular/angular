import {Injectable} from 'angular2/di';
import {View} from 'angular2/src/core/annotations_impl/view';

import {Type, stringify, isBlank, BaseException} from 'angular2/src/facade/lang';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';

import {reflector} from 'angular2/src/reflection/reflection';


@Injectable()
export class TemplateResolver {
  _cache: Map<Type, /*node*/ any> = MapWrapper.create();

  resolve(component: Type): View {
    var view = MapWrapper.get(this._cache, component);

    if (isBlank(view)) {
      view = this._resolve(component);
      MapWrapper.set(this._cache, component, view);
    }

    return view;
  }

  _resolve(component: Type) {
    var annotations = reflector.annotations(component);
    for (var i = 0; i < annotations.length; i++) {
      var annotation = annotations[i];
      if (annotation instanceof View) {
        return annotation;
      }
    }
    // No annotation = dynamic component!
    return null;
  }
}
