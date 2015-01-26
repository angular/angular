library facade.jsinterop;

import 'dart:js' show context, JsObject;

class JS {
  static JsObject getContext() => context;
  static JsObject jsify(dartObj) => new JsObject.jsify(dartObj);
}
