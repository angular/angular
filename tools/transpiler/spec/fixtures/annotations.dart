import 'dart:mirrors';

// This class is not generated,
// but should be in the future.
//
// Problems:
// - Dart requires annotations to be const (which makes sense).
//   Right now, I can't describe that in ES6.
class Provide {
  final token;
  const Provide(this.token);
}

class CONST {
  const CONST();
}

// TODO: this api does not yet return an array as we don't have
// a nice array wrapper for Dart
readFirstAnnotation(clazz) {
  return reflectClass(clazz).metadata.first.reflectee;
}
