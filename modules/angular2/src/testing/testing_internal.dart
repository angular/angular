library angular2.src.testing.testing_internal;

import 'dart:async';

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

export 'matchers.dart' show expect, Expect, NotExpect;

import 'package:angular2/src/core/reflection/reflection.dart';
import 'package:angular2/src/core/reflection/reflection_capabilities.dart';

import 'package:angular2/src/core/di/provider.dart' show bind;
import 'package:angular2/src/core/di/injector.dart' show Injector;
import 'package:angular2/src/core/facade/collection.dart' show StringMapWrapper;

import 'test_injector.dart';
export 'test_injector.dart' show inject;

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
void beforeEachProviders(Function fn) {
  gns.beforeEach(() {
    var bindings = fn();
    if (bindings != null) _testBindings.addAll(bindings);
  }, priority: 2);
}

@Deprecated('using beforeEachProviders instead')
void beforeEachBindings(Function fn) {
  beforeEachProviders(fn);
}

void beforeEach(fn) {
  if (fn is! FunctionWithParamTokens) fn = new FunctionWithParamTokens([], fn, false);
  gns.beforeEach(() {
    fn.execute(_injector);
  });
}

void _it(gnsFn, name, fn) {
  if (fn is! FunctionWithParamTokens) fn = new FunctionWithParamTokens([], fn, false);
  gnsFn(name, () {
    _inIt = true;
    fn.execute(_injector);
    _inIt = false;
    if (_isCurrentTestAsync) return _injector.get(AsyncTestCompleter).future;
  });
}

void it(name, fn, [timeOut = null]) {
  _it(gns.it, name, fn);
}

void iit(name, fn, [timeOut = null]) {
  _it(gns.iit, name, fn);
}

void xit(name, fn, [timeOut = null]) {
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

  void prop(String funcName, value) {
    _spyFuncs.putIfAbsent("get:${funcName}", () => new SpyFunction(funcName)).andReturn(value);
  }

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

bool isInInnerZone() => Zone.current['_innerZone'] == true;
