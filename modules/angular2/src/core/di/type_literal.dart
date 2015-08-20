library angular2.di.type_literal;

/**
 * Use type literals as DI keys corresponding to generic types.
 *
 * Example:
 *
 * ```
 * Injector.resolveAndCreate([
 *   bind(new TypeLiteral<List<int>>()).toValue([1, 2, 3])
 * ]);
 *
 * class Foo {
 *   // Delend on `List<int>` normally.
 *   Foo(List<int> list) { ... }
 * }
 * ```
 *
 * This capability might be added to the language one day. See:
 *
 * https://code.google.com/p/dart/issues/detail?id=11923
 */
class TypeLiteral<T> {
  const TypeLiteral();
  Type get type => T;
}
