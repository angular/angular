library facade.di.reflector;

import 'dart:mirrors';
import 'annotations.dart' show Inject, InjectPromise, InjectLazy, DependencyAnnotation;
import 'key.dart' show Key;
import 'binding.dart' show Dependency;
import 'exceptions.dart' show NoAnnotationError;

class Reflector {
  Function factoryFor(Type type) {
    ClassMirror classMirror = reflectType(type);
    MethodMirror ctor = classMirror.declarations[classMirror.simpleName];
    Function create = classMirror.newInstance;
    Symbol name = ctor.constructorName;
    int length = ctor.parameters.length;

    switch (length) {
      case 0: return () =>
          create(name, []).reflectee;
      case 1: return (a1) =>
          create(name, [a1]).reflectee;
      case 2: return (a1, a2) =>
          create(name, [a1, a2]).reflectee;
      case 3: return (a1, a2, a3) =>
          create(name, [a1, a2, a3]).reflectee;
      case 4: return (a1, a2, a3, a4) =>
          create(name, [a1, a2, a3, a4]).reflectee;
      case 5: return (a1, a2, a3, a4, a5) =>
          create(name, [a1, a2, a3, a4, a5]).reflectee;
      case 6: return (a1, a2, a3, a4, a5, a6) =>
          create(name, [a1, a2, a3, a4, a5, a6]).reflectee;
      case 7: return (a1, a2, a3, a4, a5, a6, a7) =>
          create(name, [a1, a2, a3, a4, a5, a6, a7]).reflectee;
      case 8: return (a1, a2, a3, a4, a5, a6, a7, a8) =>
          create(name, [a1, a2, a3, a4, a5, a6, a7, a8]).reflectee;
      case 9: return (a1, a2, a3, a4, a5, a6, a7, a8, a9) =>
          create(name, [a1, a2, a3, a4, a5, a6, a7, a8, a9]).reflectee;
      case 10: return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) =>
          create(name, [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10]).reflectee;
    };

    throw "Factory cannot take more than 10 arguments";
  }

  invoke(Function factory, List args) {
    return Function.apply(factory, args);
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
        return new Dependency(Key.get(inject.token), false, false, []);

      } else if (injectPromise != null) {
        return new Dependency(Key.get(injectPromise.token), true, false, []);

      } else if (injectLazy != null) {
        return new Dependency(Key.get(injectLazy.token), false, true, []);

      } else if (p.type.qualifiedName != #dynamic) {
        var depProps = metadata.where((m) => m is DependencyAnnotation).toList();
        return new Dependency(Key.get(p.type.reflectedType), false, false, depProps);

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
