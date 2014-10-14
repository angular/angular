library injector_get_benchmark;

import './injector_instantiate_benchmark.dart' as b;
import 'dart:js' as js;

main () {
  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": "Injector.instantiate",
      "fn": new js.JsFunction.withThis((_) => b.run())
  }));
}