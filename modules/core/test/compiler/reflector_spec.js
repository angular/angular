import {ddescribe, describe, it, iit, expect, beforeEach} from 'test_lib/test_lib';
import {Reflector} from 'core/compiler/reflector';
import {Decorator} from 'core/annotations/decorator';
import {AnnotatedType} from 'core/compiler/annotated_type';

@Decorator({
  selector: 'someSelector'
})
class SomeDirective {
}

class SomeDirectiveWithoutAnnotation {
}

export function main() {
  describe("reflector", () => {
    var reflector;

    beforeEach( () => {
      reflector = new Reflector();
    });

    it('should read out the annotation', () => {
      var annoatedDirective = reflector.annotatedType(SomeDirective);
      expect(annoatedDirective).toEqual(
        new AnnotatedType(SomeDirective, new Decorator({selector: 'someSelector'})));
    });

    it('should throw if not matching annotation is found', () => {
      expect(() => {
        reflector.annotatedType(SomeDirectiveWithoutAnnotation);
      }).toThrowError('No Directive annotation found on SomeDirectiveWithoutAnnotation');
    });

  });
}