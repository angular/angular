import {describe, beforeEach, it, expect, iit, ddescribe, el} from 'test_lib/test_lib';
import {isPresent} from 'facade/lang';
import {DOM} from 'facade/dom';
import {ListWrapper, MapWrapper} from 'facade/collection';

import {ElementBinderBuilder} from 'core/compiler/pipeline/element_binder_builder';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {CompileElement} from 'core/compiler/pipeline/compile_element';
import {CompileStep} from 'core/compiler/pipeline/compile_step'
import {CompileControl} from 'core/compiler/pipeline/compile_control';

import {Decorator} from 'core/annotations/annotations';
import {Template} from 'core/annotations/annotations';
import {Component} from 'core/annotations/annotations';
import {ProtoView, ElementPropertyMemento, DirectivePropertyMemento} from 'core/compiler/view';
import {ProtoElementInjector} from 'core/compiler/element_injector';
import {DirectiveMetadataReader} from 'core/compiler/directive_metadata_reader';

import {ChangeDetector, Lexer, Parser, ProtoChangeDetector} from 'change_detection/change_detection';
import {Injector} from 'di/di';

export function main() {
  describe('ElementBinderBuilder', () => {
    var evalContext, view, changeDetector;

    function createPipeline({textNodeBindings, propertyBindings, eventBindings, directives, protoElementInjector
    }={}) {
      var reflector = new DirectiveMetadataReader();
      var parser = new Parser(new Lexer());
      return new CompilePipeline([
        new MockStep((parent, current, control) => {
            var hasBinding = false;
            if (isPresent(current.element.getAttribute('text-binding'))) {
              MapWrapper.forEach(textNodeBindings, (v,k) => {
                current.addTextNodeBinding(k, parser.parseBinding(v, null));
              });
              hasBinding = true;
            }
            if (isPresent(current.element.getAttribute('prop-binding'))) {
              if (isPresent(propertyBindings)) {
                MapWrapper.forEach(propertyBindings, (v,k) => {
                  current.addPropertyBinding(k, parser.parseBinding(v, null));
                });
              }
              hasBinding = true;
            }
            if (isPresent(current.element.getAttribute('event-binding'))) {
              MapWrapper.forEach(eventBindings, (v,k) => {
                current.addEventBinding(k, parser.parseAction(v, null));
              });
              hasBinding = true;
            }
            if (isPresent(protoElementInjector)) {
              current.inheritedProtoElementInjector = protoElementInjector;
            }
            if (isPresent(current.element.getAttribute('directives'))) {
              hasBinding = true;
              for (var i=0; i<directives.length; i++) {
                var dirMetadata = reflector.read(directives[i]);
                current.addDirective(dirMetadata);
              }
            }
            if (hasBinding) {
              current.hasBindings = true;
              DOM.addClass(current.element, 'ng-binding');
            }
            if (isPresent(current.element.getAttribute('viewroot'))) {
              current.isViewRoot = true;
              current.inheritedProtoView = new ProtoView(current.element, new ProtoChangeDetector());
            } else if (isPresent(parent)) {
              current.inheritedProtoView = parent.inheritedProtoView;
            }
          }), new ElementBinderBuilder()
      ]);
    }

    function instantiateView(protoView) {
      evalContext = new Context();
      view = protoView.instantiate(null);
      view.hydrate(new Injector([]), null, evalContext);
      changeDetector = view.changeDetector;
    }

    it('should not create an ElementBinder for elements that have no bindings', () => {
      var pipeline = createPipeline();
      var results = pipeline.process(el('<div viewroot><span></span></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders.length).toBe(0);
    });

    it('should create an ElementBinder for elements that have bindings', () => {
      var pipeline = createPipeline();
      var results = pipeline.process(el('<div viewroot prop-binding><span prop-binding></span></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders.length).toBe(2);
      expect(pv.elementBinders[1]).not.toBe(pv.elementBinders[0]);
    });

    it('should inherit ElementBinders to children that have no bindings', () => {
      var pipeline = createPipeline();
      var results = pipeline.process(el('<div viewroot prop-binding><span></span></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders.length).toBe(1);
      expect(results[0].inheritedElementBinder).toBe(results[1].inheritedElementBinder);
    });

    it('should store the current protoElementInjector', () => {
      var directives = [SomeDecoratorDirective];
      var protoElementInjector = new ProtoElementInjector(null, 0, directives);

      var pipeline = createPipeline({protoElementInjector: protoElementInjector, directives: directives});
      var results = pipeline.process(el('<div viewroot directives></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].protoElementInjector).toBe(protoElementInjector);
    });

    it('should store the component directive', () => {
      var directives = [SomeComponentDirective];
      var pipeline = createPipeline({protoElementInjector: null, directives: directives});
      var results = pipeline.process(el('<div viewroot directives></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].componentDirective.type).toBe(SomeComponentDirective);
    });

    it('should store the template directive', () => {
      var directives = [SomeTemplateDirective];
      var pipeline = createPipeline({protoElementInjector: null, directives: directives});
      var results = pipeline.process(el('<div viewroot directives></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].templateDirective.type).toBe(SomeTemplateDirective);
    });

    it('should bind text nodes', () => {
      var textNodeBindings = MapWrapper.create();
      MapWrapper.set(textNodeBindings, 0, 'prop1');
      MapWrapper.set(textNodeBindings, 2, 'prop2');
      var pipeline = createPipeline({textNodeBindings: textNodeBindings});
      var results = pipeline.process(el('<div viewroot text-binding>{{}}<span></span>{{}}</div>'));
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
        'value': 'prop1',
        'hidden': 'prop2'
      });
      var pipeline = createPipeline({propertyBindings: propertyBindings});
      var results = pipeline.process(el('<input viewroot prop-binding>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].hasElementPropertyBindings).toBe(true);

      instantiateView(pv);
      evalContext.prop1 = 'a';
      evalContext.prop2 = false;
      changeDetector.detectChanges();

      expect(view.nodes[0].value).toEqual('a');
      expect(view.nodes[0].hidden).toEqual(false);
    });

    it('should bind events', () => {
      var eventBindings = MapWrapper.createFromStringMap({
        'event1': '1+1'
      });
      var pipeline = createPipeline({eventBindings: eventBindings});
      var results = pipeline.process(el('<div viewroot event-binding></div>'));
      var pv = results[0].inheritedProtoView;

      var ast = MapWrapper.get(pv.elementBinders[0].events, 'event1');
      expect(ast.eval(null)).toBe(2);
    });

    it('should bind directive properties', () => {
      var propertyBindings = MapWrapper.createFromStringMap({
        'boundprop1': 'prop1',
        'boundprop2': 'prop2',
        'boundprop3': 'prop3'
      });
      var directives = [SomeComponentDirectiveWithBinding,
                        SomeTemplateDirectiveWithBinding,
                        SomeDecoratorDirectiveWith2Bindings];
      var protoElementInjector = new ProtoElementInjector(null, 0, directives, true);
      var pipeline = createPipeline({
        propertyBindings: propertyBindings,
        directives: directives,
        protoElementInjector: protoElementInjector
      });
      var results = pipeline.process(el('<div viewroot prop-binding directives></div>'));
      var pv = results[0].inheritedProtoView;
      results[0].inheritedElementBinder.nestedProtoView = new ProtoView(
          el('<div></div>'), new ProtoChangeDetector());

      instantiateView(pv);
      evalContext.prop1 = 'a';
      evalContext.prop2 = 'b';
      evalContext.prop3 = 'c';
      changeDetector.detectChanges();

      expect(view.elementInjectors[0].get(SomeDecoratorDirectiveWith2Bindings).decorProp).toBe('a');
      expect(view.elementInjectors[0].get(SomeDecoratorDirectiveWith2Bindings).decorProp2).toBe('b');
      expect(view.elementInjectors[0].get(SomeTemplateDirectiveWithBinding).templProp).toBe('b');
      expect(view.elementInjectors[0].get(SomeComponentDirectiveWithBinding).compProp).toBe('c');
    });

    it('should bind directive properties for sibling elements', () => {
      var propertyBindings = MapWrapper.createFromStringMap({
        'boundprop1': 'prop1'
      });
      var directives = [SomeDecoratorDirectiveWithBinding];
      var protoElementInjector = new ProtoElementInjector(null, 0, directives);
      var pipeline = createPipeline({
        propertyBindings: propertyBindings,
        directives: directives,
        protoElementInjector: protoElementInjector
      });
      var results = pipeline.process(
        el('<div viewroot><div prop-binding directives>'+
          '</div><div prop-binding directives></div></div>'));
      var pv = results[0].inheritedProtoView;

      instantiateView(pv);
      evalContext.prop1 = 'a';
      changeDetector.detectChanges();

      expect(view.elementInjectors[1].get(SomeDecoratorDirectiveWithBinding).decorProp).toBe('a');
    });

    describe('errors', () => {

      it('should throw if there is no element property bindings for a directive property binding', () => {
        var pipeline = createPipeline({propertyBindings: MapWrapper.create(), directives: [SomeDecoratorDirectiveWithBinding]});
        expect( () => {
          pipeline.process(el('<div viewroot prop-binding directives>'));
        }).toThrowError('No element binding found for property boundprop1 which is required by directive SomeDecoratorDirectiveWithBinding');
      });

    });

  });

}

@Decorator()
class SomeDecoratorDirective {
}

@Decorator({
  bind: {'boundprop1': 'decorProp'}
})
class SomeDecoratorDirectiveWithBinding {
  decorProp;
  decorProp2;
  constructor() {
    this.decorProp = null;
    this.decorProp2 = null;
  }
}

@Decorator({
  bind: {
    'boundprop1': 'decorProp',
    'boundprop2': 'decorProp2'
  }
})
class SomeDecoratorDirectiveWith2Bindings {
  decorProp;
  decorProp2;
  constructor() {
    this.decorProp = null;
    this.decorProp2 = null;
  }
}

@Template()
class SomeTemplateDirective {
}

@Template({
  bind: {'boundprop2': 'templProp'}
})
class SomeTemplateDirectiveWithBinding {
  templProp;
  constructor() {
    this.templProp = null;
  }
}

@Component()
class SomeComponentDirective {
}

@Component({
  bind: {'boundprop3': 'compProp'}
})
class SomeComponentDirectiveWithBinding {
  compProp;
  constructor() {
    this.compProp = null;
  }
}

class Context {
  prop1;
  prop2;
  prop3;
  constructor() {
    this.prop1 = null;
    this.prop2 = null;
    this.prop3 = null;
  }
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

function sortArr(arr) {
  var arr2 = ListWrapper.clone(arr);
  arr2.sort();
  return arr2;
}
