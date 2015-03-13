library angular2.src.transform.template_parser.recording_reflection_capabilities;

import 'package:angular2/src/reflection/reflection_capabilities.dart';
import 'package:angular2/src/reflection/types.dart';

class RecordingReflectionCapabilities implements ReflectionCapabilities {
  void _notImplemented(String name) {
    throw 'Not implemented: $name';
  }

  final List<String> getterNames = [];
  final List<String> setterNames = [];
  final List<String> methodNames = [];

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
