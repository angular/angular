// This file is not generated,
// but should be in the future.
//
// Problems:
// - Dart requires annotations to be const (which makes sense).
//   Right now, I can't describe that in ES6.
// - operator mapping `is`/`instanceof` is not yet implemented
import 'dart:mirrors';

import '../annotations_spec.dart';

class Provide {
  final token;
  const Provide(this.token);
}

readAnnotation(clazz) {
  return reflectClass(clazz).metadata.first.reflectee;
}

main() {
  // Assert `Foo` class has `Provide` annotation.
  // TODO(vojta): test this more.
  var clazz = readAnnotation(Foo);
  assert(clazz is Provide);
}