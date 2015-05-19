library reflection.reflection;

import 'reflector.dart';
import 'types.dart';
export 'reflector.dart';
import 'platform_reflection_capabilities.dart';
import 'package:angular2/src/facade/lang.dart';

class NoReflectionCapabilities implements PlatformReflectionCapabilities {
  Function factory(Type type) {
    throw "Cannot find reflection information on ${stringify(type)}";
  }

  List interfaces(Type type) {
    throw "Cannot find reflection information on ${stringify(type)}";
  }

  List parameters(Type type) {
    throw "Cannot find reflection information on ${stringify(type)}";
  }

  List annotations(Type type) {
    throw "Cannot find reflection information on ${stringify(type)}";
  }

  GetterFn getter(String name) {
    throw "Cannot find getter ${name}";
  }

  SetterFn setter(String name) {
    throw "Cannot find setter ${name}";
  }

  MethodFn method(String name) {
    throw "Cannot find method ${name}";
  }
}

final Reflector reflector = new Reflector(new NoReflectionCapabilities());
