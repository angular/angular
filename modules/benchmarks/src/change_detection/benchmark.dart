library benchmark;

import './change_detection_benchmark.dart' as cdb;
import 'dart:js' as js;

main () {
  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": "Change Detection",
      "fn": new js.JsFunction.withThis((_) => cdb.run())
  }));
}