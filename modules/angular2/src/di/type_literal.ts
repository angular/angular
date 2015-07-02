/**
 * Type literals is a Dart-only feature. This is here only so we can x-compile
 * to multiple languages.
 */
export class TypeLiteral {
  get type(): any { throw new Error("Type literals are only supported in Dart"); }
}
