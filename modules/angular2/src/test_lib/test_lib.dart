library test_lib.test_lib;

import 'package:guinness/guinness.dart' as gns;
export 'package:guinness/guinness.dart'
    hide
        Expect,
        expect,
        NotExpect,
        beforeEach,
        it,
        iit,
        xit,
        SpyObject,
        SpyFunction;
import 'package:unittest/unittest.dart' hide expect;

import 'dart:async';

import 'package:angular2/src/dom/dom_adapter.dart' show DOM;

import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/reflection/reflection_capabilities.dart';

import 'package:angular2/src/di/binding.dart' show bind;
import 'package:angular2/src/di/injector.dart' show Injector;
import 'package:angular2/src/facade/collection.dart' show StringMapWrapper;

import './test_injector.dart';
export './test_injector.dart' show inject;

bool IS_DARTIUM = true;

List _testBindings = [];
Injector _injector;
bool _isCurrentTestAsync;
bool _inIt = false;

class AsyncTestCompleter {
  final _completer = new Completer();

  void done() {
    _completer.complete();
  }

  Future get future => _completer.future;
}

void testSetup() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  // beforeEach configuration:
  // - Priority 3: clear the bindings before each test,
  // - Priority 2: collect the bindings before each test, see beforeEachBindings(),
  // - Priority 1: create the test injector to be used in beforeEach() and it()

  gns.beforeEach(() {
    _testBindings.clear();
  }, priority: 3);

  var completerBinding = bind(AsyncTestCompleter).toFactory(() {
    // Mark the test as async when an AsyncTestCompleter is injected in an it(),
    if (!_inIt) throw 'AsyncTestCompleter can only be injected in an "it()"';
    _isCurrentTestAsync = true;
    return new AsyncTestCompleter();
  });

  gns.beforeEach(() {
    _isCurrentTestAsync = false;
    _testBindings.add(completerBinding);
    _injector = createTestInjector(_testBindings);
  }, priority: 1);
}

Expect expect(actual, [matcher]) {
  final expect = new Expect(actual);
  if (matcher != null) expect.to(matcher);
  return expect;
}

const _u = const Object();

class Expect extends gns.Expect {
  Expect(actual) : super(actual);

  NotExpect get not => new NotExpect(actual);

  void toEqual(expected) => toHaveSameProps(expected);
  void toThrowError([message = ""]) => toThrowWith(message: message);
  void toBePromise() => _expect(actual is Future, equals(true));
  void toImplement(expected) => toBeA(expected);
  void toBeNaN() => _expect(double.NAN.compareTo(actual) == 0, equals(true));
  void toHaveText(expected) => _expect(elementText(actual), expected);
  void toHaveBeenCalledWith([a = _u, b = _u, c = _u, d = _u, e = _u, f = _u]) =>
      _expect(_argsMatch(actual, a, b, c, d, e, f), true,
          reason: 'method invoked with correct arguments');
  Function get _expect => gns.guinness.matchers.expect;

  // TODO(tbosch): move this hack into Guinness
  _argsMatch(spyFn, [a0 = _u, a1 = _u, a2 = _u, a3 = _u, a4 = _u, a5 = _u]) {
    var calls = spyFn.calls;
    final toMatch = _takeDefined([a0, a1, a2, a3, a4, a5]);
    if (calls.isEmpty) {
      return false;
    } else {
      gns.SamePropsMatcher matcher = new gns.SamePropsMatcher(toMatch);
      for (var i = 0; i < calls.length; i++) {
        var call = calls[i];
        // TODO: create a better error message, not just 'Expected: <true> Actual: <false>'.
        // For hacking this is good:
        // print(call.positionalArguments);
        if (matcher.matches(call.positionalArguments, null)) {
          return true;
        }
      }
      return false;
    }
  }

  List _takeDefined(List iter) => iter.takeWhile((_) => _ != _u).toList();
}

class NotExpect extends gns.NotExpect {
  NotExpect(actual) : super(actual);

  void toEqual(expected) => toHaveSameProps(expected);
  void toBePromise() => _expect(actual is Future, equals(false));
  void toBeNull() => _expect(actual == null, equals(false));
  Function get _expect => gns.guinness.matchers.expect;
}

void beforeEach(fn) {
  if (fn is! FunctionWithParamTokens) fn = new FunctionWithParamTokens([], fn);
  gns.beforeEach(() {
    fn.execute(_injector);
  });
}

/**
 * Allows overriding default bindings defined in test_injector.js.
 *
 * The given function must return a list of DI bindings.
 *
 * Example:
 *
 *   beforeEachBindings(() => [
 *     bind(Compiler).toClass(MockCompiler),
 *     bind(SomeToken).toValue(myValue),
 *   ]);
 */
void beforeEachBindings(Function fn) {
  gns.beforeEach(() {
    var bindings = fn();
    if (bindings != null) _testBindings.addAll(bindings);
  }, priority: 2);
}

void _it(gnsFn, name, fn) {
  if (fn is! FunctionWithParamTokens) fn = new FunctionWithParamTokens([], fn);
  gnsFn(name, () {
    _inIt = true;
    fn.execute(_injector);
    _inIt = false;
    if (_isCurrentTestAsync) return _injector.get(AsyncTestCompleter).future;
  });
}

void it(name, fn) {
  _it(gns.it, name, fn);
}

void iit(name, fn) {
  _it(gns.iit, name, fn);
}

void xit(name, fn) {
  _it(gns.xit, name, fn);
}

class SpyFunction extends gns.SpyFunction {
  SpyFunction(String name) : super(name);

  // TODO: vsavkin move to guinness
  andReturn(value) {
    return andCallFake(([a0, a1, a2, a3, a4, a5]) => value);
  }
}

class SpyObject extends gns.SpyObject {
  final Map<String, SpyFunction> _spyFuncs = {};

  SpyObject([arg]) {}

  SpyFunction spy(String funcName) =>
      _spyFuncs.putIfAbsent(funcName, () => new SpyFunction(funcName));

  static stub([object = null, config = null, overrides = null]) {
    if (object is! SpyObject) {
      overrides = config;
      config = object;
      object = new SpyObject();
    }

    var m = StringMapWrapper.merge(config, overrides);
    StringMapWrapper.forEach(m, (value, key) {
      object.spy(key).andReturn(value);
    });
    return object;
  }
}

String elementText(n) {
  hasNodes(n) {
    var children = DOM.childNodes(n);
    return children != null && children.length > 0;
  }

  if (n is Iterable) {
    return n.map((nn) => elementText(nn)).join("");
  }

  if (DOM.isCommentNode(n)) {
    return '';
  }

  if (DOM.isElementNode(n) && DOM.tagName(n) == 'CONTENT') {
    return elementText(DOM.getDistributedNodes(n));
  }

  if (DOM.hasShadowRoot(n)) {
    return elementText(DOM.childNodesAsList(DOM.getShadowRoot(n)));
  }

  if (hasNodes(n)) {
    return elementText(DOM.childNodesAsList(n));
  }

  return DOM.getText(n);
}

bool isInInnerZone() => Zone.current['_innerZone'] == true;
