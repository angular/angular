library angular2.src.services.xhr_impl;

import 'dart:async' show Future;
import 'dart:html' show HttpRequest;
import 'package:angular2/di.dart';
import './xhr.dart' show XHR;

@Injectable()
class XHRImpl extends XHR {
  Future<String> get(String url) {
    return HttpRequest.request(url).then((HttpRequest req) => req.responseText,
        onError: (_) => new Future.error('Failed to load $url'));
  }
}
