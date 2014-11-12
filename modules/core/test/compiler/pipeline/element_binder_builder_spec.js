import {describe, beforeEach, it, expect, iit, ddescribe} from 'test_lib/test_lib';
import {isPresent} from 'facade/lang';
import {DOM} from 'facade/dom';
import {ListWrapper, MapWrapper} from 'facade/collection';

import {ElementBinderBuilder} from 'core/compiler/pipeline/element_binder_builder';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {CompileElement} from 'core/compiler/pipeline/compile_element';
import {CompileStep} from 'core/compiler/pipeline/compile_step'
import {CompileControl} from 'core/compiler/pipeline/compile_control';

import {Decorator} from 'core/annotations/decorator';
import {Template} from 'core/annotations/template';
import {Component} from 'core/annotations/component';
import {ProtoView, ElementPropertyMemento, DirectivePropertyMemento} from 'core/compiler/view';
import {ProtoElementInjector} from 'core/compiler/element_injector';
import {Reflector} from 'core/compiler/reflector';

import {ProtoWatchGroup} from 'change_detection/watch_group';
import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';
import {ClosureMap} from 'change_detection/parser/closure_map';
import {ChangeDetector} from 'change_detection/change_detector';

export function main() {
  describe('ElementBinderBuilder', () => {
    var evalContext, view, changeDetector;

    function createPipeline({textNodeBindings, propertyBindings, directives, protoElementInjector}={}) {
      var reflector = new Reflector();
      var closureMap = new ClosureMap();
      return new CompilePipeline([
        new MockStep((parent, current, control) => {
            if (isPresent(current.element.getAttribute('viewroot'))) {
              current.isViewRoot = true;
              current.inheritedProtoView = new ProtoView(current.element, new ProtoWatchGroup());
            } else if (isPresent(parent)) {
              current.inheritedProtoView = parent.inheritedProtoView;
            } else {
              current.inheritedProtoView = null;
            }
            var hasBinding = false;
            if (isPresent(current.element.getAttribute('text-binding'))) {
              current.textNodeBindings = textNodeBindings;
              hasBinding = true;
            }
            if (isPresent(current.element.getAttribute('prop-binding'))) {
              current.propertyBindings = propertyBindings;
              hasBinding = true;
            }
            if (isPresent(protoElementInjector)) {
              current.inheritedProtoElementInjector = protoElementInjector;
            } else {
              current.inheritedProtoElementInjector = null;
            }
            if (isPresent(current.element.getAttribute('directives'))) {
              hasBinding = true;
              for (var i=0; i<directives.length; i++) {
                current.addDirective(reflector.annotatedType(directives[i]));
              }
            }
            if (hasBinding) {
              current.hasBindings = true;
              DOM.addClass(current.element, 'ng-binding');
            }
          }), new ElementBinderBuilder(new Parser(new Lexer(), closureMap), closureMap)
      ]);
    }

    function instantiateView(protoView) {
      evalContext = new Context();
      view = protoView.instantiate(evalContext, null);
      changeDetector = new ChangeDetector(view.watchGroup);
    }

    it('should not create an ElementBinder for elements that have no bindings', () => {
      var pipeline = createPipeline();
      var results = pipeline.process(createElement('<div viewroot><span></span></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders.length).toBe(0);
    });

    it('should create an ElementBinder for elements that have bindings', () => {
      var pipeline = createPipeline();
      var results = pipeline.process(createElement('<div viewroot prop-binding><span prop-binding></span></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders.length).toBe(2);
      expect(pv.elementBinders[1]).not.toBe(pv.elementBinders[0]);
    });

    it('should inherit ElementBinders to children that have no bindings', () => {
      var pipeline = createPipeline();
      var results = pipeline.process(createElement('<div viewroot prop-binding><span></span></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders.length).toBe(1);
      expect(results[0].inheritedElementBinder).toBe(results[1].inheritedElementBinder);
    });

    it('should store the current protoElementInjector', () => {
      var directives = [SomeSimpleDirective];
      var protoElementInjector = new ProtoElementInjector(null, 0, directives);

      var pipeline = createPipeline({protoElementInjector: protoElementInjector, directives: directives});
      var results = pipeline.process(createElement('<div viewroot directives></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].protoElementInjector).toBe(protoElementInjector);
    });

    it('should bind text nodes', () => {
      var textNodeBindings = MapWrapper.create();
      MapWrapper.set(textNodeBindings, 0, 'prop1');
      MapWrapper.set(textNodeBindings, 2, 'prop2');
      var pipeline = createPipeline({textNodeBindings: textNodeBindings});
      var results = pipeline.process(createElement('<div viewroot text-binding>{{}}<span></span>{{}}</div>'));
      var pv = results[0].inheritedProtoView;

      expect(sortArr(pv.elementBinders[0].textNodeIndices)).toEqual([0, 2]);

      instantiateView(pv);
      evalContext.prop1 = 'a';
      evalContext.prop2 = 'b';
      changeDetector.detectChanges();

      expect(view.nodes[0].childNodes[0].nodeValue).toEqual('a');
      expect(view.nodes[0].childNodes[2].nodeValue).toEqual('b');
    });

    it('should bind element properties', () => {
      var propertyBindings = MapWrapper.createFromStringMap({
        'elprop1': 'prop1',
        'elprop2': 'prop2'
      });
      var pipeline = createPipeline({propertyBindings: propertyBindings});
      var results = pipeline.process(createElement('<div viewroot prop-binding></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].hasElementPropertyBindings).toBe(true);

      instantiateView(pv);
      evalContext.prop1 = 'a';
      evalContext.prop2 = 'b';
      changeDetector.detectChanges();

      expect(DOM.getProperty(view.nodes[0], 'elprop1')).toEqual('a');
      expect(DOM.getProperty(view.nodes[0], 'elprop2')).toEqual('b');
    });

    it('should bind directive properties', () => {
      var propertyBindings = MapWrapper.createFromStringMap({
        'boundprop1': 'prop1',
        'boundprop2': 'prop2',
        'boundprop3': 'prop3'
      });
      var directives = [SomeDecoratorDirective, SomeTemplateDirective, SomeComponentDirective];
      var protoElementInjector = new ProtoElementInjector(null, 0, directives);
      var pipeline = createPipeline({
        propertyBindings: propertyBindings,
        directives: directives,
        protoElementInjector: protoElementInjector
      });
      var results = pipeline.process(createElement('<div viewroot prop-binding directives></div>'));
      var pv = results[0].inheritedProtoView;

      instantiateView(pv);
      evalContext.prop1 = 'a';
      evalContext.prop2 = 'b';
      evalContext.prop3 = 'c';
      changeDetector.detectChanges();

      expect(view.elementInjectors[0].get(SomeDecoratorDirective).decorProp).toBe('a');
      expect(view.elementInjectors[0].get(SomeTemplateDirective).templProp).toBe('b');
      expect(view.elementInjectors[0].get(SomeComponentDirective).compProp).toBe('c');
    });

    it('should bind directive properties for sibling elements', () => {
      var propertyBindings = MapWrapper.createFromStringMap({
        'boundprop1': 'prop1'
      });
      var directives = [SomeDecoratorDirective];
      var protoElementInjector = new ProtoElementInjector(null, 0, directives);
      var pipeline = createPipeline({
        propertyBindings: propertyBindings,
        directives: directives,
        protoElementInjector: protoElementInjector
      });
      var results = pipeline.process(
        createElement('<div viewroot><div prop-binding directives>'+
          '</div><div prop-binding directives></div></div>'));
      var pv = results[0].inheritedProtoView;

      instantiateView(pv);
      evalContext.prop1 = 'a';
      changeDetector.detectChanges();

      expect(view.elementInjectors[1].get(SomeDecoratorDirective).decorProp).toBe('a');
    });

    describe('errors', () => {

      it('should throw if there is no element property bindings for a directive property binding', () => {
        var pipeline = createPipeline({propertyBindings: MapWrapper.create(), directives: [SomeDecoratorDirective]});
        expect( () => {
          pipeline.process(createElement('<div viewroot prop-binding directives>'));
        }).toThrowError('No element binding found for property boundprop1 which is required by directive SomeDecoratorDirective');
      });

    });

  });

}

@Decorator()
class SomeSimpleDirective {
}

@Decorator({
  bind: {'boundprop1': 'decorProp'}
})
class SomeDecoratorDirective {
  constructor() {
    this.decorProp = null;
  }
}

@Template({
  bind: {'boundprop2': 'templProp'}
})
class SomeTemplateDirective {
  constructor() {
    this.templProp = null;
  }
}

@Component({
  bind: {'boundprop3': 'compProp'}
})
class SomeComponentDirective {
  constructor() {
    this.compProp = null;
  }
}

class Context {
  constructor() {
    this.prop1 = null;
    this.prop2 = null;
    this.prop3 = null;
  }
}

class MockStep extends CompileStep {
  constructor(process) {
    this.processClosure = process;
  }
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    this.processClosure(parent, current, control);
  }
}

function sortArr(arr) {
  var arr2 = ListWrapper.clone(arr);
  arr2.sort();
  return arr2;
}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}

