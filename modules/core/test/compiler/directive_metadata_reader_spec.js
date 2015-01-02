import {ddescribe, describe, it, iit, expect, beforeEach} from 'test_lib/test_lib';
import {DirectiveMetadataReader} from 'core/compiler/directive_metadata_reader';
import {Decorator, Component} from 'core/annotations/annotations';
import {TemplateConfig} from 'core/annotations/template_config';
import {DirectiveMetadata} from 'core/compiler/directive_metadata';
import {ShadowDomStrategy, ShadowDomNative} from 'core/compiler/shadow_dom';
import {CONST} from 'facade/lang';


class FakeShadowDomStrategy extends ShadowDomStrategy {
  @CONST()
  constructor() {}

  polyfillDirectives() {
    return [SomeDirective];
  }
}

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
  shadowDom: new FakeShadowDomStrategy()
})
class ComponentWithExplicitShadowDomStrategy {}

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

    beforeEach( () => {
      reader = new DirectiveMetadataReader();
    });

    it('should read out the annotation', () => {
      var directiveMetadata = reader.read(SomeDirective);
      expect(directiveMetadata).toEqual(
        new DirectiveMetadata(SomeDirective, new Decorator({selector: 'someSelector'}), null, null));
    });

    it('should throw if not matching annotation is found', () => {
      expect(() => {
        reader.read(SomeDirectiveWithoutAnnotation);
      }).toThrowError('No Directive annotation found on SomeDirectiveWithoutAnnotation');
    });

    describe("shadow dom strategy", () => {
      it('should return the provided shadow dom strategy when it is present', () => {
        var directiveMetadata = reader.read(ComponentWithExplicitShadowDomStrategy);
        expect(directiveMetadata.shadowDomStrategy).toBeAnInstanceOf(FakeShadowDomStrategy);
      });

      it('should return Native otherwise', () => {
        var directiveMetadata = reader.read(ComponentWithoutExplicitShadowDomStrategy);
        expect(directiveMetadata.shadowDomStrategy).toEqual(ShadowDomNative);
      });
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

      it("should include directives required by the shadow DOM strategy", () => {
        var cmp = reader.read(ComponentWithExplicitShadowDomStrategy);
        expect(cmp.componentDirectives).toEqual([SomeDirective]);
      });
    });
  });
}