import {describe, beforeEach, it, expect, iit, ddescribe, el} from 'angular2/test_lib';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

import {ProtoElementInjectorBuilder} from 'angular2/src/core/compiler/pipeline/proto_element_injector_builder';
import {CompilePipeline} from 'angular2/src/core/compiler/pipeline/compile_pipeline';
import {CompileElement} from 'angular2/src/core/compiler/pipeline/compile_element';
import {CompileStep} from 'angular2/src/core/compiler/pipeline/compile_step'
import {CompileControl} from 'angular2/src/core/compiler/pipeline/compile_control';
import {ProtoView} from 'angular2/src/core/compiler/view';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Viewport, Decorator, Component} from 'angular2/src/core/annotations/annotations';
import {ProtoElementInjector} from 'angular2/src/core/compiler/element_injector';

export function main() {
  describe('ProtoElementInjectorBuilder', () => {
    var protoElementInjectorBuilder, protoView;
    // Create consts for an elements with a var- so that we can fake parsing the var into
    // the CompileElement's variableBindings without actually doing any parsing.
    var ELEMENT_WITH_VAR;
    var DIRECTIVE_ELEMENT_WITH_VAR;

    beforeEach( () => {
      ELEMENT_WITH_VAR = el('<div var-name></div>');
      DIRECTIVE_ELEMENT_WITH_VAR = el('<div var-name directives></div>');
      protoElementInjectorBuilder = new TestableProtoElementInjectorBuilder();
      protoView = new ProtoView(null, null, null);
    });

    function createPipeline(directives = null) {
      if (isBlank(directives)) {
        directives = [];
      }
      var reader = new DirectiveMetadataReader();
      return new CompilePipeline([new MockStep((parent, current, control) => {
        if (isPresent(DOM.getAttribute(current.element, 'viewroot'))) {
          current.isViewRoot = true;
        }

        if (isPresent(DOM.getAttribute(current.element, 'directives'))) {
          for (var i=0; i<directives.length; i++) {
            var dirMetadata = reader.read(directives[i]);
            current.addDirective(dirMetadata);
          }
        }

        // Check only for the hard-coded var- attribute from ELEMENT_WITH_VAR test element.
        if (isPresent(DOM.getAttribute(current.element, 'var-name'))) {
          current.variableBindings = MapWrapper.create();
          MapWrapper.set(current.variableBindings, '\$implicit', 'name');
        }

        current.inheritedProtoView = protoView;
      }), protoElementInjectorBuilder]);
    }

    function getCreationArgs(protoElementInjector) {
      return protoElementInjectorBuilder.findArgsFor(protoElementInjector);
    }

    it('should not create a ProtoElementInjector for elements without directives or vars', () => {
      var results = createPipeline().process(el('<div></div>'));
      expect(results[0].inheritedProtoElementInjector).toBe(null);
    });

    it('should create a ProtoElementInjector for elements with a variable binding', () => {
      var results = createPipeline().process(ELEMENT_WITH_VAR);
      expect(results[0].inheritedProtoElementInjector).toBeAnInstanceOf(ProtoElementInjector);
    });

    it('should create a ProtoElementInjector for elements directives', () => {
      var directives = [SomeComponentDirective, SomeViewportDirective, SomeDecoratorDirective];
      var results = createPipeline(directives).process(el('<div directives></div>'));
      var creationArgs = getCreationArgs(results[0].inheritedProtoElementInjector);
      var boundDirectives = creationArgs['bindings'].map((b) => b.key.token);
      expect(boundDirectives).toEqual(directives);
    });

    it('should flag the ProtoElementInjector for exporting the component instance when a' +
        'component has a var- declaration', () => {
      var results = createPipeline([SomeComponentDirective]).process(DIRECTIVE_ELEMENT_WITH_VAR);
      expect(results[0].inheritedProtoElementInjector.exportComponent).toBe(true);
      expect(results[0].inheritedProtoElementInjector.exportElement).toBe(false);
    });

    it('should flag the ProtoElementInjector for exporting the element when a' +
        'non-component element has a var- declaration', () => {
      var results = createPipeline([SomeComponentDirective]).process(ELEMENT_WITH_VAR);
      expect(results[0].inheritedProtoElementInjector.exportComponent).toBe(false);
      expect(results[0].inheritedProtoElementInjector.exportElement).toBe(true);
    });

    it('should mark ProtoElementInjector for elements with component directives and use the ' +
        'ComponentDirective as first binding', () => {
      var directives = [SomeDecoratorDirective, SomeComponentDirective];
      var results = createPipeline(directives).process(el('<div directives></div>'));
      var creationArgs = getCreationArgs(results[0].inheritedProtoElementInjector);
      expect(creationArgs['firstBindingIsComponent']).toBe(true);
      var boundDirectives = creationArgs['bindings'].map((b) => b.key.token);
      expect(boundDirectives).toEqual([SomeComponentDirective, SomeDecoratorDirective]);
    });

    it('should use the next ElementBinder index as index of the ProtoElementInjector', () => {
      // just adding some indices..
      ListWrapper.push(protoView.elementBinders, null);
      ListWrapper.push(protoView.elementBinders, null);
      var directives = [SomeDecoratorDirective];
      var results = createPipeline(directives).process(el('<div directives></div>'));
      var creationArgs = getCreationArgs(results[0].inheritedProtoElementInjector);
      expect(creationArgs['index']).toBe(protoView.elementBinders.length);
    });

    describe("inheritedProtoElementInjector", () => {
      it('should inherit the ProtoElementInjector down to children without directives', () => {
        var directives = [SomeDecoratorDirective];
        var results = createPipeline(directives).process(el('<div directives><span></span></div>'));
        expect(results[1].inheritedProtoElementInjector).toBe(results[0].inheritedProtoElementInjector);
      });

      it('should use the ProtoElementInjector of the parent element as parent', () => {
        var element = el('<div directives><span><a directives></a></span></div>');
        var directives = [SomeDecoratorDirective];
        var results = createPipeline(directives).process(element);
        expect(results[2].inheritedProtoElementInjector.parent).toBe(
          results[0].inheritedProtoElementInjector);
      });

      it('should use a null parent for viewRoots', () => {
        var element = el('<div directives><span viewroot directives></span></div>');
        var directives = [SomeDecoratorDirective];
        var results = createPipeline(directives).process(element);
        expect(results[1].inheritedProtoElementInjector.parent).toBe(null);
      });

      it('should use a null parent if there is an intermediate viewRoot', () => {
        var element = el('<div directives><span viewroot><a directives></a></span></div>');
        var directives = [SomeDecoratorDirective];
        var results = createPipeline(directives).process(element);
        expect(results[2].inheritedProtoElementInjector.parent).toBe(null);
      });
    });

    describe("distanceToParentInjector", () => {
      it("should be 0 for root elements", () => {
        var element = el('<div directives></div>');
        var directives = [SomeDecoratorDirective];
        var results = createPipeline(directives).process(element);
        expect(results[0].inheritedProtoElementInjector.distanceToParent).toBe(0);
      });

      it("should be 1 when a parent element has an injector", () => {
        var element = el('<div directives><span directives></span></div>');
        var directives = [SomeDecoratorDirective];
        var results = createPipeline(directives).process(element);
        expect(results[1].inheritedProtoElementInjector.distanceToParent).toBe(1);
      });

      it("should add 1 for every element that does not have an injector", () => {
        var element = el('<div directives><a><b><span directives></span></b></a></div>');
        var directives = [SomeDecoratorDirective];
        var results = createPipeline(directives).process(element);
        expect(results[3].inheritedProtoElementInjector.distanceToParent).toBe(3);
      });
    });
  });
}


class TestableProtoElementInjectorBuilder extends ProtoElementInjectorBuilder {
  debugObjects:List;

  constructor() {
    super();
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

  internalCreateProtoElementInjector(parent, index, bindings, firstBindingIsComponent, distance) {
    var result = new ProtoElementInjector(parent, index, bindings, firstBindingIsComponent, distance);
    ListWrapper.push(this.debugObjects, result);
    ListWrapper.push(this.debugObjects, {'parent': parent, 'index': index, 'bindings': bindings, 'firstBindingIsComponent': firstBindingIsComponent});
    return result;
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

class SomeComponentService {}

@Viewport()
class SomeViewportDirective {}

@Component({
  componentServices: [SomeComponentService]
})
class SomeComponentDirective {}

@Decorator()
class SomeDecoratorDirective {}
