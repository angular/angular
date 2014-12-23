import {ddescribe, describe, it, iit, expect, beforeEach} from 'test_lib/test_lib';
import {DirectiveMetadataReader} from 'core/compiler/directive_metadata_reader';
import {Decorator, Component} from 'core/annotations/annotations';
import {DirectiveMetadata} from 'core/compiler/directive_metadata';
import {ShadowDomEmulated, ShadowDomNative} from 'core/compiler/shadow_dom';

@Decorator({
  selector: 'someSelector'
})
class SomeDirective {
}

@Component({
  selector: 'someSelector'
})
class ComponentWithoutExplicitShadowDomStrategy {}

@Component({
  selector: 'someSelector',
  shadowDom: ShadowDomEmulated
})
class ComponentWithExplicitShadowDomStrategy {}

class SomeDirectiveWithoutAnnotation {
}

export function main() {
  describe("DirectiveMetadataReader", () => {
    var reader;

    beforeEach( () => {
      reader = new DirectiveMetadataReader();
    });

    it('should read out the annotation', () => {
      var directiveMetadata = reader.read(SomeDirective);
      expect(directiveMetadata).toEqual(
        new DirectiveMetadata(SomeDirective, new Decorator({selector: 'someSelector'}), null));
    });

    it('should throw if not matching annotation is found', () => {
      expect(() => {
        reader.read(SomeDirectiveWithoutAnnotation);
      }).toThrowError('No Directive annotation found on SomeDirectiveWithoutAnnotation');
    });

    describe("shadow dom strategy", () => {
      it('should return the provided shadow dom strategy when it is present', () => {
        var directiveMetadata = reader.read(ComponentWithExplicitShadowDomStrategy);
        expect(directiveMetadata.shadowDomStrategy).toEqual(ShadowDomEmulated);
      });

      it('should return Native otherwise', () => {
        var directiveMetadata = reader.read(ComponentWithoutExplicitShadowDomStrategy);
        expect(directiveMetadata.shadowDomStrategy).toEqual(ShadowDomNative);
      });
    });
  });
}