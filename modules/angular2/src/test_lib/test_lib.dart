library test_lib.test_lib;

import 'package:guinness/guinness_html.dart' as gns;
export 'package:guinness/guinness_html.dart' hide Expect, expect, NotExpect, beforeEach, it, iit;
import 'package:unittest/unittest.dart' hide expect;
import 'dart:mirrors';
import 'dart:async';
import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/reflection/reflection_capabilities.dart';
import 'package:collection/equality.dart';

bool IS_DARTIUM = true;

Expect expect(actual, [matcher]) {
  final expect = new Expect(actual);
  if (matcher != null) expect.to(matcher);
  return expect;
}

class Expect extends gns.Expect {
  Expect(actual) : super(actual);

  NotExpect get not => new NotExpect(actual);

  // TODO(tbosch) change back when https://github.com/vsavkin/guinness/issues/41 is fixed
  // void toEqual(expected) => toHaveSameProps(expected);
  void toEqual(expected) => _expect(actual, new FixedSamePropsMatcher(expected));
  void toThrowError([message=""]) => this.toThrowWith(message: message);
  void toBePromise() => _expect(actual is Future, equals(true));
  void toImplement(expected) => toBeA(expected);
  void toBeNaN() => _expect(double.NAN.compareTo(actual) == 0, equals(true));
  Function get _expect => gns.guinness.matchers.expect;
}

class NotExpect extends gns.NotExpect {
  NotExpect(actual) : super(actual);

  // TODO(tbosch) change back when https://github.com/vsavkin/guinness/issues/41 is fixed
  // void toEqual(expected) => toHaveSameProps(expected);
  void toEqual(expected) => _expect(actual, isNot(new FixedSamePropsMatcher(expected)));
  void toBePromise() => _expect(actual is Future, equals(false));
  Function get _expect => gns.guinness.matchers.expect;
}

beforeEach(fn) {
  gns.guinnessEnableHtmlMatchers();
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

// TODO(tbosch): remove when https://github.com/vsavkin/guinness/issues/41
// is fixed
class FixedSamePropsMatcher extends Matcher {
  final Object _expected;

  const FixedSamePropsMatcher(this._expected);

  bool matches(actual, Map matchState) {
    return compare(toData(_expected), toData(actual));
  }

  Description describeMismatch(item, Description mismatchDescription,
      Map matchState, bool verbose) =>
      mismatchDescription.add('is equal to ${toData(item)}. Expected: ${toData(_expected)}');

  Description describe(Description description) =>
      description.add('has different properties');

  toData(obj) => new _FixedObjToData().call(obj);
  compare(d1, d2) => new DeepCollectionEquality().equals(d1, d2);
}

// TODO(tbosch): remove when https://github.com/vsavkin/guinness/issues/41
// is fixed
class _FixedObjToData {
  final visitedObjects = new Set();

  call(obj) {
    if (visitedObjects.contains(obj)) return null;
    visitedObjects.add(obj);

    if (obj is num || obj is String || obj is bool) return obj;
    if (obj is Iterable) return obj.map(call).toList();
    if (obj is Map) return mapToData(obj);
    return toDataUsingReflection(obj);
  }

  mapToData(obj) {
    var res = {};
    obj.forEach((k,v) {
      res[call(k)] = call(v);
    });
    return res;
  }

  toDataUsingReflection(obj) {
    final clazz = reflectClass(obj.runtimeType);
    final instance = reflect(obj);

    return clazz.declarations.values.fold({}, (map, decl) {
      if (decl is VariableMirror && !decl.isPrivate && !decl.isStatic) {
        final field = instance.getField(decl.simpleName);
        final name = MirrorSystem.getName(decl.simpleName);
        map[name] = call(field.reflectee);
      }
      return map;
    });
  }
}
