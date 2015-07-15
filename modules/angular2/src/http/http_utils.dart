library angular2.src.http.http_utils;
import 'dart:js' show JsObject;
import 'dart:collection' show LinkedHashMap, LinkedHashSet;

bool isJsObject(o) {
  return o is JsObject || o is LinkedHashMap || o is LinkedHashSet;
}
