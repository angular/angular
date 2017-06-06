library angular2.src.services.xhr_cache;

import 'dart:async' show Future;
import 'dart:html';
import 'dart:js' as js;
import 'package:angular2/core.dart';
import 'package:angular2/src/compiler/xhr.dart';
import 'package:angular2/src/facade/exceptions.dart' show BaseException;

/**
 * An implementation of XHR that uses a template cache to avoid doing an actual
 * XHR.
 *
 * The template cache needs to be built and loaded into window.$templateCache
 * via a separate mechanism.
 */
@Injectable()
class CachedXHR extends XHR {
  js.JsObject _cache;
  String _baseUri;

  CachedXHR() {
    if (js.context.hasProperty(r'$templateCache')) {
      this._cache = js.context[r'$templateCache'];
    } else {
      throw new BaseException(
        r'CachedXHR: Template cache was not found in $templateCache.');
    }
    this._baseUri = window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname;
    int lastSlash = this._baseUri.lastIndexOf('/');
    this._baseUri = this._baseUri.substring(0, lastSlash + 1);
  }

  Future<String> get(String url) {
    if (url.startsWith(this._baseUri)) {
      url = url.substring(this._baseUri.length);
    }
    if (this._cache.hasProperty(url)) {
      return new Future.value(this._cache[url]);
    } else {
      return new Future.error(
        'CachedXHR: Did not find cached template for ' + url);
    }
  }
}
