/// This file contains tests that make sense only in Dart
library angular2.test.di.key_dart_spec;

import 'package:angular2/test_lib.dart';
import 'package:angular2/core.dart';
import 'package:angular2/src/core/di/key.dart';

main() {
  describe('TypeLiteral', () {
    it('contains type', () {
      var t = new TypeLiteral<List<int>>();
      expect('${t.type}').toEqual('List<int>');
    });

    it('can be a constant', () {
      var a = const TypeLiteral<List<int>>();
      var b = const TypeLiteral<List<int>>();
      expect(identical(a, b)).toBe(true);
    });

    it('can be unique', () {
      var a = const TypeLiteral<List<String>>();
      var b = const TypeLiteral<List<int>>();
      expect(identical(a, b)).toBe(false);
    });
  });

  describe('Key', () {
    KeyRegistry registry;

    beforeEach(() {
      registry = new KeyRegistry();
    });

    it('understands TypeLiteral', () {
      var k = registry.get(const TypeLiteral<List<int>>());
      expect('${k.token}').toEqual('List<int>');
    });
  });
}
