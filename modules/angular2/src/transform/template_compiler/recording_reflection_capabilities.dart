library angular2.transform.template_compiler.recording_reflection_capabilities;

import 'package:angular2/src/reflection/reflection_capabilities.dart';
import 'package:angular2/src/reflection/types.dart';

/// ReflectionCapabilities object that records requests for `getter`s,
/// `setter`s, and `method`s so these can be code generated rather than
/// reflectively accessed at runtime.
class RecordingReflectionCapabilities implements ReflectionCapabilities {
  /// The names of all requested `getter`s.
  final Set<String> getterNames = new Set<String>();
  /// The names of all requested `setter`s.
  final Set<String> setterNames = new Set<String>();
  /// The names of all requested `method`s.
  final Set<String> methodNames = new Set<String>();

  _notImplemented(String name) => throw 'Not implemented: $name';

  Function factory(Type type) => _notImplemented('factory');

  List<List> parameters(typeOrFunc) => _notImplemented('parameters');

  List annotations(typeOrFunc) => _notImplemented('annotations');

  GetterFn getter(String name) {
    getterNames.add(name);
    return _nullGetter;
  }

  SetterFn setter(String name) {
    setterNames.add(name);
    return _nullSetter;
  }

  MethodFn method(String name) {
    methodNames.add(name);
    return _nullMethod;
  }
}

_nullGetter(Object p) => null;
_nullSetter(Object p, v) => null;
_nullMethod(Object p, List a) => null;
