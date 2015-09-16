import {Injectable} from 'angular2/src/core/di';
import {ViewMetadata} from '../metadata/view';

import {Type, stringify, isBlank} from 'angular2/src/core/facade/lang';
import {BaseException} from 'angular2/src/core/facade/exceptions';
import {Map, MapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';

import {reflector} from 'angular2/src/core/reflection/reflection';


@Injectable()
export class ViewResolver {
  _cache: Map<Type, /*node*/ any> = new Map();

  resolve(component: Type): ViewMetadata {
    var view = this._cache.get(component);

    if (isBlank(view)) {
      view = this._resolve(component);
      this._cache.set(component, view);
    }

    return view;
  }

  _resolve(component: Type): ViewMetadata {
    var annotations = reflector.annotations(component);
    for (var i = 0; i < annotations.length; i++) {
      var annotation = annotations[i];
      if (annotation instanceof ViewMetadata) {
        return annotation;
      }
    }
    throw new BaseException(`No View annotation found on component ${stringify(component)}`);
  }
}
