import {describe, it, expect} from 'test_lib/test_lib';
import {Provide, readFirstAnnotation} from './fixtures/annotations';

class Inject {}
class Bar {}

@Provide('Foo')
class Foo {
  @Inject
  constructor() {}
}

@Provide(Foo)
function baz() {}

function annotatedParams(@Inject(Foo) f, @Inject(Bar) b) {}

export function main() {
  describe('annotations', function() {
    it('should work', function() {
      // Assert `Foo` class has `Provide` annotation.
      var clazz = readFirstAnnotation(Foo);
      expect(clazz instanceof Provide).toBe(true);
    });
  });
}