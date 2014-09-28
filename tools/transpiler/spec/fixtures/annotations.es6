// This class is not generated,
// but should be in the future.
//
// Problems:
// - Dart requires annotations to be const (which makes sense).
//   Right now, I can't describe that in ES6.
export class Provide {
  constructor(token) {
    this.token = token;
  }
}


// TODO: this api does not yet return an array as we don't have
// a nice array wrapper for Dart
export function readFirstAnnotation(clazz) {
  return clazz.annotations[0];
}
