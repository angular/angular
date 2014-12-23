import {describe, beforeEach, it, expect, ddescribe, iit} from 'test_lib/test_lib';
import {DOM} from 'facade/dom';
import {List} from 'facade/collection';

import {Compiler, CompilerCache} from 'core/compiler/compiler';
import {ProtoView} from 'core/compiler/view';
import {DirectiveMetadataReader} from 'core/compiler/directive_metadata_reader';
import {TemplateLoader} from 'core/compiler/template_loader';
import {Component} from 'core/annotations/annotations';
import {TemplateConfig} from 'core/annotations/template_config';
import {CompileElement} from 'core/compiler/pipeline/compile_element';
import {CompileStep} from 'core/compiler/pipeline/compile_step'
import {CompileControl} from 'core/compiler/pipeline/compile_control';

import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';

export function main() {
  describe('compiler', function() {
    var reader;

    beforeEach( () => {
      reader = new DirectiveMetadataReader();
    });

    function createCompiler(processClosure) {
      var steps = [new MockStep(processClosure)];
      return new TestableCompiler(reader, steps);
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
          current.componentDirective = reader.read(NestedComponent);
        }
      });
      compiler.compile(MainComponent, mainEl).then( (protoView) => {
        var nestedView = protoView.elementBinders[0].nestedProtoView;
        expect(DOM.getInnerHTML(nestedView.element)).toEqual('nested component');
        done();
      });

    });

    it('should cache components', (done) => {
      var el = createElement('<div></div>');
      var compiler = createCompiler( (parent, current, control) => {
        current.inheritedProtoView = new ProtoView(current.element, null);
      });
      var firstProtoView;
      compiler.compile(MainComponent, el).then( (protoView) => {
        firstProtoView = protoView;
        return compiler.compile(MainComponent, el);
      }).then( (protoView) => {
        expect(firstProtoView).toBe(protoView);
        done();
      });

    });

    it('should allow recursive components', (done) => {
      var compiler = createCompiler( (parent, current, control) => {
        current.inheritedProtoView = new ProtoView(current.element, null);
        current.inheritedElementBinder = current.inheritedProtoView.bindElement(null);
        current.componentDirective = reader.read(RecursiveComponent);
      });
      compiler.compile(RecursiveComponent, null).then( (protoView) => {
        expect(protoView.elementBinders[0].nestedProtoView).toBe(protoView);
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

@Component({
  template: new TemplateConfig({
    inline: '<div rec-comp></div>'
  }),
  selector: 'rec-comp'
})
class RecursiveComponent {}

class TestableCompiler extends Compiler {
  steps:List;
  constructor(reader:DirectiveMetadataReader, steps:List<CompileStep>) {
    super(null, reader, new Parser(new Lexer()), new CompilerCache());
    this.steps = steps;
  }
  createSteps(component):List<CompileStep> {
    return this.steps;
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

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
