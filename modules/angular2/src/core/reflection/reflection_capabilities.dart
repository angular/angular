library reflection.reflection_capabilities;

import 'package:angular2/src/core/facade/lang.dart';
import 'types.dart';
import 'dart:mirrors';
import 'platform_reflection_capabilities.dart';

var DOT_REGEX = new RegExp('\\.');

class ReflectionCapabilities implements PlatformReflectionCapabilities {
  ReflectionCapabilities([metadataReader]) {}

  bool isReflectionEnabled() {
    return true;
  }

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
      case 11:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) =>
            create(name, [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11])
                .reflectee;
      case 12:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) =>
            create(name, [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12])
                .reflectee;
      case 13:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) =>
            create(name, [
              a1,
              a2,
              a3,
              a4,
              a5,
              a6,
              a7,
              a8,
              a9,
              a10,
              a11,
              a12,
              a13
            ]).reflectee;
      case 14:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) =>
            create(name, [
              a1,
              a2,
              a3,
              a4,
              a5,
              a6,
              a7,
              a8,
              a9,
              a10,
              a11,
              a12,
              a13,
              a14
            ]).reflectee;
      case 15:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14,
                a15) =>
            create(name, [
              a1,
              a2,
              a3,
              a4,
              a5,
              a6,
              a7,
              a8,
              a9,
              a10,
              a11,
              a12,
              a13,
              a14,
              a15
            ]).reflectee;
      case 16:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14,
                a15, a16) =>
            create(name, [
              a1,
              a2,
              a3,
              a4,
              a5,
              a6,
              a7,
              a8,
              a9,
              a10,
              a11,
              a12,
              a13,
              a14,
              a15,
              a16
            ]).reflectee;
      case 17:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14,
                a15, a16, a17) =>
            create(name, [
              a1,
              a2,
              a3,
              a4,
              a5,
              a6,
              a7,
              a8,
              a9,
              a10,
              a11,
              a12,
              a13,
              a14,
              a15,
              a16,
              a17
            ]).reflectee;
      case 18:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14,
                a15, a16, a17, a18) =>
            create(name, [
              a1,
              a2,
              a3,
              a4,
              a5,
              a6,
              a7,
              a8,
              a9,
              a10,
              a11,
              a12,
              a13,
              a14,
              a15,
              a16,
              a17,
              a18
            ]).reflectee;
      case 19:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14,
                a15, a16, a17, a18, a19) =>
            create(name, [
              a1,
              a2,
              a3,
              a4,
              a5,
              a6,
              a7,
              a8,
              a9,
              a10,
              a11,
              a12,
              a13,
              a14,
              a15,
              a16,
              a17,
              a18,
              a19
            ]).reflectee;
      case 20:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14,
                a15, a16, a17, a18, a19, a20) =>
            create(name, [
              a1,
              a2,
              a3,
              a4,
              a5,
              a6,
              a7,
              a8,
              a9,
              a10,
              a11,
              a12,
              a13,
              a14,
              a15,
              a16,
              a17,
              a18,
              a19,
              a20
            ]).reflectee;
    }

    throw "Cannot create a factory for '${stringify(type)}' because its constructor has more than 20 arguments";
  }

  List<List> parameters(typeOrFunc) {
    final parameters = typeOrFunc is Type
        ? _constructorParameters(typeOrFunc)
        : _functionParameters(typeOrFunc);
    return parameters.map(_convertParameter).toList();
  }

  List _convertParameter(ParameterMirror p) {
    var t = p.type;
    var res = (!t.hasReflectedType || t.reflectedType == dynamic)
        ? []
        : [t.reflectedType];
    res.addAll(p.metadata.map((m) => m.reflectee));
    return res;
  }

  List annotations(typeOrFunc) {
    final meta = typeOrFunc is Type
        ? _constructorMetadata(typeOrFunc)
        : _functionMetadata(typeOrFunc);

    return meta.map((m) => m.reflectee).toList();
  }

  Map propMetadata(typeOrFunc) {
    final res = {};
    reflectClass(typeOrFunc).declarations.forEach((k,v) {
      var name = _normalizeName(MirrorSystem.getName(k));
      if (res[name] == null) res[name] = [];
      res[name].addAll(v.metadata.map((fm) => fm.reflectee));
    });
    return res;
  }

  String _normalizeName(String name) {
    return name.endsWith("=") ? name.substring(0, name.length - 1) : name;
  }

  List interfaces(type) {
    return _interfacesFromMirror(reflectType(type));
  }

  List _interfacesFromMirror(classMirror) {
    return classMirror.superinterfaces.map((si) => si.reflectedType).toList()
      ..addAll(classMirror.superclass == null ? []
        : _interfacesFromMirror(classMirror.superclass));
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

  String importUri(Type type) {
    return '${(reflectClass(type).owner as LibraryMirror).uri}';
  }
}
