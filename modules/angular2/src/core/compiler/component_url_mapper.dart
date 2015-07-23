library angular2.src.core.compiler.component_url_mapper;

import "dart:mirrors";

import "package:angular2/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show Type;

@Injectable()
class ComponentUrlMapper {
  // Returns the base URL to the component source file.
  // The returned URL could be:
  // - an absolute URL,
  // - a path relative to the application
  String getUrl(Type component) {
    return (reflectClass(component).owner as LibraryMirror).uri.toString();
  }
}
