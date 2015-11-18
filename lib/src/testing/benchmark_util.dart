library angular2.src.testing.benchmark_util;

import "package:angular2/src/platform/browser/browser_adapter.dart"
    show BrowserDomAdapter;
import "package:angular2/src/facade/browser.dart" show document, window;
import "package:angular2/src/facade/lang.dart" show NumberWrapper, isBlank;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;

var DOM = new BrowserDomAdapter();
getIntParameter(String name) {
  return NumberWrapper.parseInt(getStringParameter(name), 10);
}

getStringParameter(String name) {
  var els = DOM.querySelectorAll(document, '''input[name="${ name}"]''');
  var value;
  var el;
  for (var i = 0; i < els.length; i++) {
    el = els[i];
    var type = DOM.type(el);
    if ((type != "radio" && type != "checkbox") || DOM.getChecked(el)) {
      value = DOM.getValue(el);
      break;
    }
  }
  if (isBlank(value)) {
    throw new BaseException(
        '''Could not find and input field with name ${ name}''');
  }
  return value;
}

bindAction(String selector, Function callback) {
  var el = DOM.querySelector(document, selector);
  DOM.on(el, "click", (_) {
    callback();
  });
}

microBenchmark(name, iterationCount, callback) {
  var durationName = '''${ name}/${ iterationCount}''';
  window.console.time(durationName);
  callback();
  window.console.timeEnd(durationName);
}

void windowProfile(String name) {
  ((window.console as dynamic)).profile(name);
}

void windowProfileEnd(String name) {
  ((window.console as dynamic)).profileEnd(name);
}
