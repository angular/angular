library facade.di.reflector;

import 'dart:mirrors';
import 'annotations.dart' show Inject, InjectFuture, InjectLazy;
import 'key.dart' show Key, Dependency;
import 'exceptions.dart' show NoAnnotationError;

class Reflector {
  factoryFor(Type type) {
    return _generateFactory(type);
  }

  convertToFactory(Function factory) {
    return (args) => Function.apply(factory, args);
  }

  Function _generateFactory(Type type) {
    ClassMirror classMirror = reflectType(type);
    MethodMirror ctor = classMirror.declarations[classMirror.simpleName];
    Function create = classMirror.newInstance;
    Symbol name = ctor.constructorName;
    return (args) => create(name, args).reflectee;
  }

  dependencies(Type type) {
    ClassMirror classMirror = reflectType(type);
    MethodMirror ctor = classMirror.declarations[classMirror.simpleName];

    return new List.generate(ctor.parameters.length, (int pos) {
      ParameterMirror p = ctor.parameters[pos];

      final metadata = p.metadata.map((m) => m.reflectee);

      var inject = metadata.firstWhere((m) => m is Inject, orElse: () => null);
      var injectFuture = metadata.firstWhere((m) => m is InjectFuture, orElse: () => null);
      var injectLazy = metadata.firstWhere((m) => m is InjectLazy, orElse: () => null);

      if (inject != null) {
        return new Dependency(Key.get(inject.token), false, false);
      } else if (injectFuture != null) {
        return new Dependency(Key.get(injectFuture.token), true, false);
      } else if (injectLazy != null) {
        return new Dependency(Key.get(injectLazy.token), false, true);
      } else if (p.type.qualifiedName != #dynamic) {
        return new Dependency(Key.get(p.type.reflectedType), false, false);
      } else {
        throw new NoAnnotationError(type);
      }
    }, growable:false);
  }
}