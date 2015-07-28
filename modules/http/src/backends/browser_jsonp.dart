library angular2_http.src.backends.browser_jsonp;

import 'package:angular2/di.dart';
import 'dart:html' show document;
import 'dart:js' show context, JsObject, JsArray;

int _nextRequestId = 0;
const JSONP_HOME = '__ng_jsonp__';

var _jsonpConnections = null;

JsObject _getJsonpConnections() {
  if (_jsonpConnections == null) {
    _jsonpConnections = context[JSONP_HOME] = new JsObject(context['Object']);
  }
  return _jsonpConnections;
}

// Make sure not to evaluate this in a non-browser environment!
@Injectable()
class BrowserJsonp {
  // Construct a <script> element with the specified URL
  dynamic build(String url) {
    var node = document.createElement('script');
    node.src = url;
    return node;
  }

  nextRequestID() {
    return "__req${_nextRequestId++}";
  }

  requestCallback(String id) {
    return """${JSONP_HOME}.${id}.finished""";
  }

  exposeConnection(String id, dynamic connection) {
    var connections = _getJsonpConnections();
    var wrapper = new JsObject(context['Object']);

    wrapper['_id'] = id;
    wrapper['__dart__'] = connection;
    wrapper['finished'] = ([dynamic data]) => connection.finished(data);

    connections[id] = wrapper;
  }

  removeConnection(String id) {
    var connections = _getJsonpConnections();
    connections[id] = null;
  }

  // Attach the <script> element to the DOM
  send(dynamic node) {
    document.body.append(node);
  }

  // Remove <script> element from the DOM
  cleanup(dynamic node) {
    node.remove();
  }
}
