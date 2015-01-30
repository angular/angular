import {ddescribe, describe, it, iit, expect, beforeEach} from 'test_lib/test_lib';

import {DirectiveMetadataReader} from 'core/src/compiler/directive_metadata_reader';
import {Decorator, Component} from 'core/src/annotations/annotations';
import {TemplateConfig} from 'core/src/annotations/template_config';
import {DirectiveMetadata} from 'core/src/compiler/directive_metadata';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'core/src/compiler/shadow_dom_strategy';
import {isBlank} from 'facade/src/lang';

@Decorator({
  selector: 'someSelector'
})
class SomeDirective {
}

class SomeDirectiveWithoutAnnotation {
}

@Component({
  selector: 'withoutDirectives'
})
class ComponentWithoutDirectives {}

@Component({
  selector: 'withDirectives',
  template: new TemplateConfig({
    directives: [ComponentWithoutDirectives]
  })
})
class ComponentWithDirectives {}



export function main() {
  describe("DirectiveMetadataReader", () => {
    var reader;

    beforeEach(() => {
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

    describe("componentDirectives", () => {
      it("should return an empty list when no directives specified", () => {
        var cmp = reader.read(ComponentWithoutDirectives);
        expect(cmp.componentDirectives).toEqual([]);
      });

      it("should return a list of directives specified in the template config", () => {
        var cmp = reader.read(ComponentWithDirectives);
        expect(cmp.componentDirectives).toEqual([ComponentWithoutDirectives]);
      });
    });
  });
}
