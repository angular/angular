import {describe, beforeEach, it, expect, iit, ddescribe, el} from 'test_lib/test_lib';
import {isPresent} from 'facade/src/lang';
import {DOM} from 'facade/src/dom';
import {MapWrapper} from 'facade/src/collection';

import {ElementBindingMarker} from 'core/src/compiler/pipeline/element_binding_marker';
import {CompilePipeline} from 'core/src/compiler/pipeline/compile_pipeline';
import {CompileElement} from 'core/src/compiler/pipeline/compile_element';
import {CompileStep} from 'core/src/compiler/pipeline/compile_step'
import {CompileControl} from 'core/src/compiler/pipeline/compile_control';
import {DirectiveMetadataReader} from 'core/src/compiler/directive_metadata_reader';
import {Template, Decorator, Component} from 'core/src/annotations/annotations';

export function main() {
  describe('ElementBindingMarker', () => {

    function createPipeline({textNodeBindings, propertyBindings, variableBindings, eventBindings, directives}={}) {
      var reader = new DirectiveMetadataReader();
      return new CompilePipeline([
        new MockStep((parent, current, control) => {
            if (isPresent(textNodeBindings)) {
              current.textNodeBindings = textNodeBindings;
            }
            if (isPresent(propertyBindings)) {
              current.propertyBindings = propertyBindings;
            }
            if (isPresent(variableBindings)) {
              current.variableBindings = variableBindings;
            }
            if (isPresent(eventBindings)) {
              current.eventBindings = eventBindings;
            }
            if (isPresent(directives)) {
              for (var i=0; i<directives.length; i++) {
                current.addDirective(reader.read(directives[i]));
              }
            }
          }), new ElementBindingMarker()
      ]);
    }

    it('should not mark empty elements', () => {
      var results = createPipeline().process(el('<div></div>'));
      assertBinding(results[0], false);
    });

    it('should mark elements with text node bindings', () => {
      var textNodeBindings = MapWrapper.create();
      MapWrapper.set(textNodeBindings, 0, 'expr');
      var results = createPipeline({textNodeBindings: textNodeBindings}).process(el('<div></div>'));
      assertBinding(results[0], true);
    });

    it('should mark elements with property bindings', () => {
      var propertyBindings = MapWrapper.createFromStringMap({'a': 'expr'});
      var results = createPipeline({propertyBindings: propertyBindings}).process(el('<div></div>'));
      assertBinding(results[0], true);
    });

    it('should mark elements with variable bindings', () => {
      var variableBindings = MapWrapper.createFromStringMap({'a': 'expr'});
      var results = createPipeline({variableBindings: variableBindings}).process(el('<div></div>'));
      assertBinding(results[0], true);
    });

    it('should mark elements with event bindings', () => {
      var eventBindings = MapWrapper.createFromStringMap({'click': 'expr'});
      var results = createPipeline({eventBindings: eventBindings}).process(el('<div></div>'));
      assertBinding(results[0], true);
    });

    it('should mark elements with decorator directives', () => {
      var results = createPipeline({
        directives: [SomeDecoratorDirective]
      }).process(el('<div></div>'));
      assertBinding(results[0], true);
    });

    it('should mark elements with template directives', () => {
      var results = createPipeline({
        directives: [SomeTemplateDirective]
      }).process(el('<div></div>'));
      assertBinding(results[0], true);
    });

    it('should mark elements with component directives', () => {
      var results = createPipeline({
        directives: [SomeComponentDirective]
      }).process(el('<div></div>'));
      assertBinding(results[0], true);
    });

  });
}

function assertBinding(pipelineElement, shouldBePresent) {
  expect(pipelineElement.hasBindings).toBe(shouldBePresent);
  expect(DOM.hasClass(pipelineElement.element, 'ng-binding')).toBe(shouldBePresent);
}

class MockStep extends CompileStep {
  processClosure:Function;
  constructor(process) {
    this.processClosure = process;
  }
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    this.processClosure(parent, current, control);
  }
}

@Template()
class SomeTemplateDirective {}

@Component()
class SomeComponentDirective {}

@Decorator()
class SomeDecoratorDirective {}