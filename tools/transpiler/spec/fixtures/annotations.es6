// TODO: this api does not yet return an array as we don't have
// a nice array wrapper for Dart
export function readFirstAnnotation(clazz) {
  return clazz.annotations[0];
}
