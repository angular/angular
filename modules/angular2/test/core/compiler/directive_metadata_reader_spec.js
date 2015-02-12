import {ddescribe, describe, it, iit, expect, beforeEach} from 'angular2/test_lib';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Decorator, Component, Viewport} from 'angular2/src/core/annotations/annotations';
import {Template} from 'angular2/src/core/annotations/template';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {CONST} from 'angular2/src/facade/lang';
import {If, Foreach} from 'angular2/directives';


@Decorator({selector: 'someDecorator'})
class SomeDecorator {}

@Component({selector: 'someComponent'})
class SomeComponent {}

@Viewport({selector: 'someViewport'})
class SomeViewport {}

class SomeDirectiveWithoutAnnotation {
}

export function main() {
  describe("DirectiveMetadataReader", () => {
    var reader;

    beforeEach(() => {
      reader = new DirectiveMetadataReader();
    });

    it('should read out the Decorator annotation', () => {
      var directiveMetadata = reader.read(SomeDecorator);
      expect(directiveMetadata).toEqual(
        new DirectiveMetadata(SomeDecorator, new Decorator({selector: 'someDecorator'})));
    });

    it('should read out the Viewport annotation', () => {
      var directiveMetadata = reader.read(SomeViewport);
      expect(directiveMetadata).toEqual(
        new DirectiveMetadata(SomeViewport, new Viewport({selector: 'someViewport'})));
    });

    it('should read out the Component annotation', () => {
      var directiveMetadata = reader.read(SomeComponent);
      expect(directiveMetadata).toEqual(
        new DirectiveMetadata(SomeComponent, new Component({selector: 'someComponent'})));
    });

    it('should throw if not matching annotation is found', () => {
      expect(() => {
        reader.read(SomeDirectiveWithoutAnnotation);
      }).toThrowError('No Directive annotation found on SomeDirectiveWithoutAnnotation');
    });
  });
}
