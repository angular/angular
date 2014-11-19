library benchmarks.benchpress;

import 'dart:js' as js;
import 'dart:html';
import 'dart:async';

// TODO: move the functionality of this module into benchpress and replace this
// file with a Dart wrapper!

var _benchmarkNames = [];

_benchmarkId(index) {
  return "benchmark${index}";
}

_useBenchmark(index) {
  var search = window.location.search;
  if (search.length > 0) {
    search = search.substring(1);
  }
  if (search.length > 0) {
    return search == _benchmarkId(index);
  } else {
    return true;
  }
}

_onLoad(callback) {
  var isReady = document.readyState == 'complete';
  if (isReady) {
    Timer.run(callback);
  } else {
    window.addEventListener('load', (event) => callback(), false);
  }
}

_createBenchmarkMenu() {
  var div = document.createElement('div');
  div.innerHtml += '<h1>Benchmarks:</h1><a class="btn btn-default" href="?">All</a>';
  for (var i=0; i<_benchmarkNames.length; i++) {
    var activeClass = _useBenchmark(i) ? 'active' : '';
    div.innerHtml += '<a class="btn btn-default ${activeClass}" href="?${_benchmarkId(i)}">${_benchmarkNames[i]}</a>';
  }
  document.body.insertBefore(div, document.body.childNodes[0]);
}

benchmark(name, stepsCreationCallback) {
  _benchmarkNames.add(name);
  if (_benchmarkNames.length == 2) {
    _onLoad(_createBenchmarkMenu);
  }
  if (_useBenchmark(_benchmarkNames.length-1)) {
    stepsCreationCallback();
  }
}

benchmarkStep(name, callback) {
  var benchmarkName = _benchmarkNames[_benchmarkNames.length-1];
  js.context['benchmarkSteps'].add(new js.JsObject.jsify({
      "name": benchmarkName + '#' + name,
      "fn": new js.JsFunction.withThis((_) => callback())
  }));
}
