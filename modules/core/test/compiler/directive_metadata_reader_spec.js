import {ddescribe, describe, it, iit, expect, beforeEach} from 'test_lib/test_lib';
import {DirectiveMetadataReader} from 'core/compiler/directive_metadata_reader';
import {Decorator} from 'core/annotations/annotations';
import {AnnotatedType} from 'core/compiler/annotated_type';

@Decorator({
  selector: 'someSelector'
})
class SomeDirective {
}

class SomeDirectiveWithoutAnnotation {
}

export function main() {
  describe("DirectiveMetadataReader", () => {
    var rader;

    beforeEach( () => {
      rader = new DirectiveMetadataReader();
    });

    it('should read out the annotation', () => {
      var annoatedDirective = rader.annotatedType(SomeDirective);
      expect(annoatedDirective).toEqual(
        new AnnotatedType(SomeDirective, new Decorator({selector: 'someSelector'})));
    });

    it('should throw if not matching annotation is found', () => {
      expect(() => {
        rader.annotatedType(SomeDirectiveWithoutAnnotation);
      }).toThrowError('No Directive annotation found on SomeDirectiveWithoutAnnotation');
    });

  });
}