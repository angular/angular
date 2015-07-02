/// This file contains tests that make sense only in Dart
library angular2.test.di.injector_dart_spec;

import 'package:angular2/test_lib.dart';
import 'package:angular2/di.dart';

main() {
  describe('Injector', () {
    it('should support TypeLiteral', () {
      var i = Injector.resolveAndCreate(
          [bind(new TypeLiteral<List<int>>()).toValue([1, 2, 3]), Foo,]);
      expect(i.get(Foo).value).toEqual([1, 2, 3]);
    });
  });
}

class Foo {
  final List<int> value;
  Foo(this.value);
}
