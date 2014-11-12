import {describe, beforeEach, it, expect, iit, ddescribe} from 'test_lib/test_lib';
import {isPresent, isBlank} from 'facade/lang';
import {DOM} from 'facade/dom';
import {ListWrapper} from 'facade/collection';

import {ProtoElementInjectorBuilder} from 'core/compiler/pipeline/proto_element_injector_builder';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {CompileElement} from 'core/compiler/pipeline/compile_element';
import {CompileStep} from 'core/compiler/pipeline/compile_step'
import {CompileControl} from 'core/compiler/pipeline/compile_control';
import {ProtoView} from 'core/compiler/view';
import {Reflector} from 'core/compiler/reflector';
import {Template} from 'core/annotations/template';
import {Decorator} from 'core/annotations/decorator';
import {Component} from 'core/annotations/component';
import {ProtoElementInjector} from 'core/compiler/element_injector';

export function main() {
  describe('ProtoElementInjectorBuilder', () => {
    var protoElementInjectorBuilder, protoView;
    beforeEach( () => {
      protoElementInjectorBuilder = new TestableProtoElementInjectorBuilder();
      protoView = new ProtoView(null, null);
    });

    function createPipeline(directives = null) {
      if (isBlank(directives)) {
        directives = [];
      }
      var reflector = new Reflector();
      return new CompilePipeline([new MockStep((parent, current, control) => {
        if (isPresent(current.element.getAttribute('viewroot'))) {
          current.isViewRoot = true;
        }
        if (isPresent(current.element.getAttribute('directives'))) {
          for (var i=0; i<directives.length; i++) {
            current.addDirective(reflector.annotatedType(directives[i]));
          }
        }
        current.inheritedProtoView = protoView;
      }), protoElementInjectorBuilder]);
    }

    function assertProtoElementInjector(protoElementInjector, parent, index, bindings) {
      var args = protoElementInjectorBuilder.findArgsFor(protoElementInjector);
      expect(args).toEqual([parent, index, bindings]);
    }

    it('should not create a ProtoElementInjector for elements without directives', () => {
      var results = createPipeline().process(createElement('<div></div>'));
      expect(results[0].inheritedProtoElementInjector).toBe(null);
    });

    it('should create a ProtoElementInjector for elements with directives', () => {
      var directives = [SomeDecoratorDirective, SomeTemplateDirective, SomeComponentDirective];
      var results = createPipeline(directives).process(createElement('<div directives></div>'));
      assertProtoElementInjector(results[0].inheritedProtoElementInjector, null, 0, directives);
    });

    it('should use the next ElementBinder index as index of the ProtoElementInjector', () => {
      // just adding some indices..
      ListWrapper.push(protoView.elementBinders, null);
      ListWrapper.push(protoView.elementBinders, null);
      var directives = [SomeDecoratorDirective];
      var results = createPipeline(directives).process(createElement('<div directives></div>'));
      assertProtoElementInjector(
        results[0].inheritedProtoElementInjector, null, protoView.elementBinders.length, directives);
    });

    it('should inherit the ProtoElementInjector down to children without directives', () => {
      var directives = [SomeDecoratorDirective, SomeTemplateDirective, SomeComponentDirective];
      var results = createPipeline(directives).process(createElement('<div directives><span></span></div>'));
      assertProtoElementInjector(results[0].inheritedProtoElementInjector, null, 0, directives);
      assertProtoElementInjector(results[1].inheritedProtoElementInjector, null, 0, directives);
    });

    it('should use the ProtoElementInjector of the parent element as parent', () => {
      var el = createElement('<div directives><span><a directives></a></span></div>');
      var directives = [SomeDecoratorDirective, SomeTemplateDirective, SomeComponentDirective];
      var results = createPipeline(directives).process(el);
      assertProtoElementInjector(results[2].inheritedProtoElementInjector,
        results[0].inheritedProtoElementInjector, 0, directives);
    });

    it('should use a null parent for viewRoots', () => {
      var el = createElement('<div directives><span viewroot directives></span></div>');
      var directives = [SomeDecoratorDirective, SomeTemplateDirective, SomeComponentDirective];
      var results = createPipeline(directives).process(el);
      assertProtoElementInjector(results[1].inheritedProtoElementInjector, null, 0, directives);
    });

    it('should use a null parent if there is an intermediate viewRoot', () => {
      var el = createElement('<div directives><span viewroot><a directives></a></span></div>');
      var directives = [SomeDecoratorDirective, SomeTemplateDirective, SomeComponentDirective];
      var results = createPipeline(directives).process(el);
      assertProtoElementInjector(results[2].inheritedProtoElementInjector, null, 0, directives);
    });
  });
}


class TestableProtoElementInjectorBuilder extends ProtoElementInjectorBuilder {
  constructor() {
    this.debugObjects = [];
  }
  findArgsFor(protoElementInjector:ProtoElementInjector) {
    for (var i=0; i<this.debugObjects.length; i+=2) {
      if (this.debugObjects[i] === protoElementInjector) {
        return this.debugObjects[i+1];
      }
    }
    return null;
  }
  internalCreateProtoElementInjector(parent, index, directives) {
    var result = new ProtoElementInjector(parent, index, directives);
    ListWrapper.push(this.debugObjects, result);
    ListWrapper.push(this.debugObjects, [parent, index, directives]);
    return result;
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

@Template()
class SomeTemplateDirective {}

@Component()
class SomeComponentDirective {}

@Decorator()
class SomeDecoratorDirective {}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}