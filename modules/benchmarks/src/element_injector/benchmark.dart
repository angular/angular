library element_injector_benchmark;

import './instantiate_benchmark.dart' as ib;
import './instantiate_benchmark_codegen.dart' as ibc;
import './instantiate_directive_benchmark.dart' as idb;
import 'dart:js' as js;

main () {
  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": "ElementInjector.instantiate + instantiateDirectives",
      "fn": new js.JsFunction.withThis((_) => ib.run())
  }));

  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": "ElementInjector.instantiateDirectives",
      "fn": new js.JsFunction.withThis((_) => idb.run())
  }));

  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": "ElementInjector.instantiate + instantiateDirectives (codegen)",
      "fn": new js.JsFunction.withThis((_) => ibc.run())
  }));
}