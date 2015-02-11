import {ddescribe, describe, it, iit, expect, beforeEach} from 'angular2/test_lib';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Decorator, Component} from 'angular2/src/core/annotations/annotations';
import {TemplateConfig} from 'angular2/src/core/annotations/template_config';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {CONST} from 'angular2/src/facade/lang';
import {If, Foreach} from 'angular2/directives';


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

@Component({
  selector: 'withDirectivesTree',
  template: new TemplateConfig({
    directives: [[SomeDirective, [Foreach, If]], ComponentWithoutDirectives]
  })
})
class ComponentWithDirectivesTree {}

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

      it("should return a list of directives specified in the template config as a tree", () => {
        var cmp = reader.read(ComponentWithDirectivesTree);
        expect(cmp.componentDirectives).toEqual([SomeDirective, Foreach, If, ComponentWithoutDirectives]);
      });
    });
  });
}
