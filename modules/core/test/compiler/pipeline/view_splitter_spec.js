import {describe, beforeEach, it, expect, iit, ddescribe} from 'test_lib/test_lib';
import {isPresent} from 'facade/lang';
import {MapWrapper} from 'facade/collection';

import {ViewSplitter} from 'core/compiler/pipeline/view_splitter';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {CompileElement} from 'core/compiler/pipeline/compile_element';
import {CompileStep} from 'core/compiler/pipeline/compile_step'
import {CompileControl} from 'core/compiler/pipeline/compile_control';
import {DOM, TemplateElement} from 'facade/dom';
import {Reflector} from 'core/compiler/reflector';
import {Template} from 'core/annotations/template';
import {Decorator} from 'core/annotations/decorator';
import {Component} from 'core/annotations/component';

export function main() {
  describe('ViewSplitter', () => {

    function createPipeline({textNodeBindings, propertyBindings, directives}={}) {
      var reflector = new Reflector();
      return new CompilePipeline([
        new MockStep((parent, current, control) => {
          if (isPresent(current.element.getAttribute('tmpl'))) {
            current.addDirective(reflector.annotatedType(SomeTemplateDirective));
            if (isPresent(textNodeBindings)) {
              current.textNodeBindings = textNodeBindings;
            }
            if (isPresent(propertyBindings)) {
              current.propertyBindings = propertyBindings;
            }
            if (isPresent(directives)) {
              for (var i=0; i<directives.length; i++) {
                current.addDirective(reflector.annotatedType(directives[i]));
              }
            }
          }
        }), new ViewSplitter()
      ]);
    }

    function commonTests(useTemplateElement) {
      var rootElement;
      beforeEach( () => {
        if (useTemplateElement) {
          rootElement = createElement('<div><span tmpl></span></div>');
        } else {
          rootElement = createElement('<div><span tmpl></span></div>');
        }
      });

      it('should insert an empty <template> element', () => {
        var originalChild = rootElement.childNodes[0];
        var results = createPipeline().process(rootElement);
        expect(results[0].element).toBe(rootElement);
        expect(results[1].element instanceof TemplateElement).toBe(true);
        expect(DOM.getInnerHTML(results[1].element)).toEqual('');
        expect(results[2].element).toBe(originalChild);
      });

      it('should move the template directive to the new element', () => {
        var results = createPipeline().process(rootElement);
        expect(results[1].templateDirective.type).toBe(SomeTemplateDirective);
        expect(results[2].templateDirective).toBe(null);
      });

      it('should split the property bindings depending on the bindings on the directive', () => {
        var propertyBindings = MapWrapper.createFromStringMap({
          'templateBoundProp': 'a',
          'nonBoundProp': 'c'
        });
        var results = createPipeline({propertyBindings: propertyBindings}).process(rootElement);
        expect(MapWrapper.get(results[1].propertyBindings, 'templateBoundProp')).toEqual('a');
        expect(MapWrapper.get(results[2].propertyBindings, 'nonBoundProp')).toEqual('c');
      });

      it('should keep the component, decorator directives and text node bindings on the original element', () => {
        var textNodeBindings = MapWrapper.create();
        MapWrapper.set(textNodeBindings, 0, 'someExpr');
        var directives = [SomeDecoratorDirective, SomeComponentDirective];
        var results = createPipeline({
          textNodeBindings: textNodeBindings,
          directives: directives
        }).process(rootElement);
        expect(results[1].componentDirective).toBe(null);
        expect(results[1].decoratorDirectives).toBe(null);
        expect(results[1].textNodeBindings).toBe(null);
        expect(results[2].componentDirective.type).toEqual(SomeComponentDirective);
        expect(results[2].decoratorDirectives[0].type).toEqual(SomeDecoratorDirective);
        expect(results[2].textNodeBindings).toEqual(textNodeBindings);
      });

      it('should set the isViewRoot flag for the root and nested views', () => {
        var results = createPipeline().process(rootElement);
        expect(results[0].isViewRoot).toBe(true);
        expect(results[1].isViewRoot).toBe(false);
        expect(results[2].isViewRoot).toBe(true);
      });
    }

    describe('template directive on normal element', () => {
      commonTests(false);
    });

    describe('template directive on <template> element', () => {
      commonTests(true);
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

@Template({
  bind: {
    'templateBoundProp': 'dirProp'
  }
})
class SomeTemplateDirective {}

@Component()
class SomeComponentDirective {}

@Decorator()
class SomeDecoratorDirective {}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
