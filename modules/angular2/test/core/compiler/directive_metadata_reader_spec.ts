import {ddescribe, describe, it, iit, expect, beforeEach} from 'angular2/test_lib';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {Directive} from 'angular2/annotations';
import * as dirAnn from 'angular2/src/core/annotations_impl/annotations';

@Directive({selector: 'someDirective'})
class SomeDirective {
}

class SomeDirectiveWithoutAnnotation {}

export function main() {
  describe("DirectiveResolver", () => {
    var reader;

    beforeEach(() => { reader = new DirectiveResolver(); });

    it('should read out the Directive annotation', () => {
      var directiveMetadata = reader.resolve(SomeDirective);
      expect(directiveMetadata).toEqual(new dirAnn.Directive({selector: 'someDirective'}));
    });

    it('should throw if not matching annotation is found', () => {
      expect(() => { reader.resolve(SomeDirectiveWithoutAnnotation); })
          .toThrowError('No Directive annotation found on SomeDirectiveWithoutAnnotation');
    });
  });
}
