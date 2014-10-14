library element_injector_benchmark;

import './instantiate_benchmark.dart' as ib;
import 'dart:js' as js;

main () {
  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": "ElementInjector.instantiate + instantiateDirectives",
      "fn": new js.JsFunction.withThis((_) => ib.run())
  }));
}