library angular2.src.core.linker.view_resolver;

import "package:angular2/src/core/di.dart" show Injectable;
import "../metadata/view.dart" show ViewMetadata;
import "../metadata/directives.dart" show ComponentMetadata;
import "package:angular2/src/facade/lang.dart"
    show Type, stringify, isBlank, isPresent;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/collection.dart" show Map;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;

@Injectable()
class ViewResolver {
  /** @internal */
  var _cache = new Map<Type, ViewMetadata>();
  ViewMetadata resolve(Type component) {
    var view = this._cache[component];
    if (isBlank(view)) {
      view = this._resolve(component);
      this._cache[component] = view;
    }
    return view;
  }

  /** @internal */
  ViewMetadata _resolve(Type component) {
    ComponentMetadata compMeta;
    ViewMetadata viewMeta;
    reflector.annotations(component).forEach((m) {
      if (m is ViewMetadata) {
        viewMeta = m;
      }
      if (m is ComponentMetadata) {
        compMeta = m;
      }
    });
    if (isPresent(compMeta)) {
      if (isBlank(compMeta.template) &&
          isBlank(compMeta.templateUrl) &&
          isBlank(viewMeta)) {
        throw new BaseException(
            '''Component \'${ stringify ( component )}\' must have either \'template\', \'templateUrl\', or \'@View\' set.''');
      } else if (isPresent(compMeta.template) && isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("template", component);
      } else if (isPresent(compMeta.templateUrl) && isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("templateUrl", component);
      } else if (isPresent(compMeta.directives) && isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("directives", component);
      } else if (isPresent(compMeta.pipes) && isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("pipes", component);
      } else if (isPresent(compMeta.encapsulation) && isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("encapsulation", component);
      } else if (isPresent(compMeta.styles) && isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("styles", component);
      } else if (isPresent(compMeta.styleUrls) && isPresent(viewMeta)) {
        this._throwMixingViewAndComponent("styleUrls", component);
      } else if (isPresent(viewMeta)) {
        return viewMeta;
      } else {
        return new ViewMetadata(
            templateUrl: compMeta.templateUrl,
            template: compMeta.template,
            directives: compMeta.directives,
            pipes: compMeta.pipes,
            encapsulation: compMeta.encapsulation,
            styles: compMeta.styles,
            styleUrls: compMeta.styleUrls);
      }
    } else {
      if (isBlank(viewMeta)) {
        throw new BaseException(
            '''No View decorator found on component \'${ stringify ( component )}\'''');
      } else {
        return viewMeta;
      }
    }
    return null;
  }

  /** @internal */
  void _throwMixingViewAndComponent(String propertyName, Type component) {
    throw new BaseException(
        '''Component \'${ stringify ( component )}\' cannot have both \'${ propertyName}\' and \'@View\' set at the same time"''');
  }
}
