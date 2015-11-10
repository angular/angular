library angular2.src.core.reflection.platform_reflection_capabilities;

import "package:angular2/src/facade/lang.dart" show Type;
import "types.dart" show GetterFn, SetterFn, MethodFn;

abstract class PlatformReflectionCapabilities {
  bool isReflectionEnabled();
  Function factory(Type type);
  List<dynamic> interfaces(Type type);
  List<List<dynamic>> parameters(dynamic type);
  List<dynamic> annotations(dynamic type);
  Map<String, List<dynamic>> propMetadata(dynamic typeOrFunc);
  GetterFn getter(String name);
  SetterFn setter(String name);
  MethodFn method(String name);
  String importUri(Type type);
}
