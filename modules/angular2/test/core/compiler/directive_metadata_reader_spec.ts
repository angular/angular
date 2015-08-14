import {ddescribe, describe, it, iit, expect, beforeEach} from 'angular2/test_lib';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {DirectiveMetadata, Directive} from 'angular2/metadata';

@Directive({selector: 'someDirective'})
class SomeDirective {
}

@Directive({selector: 'someChildDirective'})
class SomeChildDirective extends SomeDirective {
}

class SomeDirectiveWithoutAnnotation {}

export function main() {
  describe("DirectiveResolver", () => {
    var reader;

    beforeEach(() => { reader = new DirectiveResolver(); });

    it('should read out the Directive annotation', () => {
      var directiveMetadata = reader.resolve(SomeDirective);
      expect(directiveMetadata).toEqual(new Directive({selector: 'someDirective'}));
    });

    it('should throw if not matching annotation is found', () => {
      expect(() => { reader.resolve(SomeDirectiveWithoutAnnotation); })
          .toThrowError('No Directive annotation found on SomeDirectiveWithoutAnnotation');
    });

    it('should not read parent class Directive annotations', function() {
      var directiveMetadata = reader.resolve(SomeChildDirective);
      expect(directiveMetadata).toEqual(new Directive({selector: 'someChildDirective'}));
    });
  });
}
