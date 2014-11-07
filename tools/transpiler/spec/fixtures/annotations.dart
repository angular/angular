import 'dart:mirrors';

// TODO: this api does not yet return an array as we don't have
// a nice array wrapper for Dart
readFirstAnnotation(clazz) {
  return reflectClass(clazz).metadata.first.reflectee;
}
