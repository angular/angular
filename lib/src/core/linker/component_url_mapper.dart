library angular2.src.core.linker.component_url_mapper;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show Type, isPresent;
import "package:angular2/src/facade/collection.dart" show Map, MapWrapper;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;

/**
 * Resolve a `Type` from a [ComponentMetadata] into a URL.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See [Compiler]
 */
@Injectable()
class ComponentUrlMapper {
  /**
   * Returns the base URL to the component source file.
   * The returned URL could be:
   * - an absolute URL,
   * - a path relative to the application
   */
  String getUrl(Type component) {
    return reflector.isReflectionEnabled()
        ? reflector.importUri(component)
        : "./";
  }
}

class RuntimeComponentUrlMapper extends ComponentUrlMapper {
  /** @internal */
  var _componentUrls = new Map<Type, String>();
  RuntimeComponentUrlMapper() : super() {
    /* super call moved to initializer */;
  }
  setComponentUrl(Type component, String url) {
    this._componentUrls[component] = url;
  }

  String getUrl(Type component) {
    var url = this._componentUrls[component];
    if (isPresent(url)) return url;
    return super.getUrl(component);
  }
}
