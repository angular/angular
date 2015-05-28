library angular2.src.facade.js_interop;

import 'dart:js' as js;

setGlobalVar(String name, value) {
  js.context[name] = value;
}

getGlobalVar(String name) {
  return js.context[name];
}

invokeJsFunction(js.JsFunction fn, self, args) {
  return fn.apply(args, thisArg: self);
}
