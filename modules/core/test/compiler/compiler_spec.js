import {describe, beforeEach, it, expect, ddescribe, iit} from 'test_lib/test_lib';
import {DOM} from 'facade/dom';
import {List} from 'facade/collection';

import {Compiler} from 'core/compiler/compiler';
import {ProtoView} from 'core/compiler/view';
import {Reflector} from 'core/compiler/reflector';
import {TemplateLoader} from 'core/compiler/template_loader';
import {Component} from 'core/annotations/component';
import {TemplateConfig} from 'core/annotations/template_config';
import {CompileElement} from 'core/compiler/pipeline/compile_element';
import {CompileStep} from 'core/compiler/pipeline/compile_step'
import {CompileControl} from 'core/compiler/pipeline/compile_control';

import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';
import {ClosureMap} from 'change_detection/parser/closure_map';

export function main() {
  describe('compiler', function() {
    var compiler, reflector;

    beforeEach( () => {
      reflector = new Reflector();
    });

    function createCompiler(processClosure) {
      var closureMap = new ClosureMap();
      var steps = [new MockStep(processClosure)];
      return new TestableCompiler(null, reflector, new Parser(new Lexer(), closureMap), closureMap, steps);
    }

    it('should run the steps and return the ProtoView of the root element', (done) => {
      var rootProtoView = new ProtoView(null, null);
      var compiler = createCompiler( (parent, current, control) => {
        current.inheritedProtoView = rootProtoView;
      });
      compiler.compile(MainComponent, createElement('<div></div>')).then( (protoView) => {
        expect(protoView).toBe(rootProtoView);
        done();
      });
    });

    it('should use the given element', (done) => {
      var el = createElement('<div></div>');
      var compiler = createCompiler( (parent, current, control) => {
        current.inheritedProtoView = new ProtoView(current.element, null);
      });
      compiler.compile(MainComponent, el).then( (protoView) => {
        expect(protoView.element).toBe(el);
        done();
      });
    });

    it('should use the inline template if no element is given explicitly', (done) => {
      var compiler = createCompiler( (parent, current, control) => {
        current.inheritedProtoView = new ProtoView(current.element, null);
      });
      compiler.compile(MainComponent, null).then( (protoView) => {
        expect(DOM.getInnerHTML(protoView.element)).toEqual('inline component');
        done();
      });
    });

    it('should load nested components', (done) => {
      var mainEl = createElement('<div></div>');
      var compiler = createCompiler( (parent, current, control) => {
        current.inheritedProtoView = new ProtoView(current.element, null);
        current.inheritedElementBinder = current.inheritedProtoView.bindElement(null);
        if (current.element === mainEl) {
          current.componentDirective = reflector.annotatedType(NestedComponent);
        }
      });
      compiler.compile(MainComponent, mainEl).then( (protoView) => {
        var nestedView = protoView.elementBinders[0].nestedProtoView;
        expect(DOM.getInnerHTML(nestedView.element)).toEqual('nested component');
        done();
      });

    });

  });

}

@Component({
  template: new TemplateConfig({
    inline: 'inline component'
  })
})
class MainComponent {}

@Component({
  template: new TemplateConfig({
    inline: 'nested component'
  })
})
class NestedComponent {}

class TestableCompiler extends Compiler {
  constructor(templateLoader:TemplateLoader, reflector:Reflector, parser, closureMap, steps:List<CompileStep>) {
    super(templateLoader, reflector, parser, closureMap);
    this.steps = steps;
  }
  createSteps(component):List<CompileStep> {
    return this.steps;
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

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
