library angular2.transform.template_compiler.recording_reflection_capabilities;

import 'package:angular2/src/reflection/reflection_capabilities.dart';
import 'package:angular2/src/reflection/types.dart';

/// ReflectionCapabilities object that records requests for `getter`s,
/// `setter`s, and `method`s so these can be code generated rather than
/// reflectively accessed at runtime.
class RecordingReflectionCapabilities implements ReflectionCapabilities {
  /// The names of all requested `getter`s.
  final List<String> getterNames = [];
  /// The names of all requested `setter`s.
  final List<String> setterNames = [];
  /// The names of all requested `method`s.
  final List<String> methodNames = [];

  void _notImplemented(String name) {
    throw 'Not implemented: $name';
  }

  Function factory(Type type) => _notImplemented('factory');

  List<List> parameters(typeOrFunc) => _notImplemented('parameters');

  List annotations(typeOrFunc) => _notImplemented('annotations');

  static GetterFn _nullGetter = (Object p) => null;
  static SetterFn _nullSetter = (Object p, v) => null;
  static MethodFn _nullMethod = (Object p, List a) => null;

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
