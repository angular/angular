library angular2.src.services.xhr_impl; 

import 'dart:async';
import 'dart:html';
import 'package:angular2/di.dart';
import './xhr.dart' show XHR;

@Injectable()
class XHRImpl extends XHR {
  Future<String> get(String url) {
    return HttpRequest.request(url).then(
      (HttpRequest request) => request.responseText,
      onError: (Error e) => throw 'Failed to load $url'
    );
  }
}
