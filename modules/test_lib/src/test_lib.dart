library test_lib.test_lib;

import 'package:guinness/guinness_html.dart' as gns;
export 'package:guinness/guinness_html.dart';
import 'package:unittest/unittest.dart' hide expect;
import 'dart:mirrors';
import 'dart:async';
import 'package:reflection/reflection.dart';
import 'package:reflection/reflection_capabilities.dart';

bool IS_DARTIUM = true;

Expect expect(actual, [matcher]) {
  final expect = new Expect(actual);
  if (matcher != null) expect.to(matcher);
  return expect;
}

class Expect extends gns.Expect {
  Expect(actual) : super(actual);

  NotExpect get not => new NotExpect(actual);

  void toEqual(expected) => toHaveSameProps(expected);
  void toThrowError([message=""]) => this.toThrowWith(message: message);
  void toBePromise() => _expect(actual is Future, equals(true));
  Function get _expect => gns.guinness.matchers.expect;
}

class NotExpect extends gns.NotExpect {
  NotExpect(actual) : super(actual);

  void toEqual(expected) => toHaveSameProps(expected);
}

beforeEach(fn) {
  gns.beforeEach(_enableReflection(fn));
}

it(name, fn) {
  gns.it(name, _enableReflection(_handleAsync(fn)));
}

iit(name, fn) {
  gns.iit(name, _enableReflection(_handleAsync(fn)));
}

_enableReflection(fn) {
  return () {
    reflector.reflectionCapabilities = new ReflectionCapabilities();
    return fn();
  };
}

_handleAsync(fn) {
  ClosureMirror cm = reflect(fn);
  MethodMirror mm = cm.function;

  var completer = new Completer();

  if (mm.parameters.length == 1) {
    return () {
      cm.apply([completer.complete]);
      return completer.future;
    };
  }

  return fn;
}
