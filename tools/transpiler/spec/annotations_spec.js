import {describe, it, expect} from 'test_lib/test_lib';
import {readFirstAnnotation} from './fixtures/annotations';
import {CONST} from 'facade/lang';

class Inject {}
class Bar {}

class Provide {
  @CONST()
  constructor(token) {
    this.token = token;
  }
}

class AnnotateMe {
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
  });
}
