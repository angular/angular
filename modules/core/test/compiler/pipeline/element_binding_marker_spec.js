import {describe, beforeEach, it, expect, iit, ddescribe} from 'test_lib/test_lib';
import {isPresent} from 'facade/lang';
import {DOM} from 'facade/dom';
import {MapWrapper} from 'facade/collection';

import {ElementBindingMarker} from 'core/compiler/pipeline/element_binding_marker';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {CompileElement} from 'core/compiler/pipeline/compile_element';
import {CompileStep} from 'core/compiler/pipeline/compile_step'
import {CompileControl} from 'core/compiler/pipeline/compile_control';
import {Reflector} from 'core/compiler/reflector';
import {Template} from 'core/annotations/annotations';
import {Decorator} from 'core/annotations/annotations';
import {Component} from 'core/annotations/annotations';

export function main() {
  describe('ElementBindingMarker', () => {

    function createPipeline({textNodeBindings, propertyBindings, variableBindings, eventBindings, directives}={}) {
      var reflector = new Reflector();
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
                current.addDirective(reflector.annotatedType(directives[i]));
              }
            }
          }), new ElementBindingMarker()
      ]);
    }

    it('should not mark empty elements', () => {
      var results = createPipeline().process(createElement('<div></div>'));
      assertBinding(results[0], false);
    });

    it('should mark elements with text node bindings', () => {
      var textNodeBindings = MapWrapper.create();
      MapWrapper.set(textNodeBindings, 0, 'expr');
      var results = createPipeline({textNodeBindings: textNodeBindings}).process(createElement('<div></div>'));
      assertBinding(results[0], true);
    });

    it('should mark elements with property bindings', () => {
      var propertyBindings = MapWrapper.createFromStringMap({'a': 'expr'});
      var results = createPipeline({propertyBindings: propertyBindings}).process(createElement('<div></div>'));
      assertBinding(results[0], true);
    });

    it('should mark elements with variable bindings', () => {
      var variableBindings = MapWrapper.createFromStringMap({'a': 'expr'});
      var results = createPipeline({variableBindings: variableBindings}).process(createElement('<div></div>'));
      assertBinding(results[0], true);
    });

    it('should mark elements with event bindings', () => {
      var eventBindings = MapWrapper.createFromStringMap({'click': 'expr'});
      var results = createPipeline({eventBindings: eventBindings}).process(createElement('<div></div>'));
      assertBinding(results[0], true);
    });

    it('should mark elements with decorator directives', () => {
      var results = createPipeline({
        directives: [SomeDecoratorDirective]
      }).process(createElement('<div></div>'));
      assertBinding(results[0], true);
    });

    it('should mark elements with template directives', () => {
      var results = createPipeline({
        directives: [SomeTemplateDirective]
      }).process(createElement('<div></div>'));
      assertBinding(results[0], true);
    });

    it('should mark elements with component directives', () => {
      var results = createPipeline({
        directives: [SomeComponentDirective]
      }).process(createElement('<div></div>'));
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

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}