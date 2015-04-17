library reflection.reflection_capabilities;

import 'reflection.dart';
import 'types.dart';
import 'dart:mirrors';

class ReflectionCapabilities {
  Function factory(Type type) {
    ClassMirror classMirror = reflectType(type);
    MethodMirror ctor = classMirror.declarations[classMirror.simpleName];
    Function create = classMirror.newInstance;
    Symbol name = ctor.constructorName;
    int length = ctor.parameters.length;

    switch (length) {
      case 0:
        return () => create(name, []).reflectee;
      case 1:
        return (a1) => create(name, [a1]).reflectee;
      case 2:
        return (a1, a2) => create(name, [a1, a2]).reflectee;
      case 3:
        return (a1, a2, a3) => create(name, [a1, a2, a3]).reflectee;
      case 4:
        return (a1, a2, a3, a4) => create(name, [a1, a2, a3, a4]).reflectee;
      case 5:
        return (a1, a2, a3, a4, a5) =>
            create(name, [a1, a2, a3, a4, a5]).reflectee;
      case 6:
        return (a1, a2, a3, a4, a5, a6) =>
            create(name, [a1, a2, a3, a4, a5, a6]).reflectee;
      case 7:
        return (a1, a2, a3, a4, a5, a6, a7) =>
            create(name, [a1, a2, a3, a4, a5, a6, a7]).reflectee;
      case 8:
        return (a1, a2, a3, a4, a5, a6, a7, a8) =>
            create(name, [a1, a2, a3, a4, a5, a6, a7, a8]).reflectee;
      case 9:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9) =>
            create(name, [a1, a2, a3, a4, a5, a6, a7, a8, a9]).reflectee;
      case 10:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) =>
            create(name, [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10]).reflectee;
    }

    throw "Factory cannot take more than 10 arguments";
  }

  List<List> parameters(typeOrFunc) {
    final parameters = typeOrFunc is Type
        ? _constructorParameters(typeOrFunc)
        : _functionParameters(typeOrFunc);
    return parameters.map(_convertParameter).toList();
  }

  List _convertParameter(ParameterMirror p) {
    var t = p.type.reflectedType;
    var res = t == dynamic ? [] : [t];
    res.addAll(p.metadata.map((m) => m.reflectee));
    return res;
  }

  List annotations(typeOrFunc) {
    final meta = typeOrFunc is Type
        ? _constructorMetadata(typeOrFunc)
        : _functionMetadata(typeOrFunc);

    return meta.map((m) => m.reflectee).toList();
  }

  GetterFn getter(String name) {
    var symbol = new Symbol(name);
    return (receiver) => reflect(receiver).getField(symbol).reflectee;
  }

  SetterFn setter(String name) {
    var symbol = new Symbol(name);
    return (receiver, value) =>
        reflect(receiver).setField(symbol, value).reflectee;
  }

  MethodFn method(String name) {
    var symbol = new Symbol(name);
    return (receiver, posArgs) =>
        reflect(receiver).invoke(symbol, posArgs).reflectee;
  }

  List _functionParameters(Function func) {
    var closureMirror = reflect(func);
    return closureMirror.function.parameters;
  }

  List _constructorParameters(Type type) {
    ClassMirror classMirror = reflectType(type);
    MethodMirror ctor = classMirror.declarations[classMirror.simpleName];
    return ctor.parameters;
  }

  List _functionMetadata(Function func) {
    var closureMirror = reflect(func);
    return closureMirror.function.metadata;
  }

  List _constructorMetadata(Type type) {
    ClassMirror classMirror = reflectType(type);
    return classMirror.metadata;
  }
}
