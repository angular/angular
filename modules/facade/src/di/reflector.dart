library facade.di.reflector;

import 'dart:mirrors';

class Inject {
  final Object token;
  const Inject(this.token);
}

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

      if (p.type.qualifiedName == #dynamic) {
        var name = MirrorSystem.getName(p.simpleName);
        throw "Error getting params for '$type': "
          "The '$name' parameter must be typed";
      }

      if (p.type is TypedefMirror) {
        throw "Typedef '${p.type}' in constructor "
        "'${classMirror.simpleName}' is not supported.";
      }

      ClassMirror pTypeMirror = (p.type as ClassMirror);
      var pType = pTypeMirror.reflectedType;

      final inject = p.metadata.map((m) => m.reflectee).where((m) => m is Inject);

      if (inject.isNotEmpty) {
        return inject.first.token;
      } else {
        return pType;
      }
    }, growable:false);
  }
}