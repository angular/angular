import {describe, beforeEach, expect, it, iit, ddescribe, el} from 'angular2/test_lib';

import {CompilePipeline} from 'angular2/src/core/compiler/pipeline/compile_pipeline';
import {ShimShadowDom} from 'angular2/src/core/compiler/pipeline/shim_shadow_dom';
import {CompileElement} from 'angular2/src/core/compiler/pipeline/compile_element';
import {CompileStep} from 'angular2/src/core/compiler/pipeline/compile_step';
import {CompileControl} from 'angular2/src/core/compiler/pipeline/compile_control';
import {ShimComponent} from 'angular2/src/core/compiler/shadow_dom_emulation/shim_component';

import {Component} from 'angular2/src/core/annotations/annotations';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {ShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';

import {Type, isBlank} from 'angular2/src/facade/lang';
import {DOM, Element} from 'angular2/src/facade/dom';

export function main() {
  describe('ShimShadowDom', () => {
    function createPipeline(ignoreBindings: boolean) {
      var component = new Component({selector: 'selector'});
      var meta = new DirectiveMetadata(null, component);
      var shimShadowDom = new ShimShadowDom(meta, new FakeStrategy());

      return new CompilePipeline([
        new MockStep((parent, current, control) => {
          current.ignoreBindings = ignoreBindings;
        }),
        new MockStep((parent, current, control) => {
          var el = current.element;
          if (DOM.hasClass(el, 'host')) {
            current.componentDirective = new DirectiveMetadata(SomeComponent, null);
          }
        }),
        shimShadowDom
      ]);
    }

    it('should add the content attribute to content element', () => {
      var pipeline = createPipeline(false);
      var results = pipeline.process(el('<div></div>'));
      expect(DOM.getAttribute(results[0].element, '_ngcontent')).toEqual('content');
      expect(isBlank(DOM.getAttribute(results[0].element, '_nghost'))).toBeTruthy();
    });

    it('should add both the content and host attributes to host element', () => {
      var pipeline = createPipeline(false);
      var results = pipeline.process(el('<div class="host"></div>'));
      expect(DOM.getAttribute(results[0].element, '_ngcontent')).toEqual('content');
      expect(DOM.getAttribute(results[0].element, '_nghost')).toEqual('host');
    });

    it('should do nothing when ignoreBindings is true', () => {
      var pipeline = createPipeline(true);
      var results = pipeline.process(el('<div class="host"></div>'));
      expect(isBlank(DOM.getAttribute(results[0].element, '_ngcontent'))).toBeTruthy();
      expect(isBlank(DOM.getAttribute(results[0].element, '_nghost'))).toBeTruthy();
    });
  });
}

class FakeStrategy extends ShadowDomStrategy {
  constructor() {
    super();
  }

  getShimComponent(component: Type): ShimComponent {
    return new FakeShimComponent(component);
  }
}

class FakeShimComponent extends ShimComponent {
  constructor(component: Type) {
    super(component);
  }

  shimContentElement(element: Element) {
    DOM.setAttribute(element, '_ngcontent', 'content');
  }

  shimHostElement(element: Element) {
    DOM.setAttribute(element, '_nghost', 'host');
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

class SomeComponent {}

