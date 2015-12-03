library angular2_testing.angular2_testing;

import 'package:test/test.dart';
import 'package:test/src/backend/invoker.dart';
import 'package:test/src/backend/live_test.dart';

import 'package:angular2/angular2.dart';
import 'package:angular2/src/core/di/injector.dart' show Injector;
import 'package:angular2/src/core/di/metadata.dart' show InjectMetadata;
import 'package:angular2/src/core/di/exceptions.dart' show NoAnnotationError;
import 'package:angular2/platform/browser_static.dart' show BrowserDomAdapter;
import 'package:angular2/src/core/reflection/reflection.dart';
import 'package:angular2/src/core/reflection/reflection_capabilities.dart';
import 'package:angular2/src/testing/test_injector.dart';
export 'package:angular2/src/testing/test_component_builder.dart';
export 'package:angular2/src/testing/test_injector.dart' show inject;

/// One time initialization that must be done for Angular2 component
/// tests. Call before any test methods.
///
/// Example:
///
/// ```
/// main() {
///   initAngularTests();
///   group(...);
/// }
/// ```
void initAngularTests() {
  BrowserDomAdapter.makeCurrent();
  reflector.reflectionCapabilities = new ReflectionCapabilities();
}

/// Allows overriding default bindings defined in test_injector.dart.
///
/// The given function must return a list of DI providers.
///
/// Example:
///
/// ```
/// setUpProviders(() => [
///   provide(Compiler, useClass: MockCompiler),
///   provide(SomeToken, useValue: myValue),
/// ]);
/// ```
void setUpProviders(Iterable<Provider> providerFactory()) {
  setUp(() {
    if (_currentInjector != null) {
      throw 'setUpProviders was called after the injector had '
          'been used in a setUp or test block. This invalidates the '
          'test injector';
    }
    _currentTestProviders.addAll(providerFactory());
  });
}


dynamic _runInjectableFunction(Function fn) {
  var params = reflector.parameters(fn);
  List<dynamic> tokens = <dynamic>[];
  for (var param in params) {
    var token = null;
    for (var paramMetadata in param) {
      if (paramMetadata is Type) {
        token = paramMetadata;
      } else if (paramMetadata is InjectMetadata) {
        token = paramMetadata.token;
      }
    }
    if (token == null) {
      throw new NoAnnotationError(fn, params);
    }
    tokens.add(token);
  }

  if (_currentInjector == null) {
    _currentInjector = createTestInjectorWithRuntimeCompiler(_currentTestProviders);
  }
  var injectFn = new FunctionWithParamTokens(tokens, fn, false);
  return injectFn.execute(_currentInjector);
}

/// Use the test injector to get bindings and run a function.
///
/// Example:
///
/// ```
/// ngSetUp((SomeToken token) {
///   token.init();
/// });
/// ```
void ngSetUp(Function fn) {
  setUp(() async {
    await _runInjectableFunction(fn);
  });
}

/// Add a test which can use the test injector.
///
/// Example:
///
/// ```
/// ngTest('description', (SomeToken token) {
///   expect(token, equals('expected'));
/// });
/// ```
void ngTest(String description, Function fn,
    {String testOn, Timeout timeout, skip, Map<String, dynamic> onPlatform}) {
  test(description, () async {
    await _runInjectableFunction(fn);
  }, testOn: testOn, timeout: timeout, skip: skip, onPlatform: onPlatform);
}

final _providersExpando = new Expando<List<Provider>>('Providers for the current test');
final _injectorExpando = new Expando<Injector>('Angular Injector for the current test');

List get _currentTestProviders {
  if (_providersExpando[_currentTest] == null) {
    return _providersExpando[_currentTest] = [];
  }
  return _providersExpando[_currentTest];
}
Injector get _currentInjector => _injectorExpando[_currentTest];
void set _currentInjector(Injector newInjector) {
  _injectorExpando[_currentTest] = newInjector;
}

// TODO: warning, the Invoker.current.liveTest is not a settled API and is
// subject to change in future versions of package:test.
LiveTest get _currentTest => Invoker.current.liveTest;
