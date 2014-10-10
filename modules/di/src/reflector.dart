library facade.di.reflector;

import 'dart:mirrors';
import 'annotations.dart' show Inject, InjectPromise, InjectLazy;
import 'key.dart' show Key;
import 'binding.dart' show Dependency;
import 'exceptions.dart' show NoAnnotationError;

class Reflector {
  Function factoryFor(Type type) {
    return _generateFactory(type);
  }

  Function convertToFactory(Function factory) {
    return (args) => Function.apply(factory, args);
  }

  Function _generateFactory(Type type) {
    ClassMirror classMirror = reflectType(type);
    MethodMirror ctor = classMirror.declarations[classMirror.simpleName];
    Function create = classMirror.newInstance;
    Symbol name = ctor.constructorName;
    return (args) => create(name, args).reflectee;
  }

  List<Dependency> dependencies(typeOrFunc) {
    final parameters = typeOrFunc is Type ?
        _constructorParameters(typeOrFunc) :
        _functionParameters(typeOrFunc);

    return new List.generate(parameters.length, (int pos) {
      ParameterMirror p = parameters[pos];

      final metadata = p.metadata.map((m) => m.reflectee);

      var inject = metadata.firstWhere((m) => m is Inject, orElse: () => null);
      var injectPromise = metadata.firstWhere((m) => m is InjectPromise, orElse: () => null);
      var injectLazy = metadata.firstWhere((m) => m is InjectLazy, orElse: () => null);

      if (inject != null) {
        return new Dependency(Key.get(inject.token), false, false);

      } else if (injectPromise != null) {
        return new Dependency(Key.get(injectPromise.token), true, false);

      } else if (injectLazy != null) {
        return new Dependency(Key.get(injectLazy.token), false, true);

      } else if (p.type.qualifiedName != #dynamic) {
        return new Dependency(Key.get(p.type.reflectedType), false, false);

      } else {
        throw new NoAnnotationError(typeOrFunc);
      }
    }, growable:false);
  }

  List<ParameterMirror> _functionParameters(Function func) {
    var closureMirror = reflect(func);
    return closureMirror.function.parameters;
  }

  List<ParameterMirror> _constructorParameters(Type type) {
    ClassMirror classMirror = reflectType(type);
    MethodMirror ctor = classMirror.declarations[classMirror.simpleName];
    return ctor.parameters;
  }
}

final Reflector reflector = new Reflector();
