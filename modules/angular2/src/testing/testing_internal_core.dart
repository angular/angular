library angular2.src.testing.testing_internal_core;

import 'dart:async';

import 'package:guinness2/guinness2.dart' as gns;
export 'package:guinness2/guinness2.dart'
    hide
        Expect,
        expect,
        NotExpect,
        beforeEach,
        it,
        iit,
        xit,
        describe,
        ddescribe,
        xdescribe,
        SpyObject,
        SpyFunction;

export 'matchers.dart' show expect, Expect, NotExpect;

import 'package:angular2/src/core/reflection/reflection.dart';
import 'package:angular2/src/core/reflection/reflection_capabilities.dart';

import 'package:angular2/src/core/di/provider.dart' show bind;
import 'package:angular2/src/facade/collection.dart' show StringMapWrapper;

import 'async_test_completer.dart';
export 'async_test_completer.dart' show AsyncTestCompleter;

import 'test_injector.dart';
export 'test_injector.dart' show inject;

TestInjector _testInjector = getTestInjector();
bool _inIt = false;
bool _initialized = false;
List<dynamic> _platformProviders = [];
List<dynamic> _applicationProviders = [];

void setDartBaseTestProviders(List<dynamic> platform, List<dynamic> application) {
  _platformProviders = platform;
  _applicationProviders = application;
}

void testSetup() {
  if (_initialized) {
    return;
  }
  _initialized = true;
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  setBaseTestProviders(_platformProviders, _applicationProviders);
  // beforeEach configuration:
  // - clear the bindings before each test,
  // - collect the bindings before each test, see beforeEachProviders(),
  // - create the test injector to be used in beforeEach() and it()

  gns.beforeEach(() {
    _testInjector.reset();
  });

  var completerProvider = bind(AsyncTestCompleter).toFactory(() {
    // Mark the test as async when an AsyncTestCompleter is injected in an it(),
    if (!_inIt) throw 'AsyncTestCompleter can only be injected in an "it()"';
    return new AsyncTestCompleter();
  });

  gns.beforeEach(() {
    _testInjector.addProviders([completerProvider]);
  });
}

/**
 * Allows overriding default providers defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 *   beforeEachProviders(() => [
 *     bind(Compiler).toClass(MockCompiler),
 *     bind(SomeToken).toValue(myValue),
 *   ]);
 */
void beforeEachProviders(Function fn) {
  testSetup();
  gns.beforeEach(() {
    var providers = fn();
    if (providers != null) _testInjector.addProviders(providers);
  });
}

@Deprecated('using beforeEachProviders instead')
void beforeEachBindings(Function fn) {
  beforeEachProviders(fn);
}

void beforeEach(fn) {
  testSetup();
  gns.beforeEach(fn);
}

void _it(gnsFn, name, fn) {
  testSetup();
  gnsFn(name, () {
    _inIt = true;
    var retVal = fn();
    _inIt = false;
    return retVal;
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

void describe(name, fn) {
  testSetup();
  gns.describe(name, fn);
}

void ddescribe(name, fn) {
  testSetup();
  gns.ddescribe(name, fn);
}

void xdescribe(name, fn) {
  testSetup();
  gns.xdescribe(name, fn);
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
    _spyFuncs
        .putIfAbsent("get:${funcName}", () => new SpyFunction(funcName))
        .andReturn(value);
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
