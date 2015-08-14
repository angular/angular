import {Injectable} from 'angular2/di';
import {BaseView} from 'angular2/src/core/annotations_impl/base_view';

import {Type, stringify, isBlank, BaseException} from 'angular2/src/facade/lang';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';

import {reflector} from 'angular2/src/reflection/reflection';


@Injectable()
export class ViewResolver {
  _cache: Map<Type, /*node*/ any> = new Map();

  resolve(component: Type): BaseView {
    var view = this._cache.get(component);

    if (isBlank(view)) {
      view = this._resolve(component);
      this._cache.set(component, view);
    }

    return view;
  }

  _resolve(component: Type): BaseView {
    var annotations = reflector.annotations(component);
    for (var i = 0; i < annotations.length; i++) {
      var annotation = annotations[i];
      if (annotation instanceof BaseView) {
        return annotation;
      }
    }
    throw new BaseException(`No View annotation found on component ${stringify(component)}`);
  }
}
