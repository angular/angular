import {describe, it, expect, iit} from 'angular2/test_lib';
import {readFirstAnnotation} from './fixtures/annotations';
import {CONST} from 'angular2/src/core/facade/lang';

class Inject {}
class Bar {}

class Provide {
  token;

  @CONST()
  constructor(token) {
    this.token = token;
  }
}

class AnnotateMe {
  maybe;

  @CONST()
  constructor({maybe = 'default'} = {}) {
    this.maybe = maybe;
  }
}


@Provide('Foo')
class Foo {
  @Inject
  constructor() {}
}

@Provide(Foo)
function baz() {}

@AnnotateMe()
class A {}

@AnnotateMe({maybe: 'yes'})
class B {}

@AnnotateMe({maybe: {'a': 'b'}})
class SomeClassWithMapInAnnotation {}

@AnnotateMe({maybe: [23]})
class SomeClassWithListInAnnotation {}

@AnnotateMe({maybe: new Provide(0)})
class SomeClassWithConstObject {}

function annotatedParams(@Inject(Foo) f, @Inject(Bar) b) {}

export function main() {
  describe('annotations', function() {
    it('should work', function() {
      // Assert `Foo` class has `Provide` annotation.
      var clazz = readFirstAnnotation(Foo);
      expect(clazz instanceof Provide).toBe(true);
    });

    it('should work with named arguments', function() {
      expect(readFirstAnnotation(A).maybe).toBe('default');
      expect(readFirstAnnotation(B).maybe).toBe('yes');
    });

    it('should work with maps in named arguments', () => {
      expect(readFirstAnnotation(SomeClassWithMapInAnnotation).maybe).toEqual({'a': 'b'});
    });

    it('should work with lists in named arguments', () => {
      expect(readFirstAnnotation(SomeClassWithListInAnnotation).maybe).toEqual([23]);
    });

    it('should work with new instances in named arguments', () => {
      expect(readFirstAnnotation(SomeClassWithConstObject).maybe).toEqual(new Provide(0));
    });
  });
}
