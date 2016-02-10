/**
 * Annotation for a @OneOf([]) property. For now, this only works in TypeScript.
 * TODO(hansl): Implement this properly in Dart.
 */
class OneOf {
  const OneOf(List<String> values);
}
