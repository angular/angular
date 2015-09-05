library angular2.core.util.decorators;

import 'dart:mirrors';

class ReflectRegistry {
  List<Type> getForAnnotation(Type annotation) {
    List<Type> list = new List<Type>();
    currentMirrorSystem().libraries.forEach((uri, lib) {
      lib.declarations.forEach((s, decl) {
        decl.metadata.where((m) => m.type.reflectedType == annotation).forEach((m) {
          list.add(decl.reflectedType);
        });
      });
    });
    return list;
  }
}

ReflectRegistry reflectRegistry = new ReflectRegistry();
