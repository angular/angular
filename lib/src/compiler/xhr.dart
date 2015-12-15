library angular2.src.compiler.xhr;

import "package:angular2/src/facade/async.dart" show Future;
// TODO: vsavkin rename it into TemplateLoader

/**
 * An interface for retrieving documents by URL that the compiler uses
 * to load templates.
 */
class XHR {
  Future<String> get(String url) {
    return null;
  }
}
