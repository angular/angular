import {describe, beforeEach, it, expect, ddescribe, iit, el} from 'test_lib/test_lib';
import {DOM} from 'facade/src/dom';
import {List} from 'facade/src/collection';

import {Compiler, CompilerCache} from 'core/src/compiler/compiler';
import {ProtoView} from 'core/src/compiler/view';
import {DirectiveMetadataReader} from 'core/src/compiler/directive_metadata_reader';
import {TemplateLoader} from 'core/src/compiler/template_loader';
import {Component} from 'core/src/annotations/annotations';
import {TemplateConfig} from 'core/src/annotations/template_config';
import {CompileElement} from 'core/src/compiler/pipeline/compile_element';
import {CompileStep} from 'core/src/compiler/pipeline/compile_step'
import {CompileControl} from 'core/src/compiler/pipeline/compile_control';

import {Lexer, Parser, dynamicChangeDetection} from 'change_detection/change_detection';

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
      compiler.compile(MainComponent, el('<div></div>')).then( (protoView) => {
        expect(protoView).toBe(rootProtoView);
        done();
      });
    });

    it('should use the given element', (done) => {
      var element = el('<div></div>');
      var compiler = createCompiler( (parent, current, control) => {
        current.inheritedProtoView = new ProtoView(current.element, null);
      });
      compiler.compile(MainComponent, element).then( (protoView) => {
        expect(protoView.element).toBe(element);
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
      var mainEl = el('<div></div>');
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
      var element = el('<div></div>');
      var compiler = createCompiler( (parent, current, control) => {
        current.inheritedProtoView = new ProtoView(current.element, null);
      });
      var firstProtoView;
      compiler.compile(MainComponent, element).then( (protoView) => {
        firstProtoView = protoView;
        return compiler.compile(MainComponent, element);
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
    super(dynamicChangeDetection, null, reader, new Parser(new Lexer()), new CompilerCache());
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
