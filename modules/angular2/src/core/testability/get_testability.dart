library testability.get_testability;

import './testability.dart';

import 'dart:html';
import 'dart:js' as js;

// Work around http://dartbug.com/17752, copied from
// https://github.com/angular/angular.dart/blob/master/lib/introspection.dart
// Proxies a Dart function that accepts up to 10 parameters.
js.JsFunction _jsFunction(Function fn) {
  const Object X = __varargSentinel;
  return new js.JsFunction.withThis((thisArg,
      [o1 = X,
      o2 = X,
      o3 = X,
      o4 = X,
      o5 = X,
      o6 = X,
      o7 = X,
      o8 = X,
      o9 = X,
      o10 = X]) {
    return __invokeFn(fn, o1, o2, o3, o4, o5, o6, o7, o8, o9, o10);
  });
}

const Object __varargSentinel = const Object();

__invokeFn(fn, o1, o2, o3, o4, o5, o6, o7, o8, o9, o10) {
  var args = [o1, o2, o3, o4, o5, o6, o7, o8, o9, o10];
  while (args.length > 0 && identical(args.last, __varargSentinel)) {
    args.removeLast();
  }
  return _jsify(Function.apply(fn, args));
}

// Helper function to JSify a Dart object.  While this is *required* to JSify
// the result of a scope.eval(), other uses are not required and are used to
// work around http://dartbug.com/17752 in a convenient way (that bug affects
// dart2js in checked mode.)
_jsify(var obj) {
  if (obj == null || obj is js.JsObject) {
    return obj;
  }
  if (obj is _JsObjectProxyable) {
    return obj._toJsObject();
  }
  if (obj is Function) {
    return _jsFunction(obj);
  }
  if ((obj is Map) || (obj is Iterable)) {
    var mappedObj = (obj is Map)
        ? new Map.fromIterables(obj.keys, obj.values.map(_jsify))
        : obj.map(_jsify);
    if (obj is List) {
      return new js.JsArray.from(mappedObj);
    } else {
      return new js.JsObject.jsify(mappedObj);
    }
  }
  return obj;
}

abstract class _JsObjectProxyable {
  js.JsObject _toJsObject();
}

class PublicTestability implements _JsObjectProxyable {
  Testability _testability;
  PublicTestability(Testability testability) {
    this._testability = testability;
  }

  whenStable(Function callback) {
    return this._testability.whenStable(callback);
  }

  findBindings(Element elem, String binding, bool exactMatch) {
    return this._testability.findBindings(elem, binding, exactMatch);
  }

  js.JsObject _toJsObject() {
    return _jsify({
      'findBindings': (bindingString, [exactMatch, allowNonElementNodes]) =>
          findBindings(bindingString, exactMatch, allowNonElementNodes),
      'whenStable': (callback) => whenStable(() => callback.apply([])),
    })..['_dart_'] = this;
  }
}

class GetTestability {
  static addToWindow(TestabilityRegistry registry) {
    js.context['getAngularTestability'] = _jsify((Element elem) {
      Testability testability = registry.findTestabilityInTree(elem);
      return _jsify(new PublicTestability(testability));
    });
    js.context['getAllAngularTestabilities'] = _jsify(() {
      List<Testability> testabilities = registry.getAllTestabilities();
      var publicTestabilities = testabilities
          .map((testability) => new PublicTestability(testability));
      return _jsify(publicTestabilities);
    });
  }
}
