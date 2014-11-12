import {describe, beforeEach, it, expect, iit, ddescribe} from 'test_lib/test_lib';
import {isPresent} from 'facade/lang';
import {ListWrapper, MapWrapper} from 'facade/collection';
import {DirectiveParser} from 'core/compiler/pipeline/directive_parser';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {CompileStep} from 'core/compiler/pipeline/compile_step';
import {CompileElement} from 'core/compiler/pipeline/compile_element';
import {CompileControl} from 'core/compiler/pipeline/compile_control';
import {DOM} from 'facade/dom';
import {Component} from 'core/annotations/component';
import {Decorator} from 'core/annotations/decorator';
import {Template} from 'core/annotations/template';
import {TemplateConfig} from 'core/annotations/template_config';
import {Reflector} from 'core/compiler/reflector';

export function main() {
  describe('DirectiveParser', () => {
    var reflector, directives;

    beforeEach( () => {
      reflector = new Reflector();
      directives = [SomeDecorator, SomeTemplate, SomeTemplate2, SomeComponent, SomeComponent2];
    });

    function createPipeline(propertyBindings = null) {
      var annotatedDirectives = ListWrapper.create();
      for (var i=0; i<directives.length; i++) {
        ListWrapper.push(annotatedDirectives, reflector.annotatedType(directives[i]));
      }

      return new CompilePipeline([new MockStep((parent, current, control) => {
          if (isPresent(propertyBindings)) {
            current.propertyBindings = propertyBindings;
          }
        }), new DirectiveParser(annotatedDirectives)]);
    }

    it('should not add directives if they are not used', () => {
      var results = createPipeline().process(createElement('<div></div>'));
      expect(results[0].decoratorDirectives).toBe(null);
      expect(results[0].componentDirective).toBe(null);
      expect(results[0].templateDirective).toBe(null);
    });

    it('should detect directives in attributes', () => {
      var results = createPipeline().process(createElement('<div some-decor some-templ some-comp></div>'));
      expect(results[0].decoratorDirectives).toEqual([reflector.annotatedType(SomeDecorator)]);
      expect(results[0].templateDirective).toEqual(reflector.annotatedType(SomeTemplate));
      expect(results[0].componentDirective).toEqual(reflector.annotatedType(SomeComponent));
    });

    it('should detect directives in property bindings', () => {
      var pipeline = createPipeline(MapWrapper.createFromStringMap({
        'some-decor': 'someExpr',
        'some-templ': 'someExpr',
        'some-comp': 'someExpr'
      }));
      var results = pipeline.process(createElement('<div></div>'));
      expect(results[0].decoratorDirectives).toEqual([reflector.annotatedType(SomeDecorator)]);
      expect(results[0].templateDirective).toEqual(reflector.annotatedType(SomeTemplate));
      expect(results[0].componentDirective).toEqual(reflector.annotatedType(SomeComponent));
    });

    describe('errors', () => {

      it('should not allow multiple template directives on the same element', () => {
        expect( () => {
          createPipeline().process(
            createElement('<div some-templ some-templ2></div>')
          );
        }).toThrowError('Only one template directive per element is allowed!');
      });

      it('should not allow multiple component directives on the same element', () => {
        expect( () => {
          createPipeline().process(
            createElement('<div some-comp some-comp2></div>')
          );
        }).toThrowError('Only one component directive per element is allowed!');
      });
    });

  });
}

class MockStep extends CompileStep {
  constructor(process) {
    this.processClosure = process;
  }
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    this.processClosure(parent, current, control);
  }
}

@Decorator({
  selector: '[some-decor]'
})
class SomeDecorator {}

@Template({
  selector: '[some-templ]'
})
class SomeTemplate {}

@Template({
  selector: '[some-templ2]'
})
class SomeTemplate2 {}

@Component({
  selector: '[some-comp]'
})
class SomeComponent {}

@Component({
  selector: '[some-comp2]'
})
class SomeComponent2 {}

@Component({
  template: new TemplateConfig({
    directives: [SomeDecorator, SomeTemplate, SomeTemplate2, SomeComponent, SomeComponent2]
  })
})
class MyComp {}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
