import {describe, beforeEach, it, expect, iit, ddescribe, el} from 'angular2/test_lib';
import {isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/facade/dom';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

import {ElementBinderBuilder} from 'angular2/src/core/compiler/pipeline/element_binder_builder';
import {CompilePipeline} from 'angular2/src/core/compiler/pipeline/compile_pipeline';
import {CompileElement} from 'angular2/src/core/compiler/pipeline/compile_element';
import {CompileStep} from 'angular2/src/core/compiler/pipeline/compile_step'
import {CompileControl} from 'angular2/src/core/compiler/pipeline/compile_control';
import {NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';

import {Decorator, Component, Viewport} from 'angular2/src/core/annotations/annotations';
import {ProtoView, ElementPropertyMemento, DirectivePropertyMemento} from 'angular2/src/core/compiler/view';
import {ProtoElementInjector} from 'angular2/src/core/compiler/element_injector';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';

import {ChangeDetector, Lexer, Parser, DynamicProtoChangeDetector,
  } from 'angular2/change_detection';
import {Injector} from 'angular2/di';

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
            if (isPresent(protoElementInjector) &&
                (isPresent(current.element.getAttribute('text-binding')) ||
                 isPresent(current.element.getAttribute('prop-binding')) ||
                 isPresent(current.element.getAttribute('directives')) ||
                 isPresent(current.element.getAttribute('event-binding')))) {
              current.inheritedProtoElementInjector = protoElementInjector;
            }
            if (isPresent(current.element.getAttribute('viewroot'))) {
              current.isViewRoot = true;
              current.inheritedProtoView = new ProtoView(current.element,
                new DynamicProtoChangeDetector(null), new NativeShadowDomStrategy());
            } else if (isPresent(parent)) {
              current.inheritedProtoView = parent.inheritedProtoView;
            }
          }), new ElementBinderBuilder(parser, null)
      ]);
    }

    function instantiateView(protoView) {
      evalContext = new Context();
      view = protoView.instantiate(null, null);
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

      var pipeline = createPipeline({protoElementInjector: protoElementInjector,
        directives: directives});
      var results = pipeline.process(el('<div viewroot directives></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].protoElementInjector).toBe(protoElementInjector);
    });

    it('should not store the parent protoElementInjector', () => {
      var directives = [SomeDecoratorDirective];
      var eventBindings = MapWrapper.createFromStringMap({
        'event1': '1+1'
      });

      var pipeline = createPipeline({directives: directives, eventBindings: eventBindings});
      var results = pipeline.process(el('<div viewroot directives><div event-binding></div></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[1].protoElementInjector).toBeNull();
    });


    it('should store the component directive', () => {
      var directives = [SomeComponentDirective];
      var pipeline = createPipeline({protoElementInjector: null, directives: directives});
      var results = pipeline.process(el('<div viewroot directives></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].componentDirective.type).toBe(SomeComponentDirective);
    });

    it('should store the template directive', () => {
      var directives = [SomeViewportDirective];
      var pipeline = createPipeline({protoElementInjector: null, directives: directives});
      var results = pipeline.process(el('<div viewroot directives></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].viewportDirective.type).toBe(SomeViewportDirective);
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

    it('should bind to aria-* attributes when exp evaluates to strings', () => {
      var propertyBindings = MapWrapper.createFromStringMap({
        'aria-label': 'prop1'
      });
      var pipeline = createPipeline({propertyBindings: propertyBindings});
      var results = pipeline.process(el('<div viewroot prop-binding></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].hasElementPropertyBindings).toBe(true);

      instantiateView(pv);

      evalContext.prop1 = 'some label';
      changeDetector.detectChanges();
      expect(DOM.getAttribute(view.nodes[0], 'aria-label')).toEqual('some label');

      evalContext.prop1 = 'some other label';
      changeDetector.detectChanges();
      expect(DOM.getAttribute(view.nodes[0], 'aria-label')).toEqual('some other label');

      evalContext.prop1 = null;
      changeDetector.detectChanges();
      expect(DOM.getAttribute(view.nodes[0], 'aria-label')).toBeNull();
    });

    it('should bind to aria-* attributes when exp evaluates to booleans', () => {
      var propertyBindings = MapWrapper.createFromStringMap({
        'aria-busy': 'prop1'
      });
      var pipeline = createPipeline({propertyBindings: propertyBindings});
      var results = pipeline.process(el('<div viewroot prop-binding></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].hasElementPropertyBindings).toBe(true);

      instantiateView(pv);

      evalContext.prop1 = true;
      changeDetector.detectChanges();
      expect(DOM.getAttribute(view.nodes[0], 'aria-busy')).toEqual('true');

      evalContext.prop1 = false;
      changeDetector.detectChanges();
      expect(DOM.getAttribute(view.nodes[0], 'aria-busy')).toEqual('false');
    });

    it('should bind to ARIA role attribute', () => {
      var propertyBindings = MapWrapper.createFromStringMap({
        'role': 'prop1'
      });
      var pipeline = createPipeline({propertyBindings: propertyBindings});
      var results = pipeline.process(el('<div viewroot prop-binding></div>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].hasElementPropertyBindings).toBe(true);

      instantiateView(pv);

      evalContext.prop1 = 'alert';
      changeDetector.detectChanges();
      expect(DOM.getAttribute(view.nodes[0], 'role')).toEqual('alert');

      evalContext.prop1 = 'alertdialog';
      changeDetector.detectChanges();
      expect(DOM.getAttribute(view.nodes[0], 'role')).toEqual('alertdialog');

      evalContext.prop1 = null;
      changeDetector.detectChanges();
      expect(DOM.getAttribute(view.nodes[0], 'role')).toBeNull();
    });

    it('should throw for a non-string ARIA role', () => {
      var propertyBindings = MapWrapper.createFromStringMap({
        'role': 'prop1'
      });
      var pipeline = createPipeline({propertyBindings: propertyBindings});
      var results = pipeline.process(el('<div viewroot prop-binding></div>'));
      var pv = results[0].inheritedProtoView;

      instantiateView(pv);

      expect( () => {
        evalContext.prop1 = 1; //invalid, non-string role
        changeDetector.detectChanges();
      }).toThrowError("Invalid role attribute, only string values are allowed, got '1'");
    });

    it('should bind class with a dot', () => {
      var propertyBindings = MapWrapper.createFromStringMap({
        'class.bar': 'prop1',
      });
      var pipeline = createPipeline({propertyBindings: propertyBindings});
      var results = pipeline.process(el('<input class="foo" viewroot prop-binding>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].hasElementPropertyBindings).toBe(true);

      instantiateView(pv);

      evalContext.prop1 = true;
      changeDetector.detectChanges();
      expect(view.nodes[0].className).toEqual('foo ng-binding bar');

      evalContext.prop1 = false;
      changeDetector.detectChanges();
      expect(view.nodes[0].className).toEqual('foo ng-binding');
    });

    it('should bind style with a dot', () => {
      var propertyBindings = MapWrapper.createFromStringMap({
        'style.color': 'prop1',
      });
      var pipeline = createPipeline({propertyBindings: propertyBindings});
      var results = pipeline.process(el('<div viewroot prop-binding>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].hasElementPropertyBindings).toBe(true);

      instantiateView(pv);

      evalContext.prop1 = 'red';
      changeDetector.detectChanges();
      expect(view.nodes[0].style.color).toEqual('red');

      evalContext.prop1 = 'blue';
      changeDetector.detectChanges();
      expect(view.nodes[0].style.color).toEqual('blue');
    });

    it('should bind style with a dot and suffix', () => {
      var propertyBindings = MapWrapper.createFromStringMap({
        'style.font-size.px': 'prop1',
      });
      var pipeline = createPipeline({propertyBindings: propertyBindings});
      var results = pipeline.process(el('<div viewroot prop-binding>'));
      var pv = results[0].inheritedProtoView;

      expect(pv.elementBinders[0].hasElementPropertyBindings).toBe(true);

      instantiateView(pv);

      evalContext.prop1 = 10;
      changeDetector.detectChanges();
      expect(DOM.getStyle(view.nodes[0], 'font-size')).toEqual('10px');

      evalContext.prop1 = 20;
      changeDetector.detectChanges();
      expect(DOM.getStyle(view.nodes[0], 'font-size')).toEqual('20px');

      evalContext.prop1 = null;
      changeDetector.detectChanges();
      expect(DOM.getStyle(view.nodes[0], 'font-size')).toEqual('');
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
                        SomeViewportDirectiveWithBinding,
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
          el('<div></div>'), new DynamicProtoChangeDetector(null), new NativeShadowDomStrategy());

      instantiateView(pv);
      evalContext.prop1 = 'a';
      evalContext.prop2 = 'b';
      evalContext.prop3 = 'c';
      changeDetector.detectChanges();

      expect(view.elementInjectors[0].get(SomeDecoratorDirectiveWith2Bindings).decorProp).toBe('a');
      expect(view.elementInjectors[0].get(SomeDecoratorDirectiveWith2Bindings).decorProp2).toBe('b');
      expect(view.elementInjectors[0].get(SomeViewportDirectiveWithBinding).templProp).toBe('b');
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

    it('should bind to string literals', () => {
      var directives = [SomeDecoratorDirectiveWithBinding];
      var protoElementInjector = new ProtoElementInjector(null, 0, directives);
      var pipeline = createPipeline({directives: directives, protoElementInjector: protoElementInjector});
      var results = pipeline.process(el('<div viewroot directives boundprop1="foo"></div>'));
      var pv = results[0].inheritedProtoView;
      instantiateView(pv);
      changeDetector.detectChanges();

      expect(view.elementInjectors[0].get(SomeDecoratorDirectiveWithBinding).decorProp).toEqual('foo');
    });

    describe('errors', () => {

      it('should not throw any errors if there is no element property bindings for a directive ' +
          'property binding', () => {
        var pipeline = createPipeline({
          propertyBindings: MapWrapper.create(),
          directives: [SomeDecoratorDirectiveWithBinding]
        });

        // If processing throws an error, this test will fail.
        pipeline.process(el('<div viewroot prop-binding directives>'));
      });

    });

  });

}

@Decorator()
class SomeDecoratorDirective {
}

@Decorator({
  bind: {'decorProp': 'boundprop1'}
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
    'decorProp': 'boundprop1',
    'decorProp2': 'boundprop2'
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

@Viewport()
class SomeViewportDirective {
}

@Viewport({
  bind: {'templProp': 'boundprop2'}
})
class SomeViewportDirectiveWithBinding {
  templProp;
  constructor() {
    this.templProp = null;
  }
}

@Component()
class SomeComponentDirective {
}

@Component({bind: {'compProp': 'boundprop3'}})
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
    super();
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
