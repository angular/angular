library compiler_benchmark;

import './selector_benchmark.dart' as sbm;
import './compiler_benchmark.dart' as cbm;
import 'dart:js' as js;

main () {
  sbm.setup();
  cbm.setup();

  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": "CssSelector.parse * 1000",
      "fn": new js.JsFunction.withThis((_) => sbm.runParse())
  }));
  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": "SelectorMatcher.addSelectable * 1000",
      "fn": new js.JsFunction.withThis((_) => sbm.runAdd())
  }));
  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": "SelectorMatcher.match * 1000",
      "fn": new js.JsFunction.withThis((_) => sbm.runMatch())
  }));

  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": "Compiler.compile empty template",
      "fn": new js.JsFunction.withThis((_) => cbm.compileEmptyTemplate())
  }));
  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": "Compiler.compile 25 element no bindings",
      "fn": new js.JsFunction.withThis((_) => cbm.compile25ElementsNoBindings())
  }));
  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": "Compiler.compile 25 element with bindings",
      "fn": new js.JsFunction.withThis((_) => cbm.compile25ElementsWithBindings())
  }));
}