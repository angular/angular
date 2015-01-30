import {describe, beforeEach, it, expect, ddescribe, iit, el, IS_DARTIUM} from 'angular2/test_lib';
import {DOM, Element, TemplateElement} from 'angular2/src/facade/dom';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';
import {Type, isBlank} from 'angular2/src/facade/lang';
import {PromiseWrapper} from 'angular2/src/facade/async';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {ProtoView} from 'angular2/src/core/compiler/view';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {Component} from 'angular2/src/core/annotations/annotations';
import {TemplateConfig} from 'angular2/src/core/annotations/template_config';
import {CompileElement} from 'angular2/src/core/compiler/pipeline/compile_element';
import {CompileStep} from 'angular2/src/core/compiler/pipeline/compile_step'
import {CompileControl} from 'angular2/src/core/compiler/pipeline/compile_control';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';

import {Lexer, Parser, dynamicChangeDetection} from 'angular2/change_detection';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {XHRMock} from 'angular2/src/mock/xhr_mock';

export function main() {
  describe('compiler', function() {
    var reader;

    beforeEach( () => {
      reader = new DirectiveMetadataReader();
    });

    function createCompiler(processClosure, strategy:ShadowDomStrategy = null, xhr: XHRMock = null) {
      var steps = [new MockStep(processClosure)];
      if (isBlank(strategy)) {
        strategy = new NativeShadowDomStrategy();
      }
      if (isBlank(xhr)) {
        xhr = new XHRMock();
      }
      return new TestableCompiler(reader, steps, strategy, xhr);
    }

    it('should run the steps and return the ProtoView of the root element', (done) => {
      var rootProtoView = new ProtoView(null, null, null);
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
        current.inheritedProtoView = new ProtoView(current.element, null, null);
      });
      compiler.compile(MainComponent, element).then( (protoView) => {
        expect(protoView.element).toBe(element);
        done();
      });
    });

    it('should use the inline template if no element is given explicitly', (done) => {
      var compiler = createCompiler( (parent, current, control) => {
        current.inheritedProtoView = new ProtoView(current.element, null, null);
      });
      compiler.compile(MainComponent, null).then( (protoView) => {
        expect(DOM.getInnerHTML(protoView.element)).toEqual('inline component');
        done();
      });
    });

    it('should use the shadow dom strategy to process the template', (done) => {
      // TODO(vicb) test in Dart when the bug is fixed
      // https://code.google.com/p/dart/issues/detail?id=18249
      if (IS_DARTIUM) {
        done();
        return;
      }
      var templateHtml = 'processed template';
      var compiler = createCompiler((parent, current, control) => {
        current.inheritedProtoView = new ProtoView(current.element, null, null);
      }, new FakeShadowDomStrategy(templateHtml));
      compiler.compile(MainComponent, null).then( (protoView) => {
        expect(DOM.getInnerHTML(protoView.element)).toEqual('processed template');
        done();
      });
    });

    it('should load nested components', (done) => {
      var mainEl = el('<div></div>');
      var compiler = createCompiler( (parent, current, control) => {
        current.inheritedProtoView = new ProtoView(current.element, null, null);
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

    it('should cache compiled components', (done) => {
      var element = el('<div></div>');
      var compiler = createCompiler( (parent, current, control) => {
        current.inheritedProtoView = new ProtoView(current.element, null, null);
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

    it('should re-use components being compiled', (done) => {
      var nestedElBinders = [];
      var mainEl = el('<div><div class="nested"></div><div class="nested"></div></div>');
      var compiler = createCompiler( (parent, current, control) => {
        if (DOM.hasClass(current.element, 'nested')) {
          current.inheritedProtoView = new ProtoView(current.element, null, null);
          current.inheritedElementBinder = current.inheritedProtoView.bindElement(null);
          current.componentDirective = reader.read(NestedComponent);
          ListWrapper.push(nestedElBinders, current.inheritedElementBinder);
        }
      });
      compiler.compile(MainComponent, mainEl).then( (protoView) => {
        expect(nestedElBinders[0].nestedProtoView).toBe(nestedElBinders[1].nestedProtoView);
        done();
      });
    });

    it('should allow recursive components', (done) => {
      var compiler = createCompiler( (parent, current, control) => {
        current.inheritedProtoView = new ProtoView(current.element, null, null);
        current.inheritedElementBinder = current.inheritedProtoView.bindElement(null);
        current.componentDirective = reader.read(RecursiveComponent);
      });
      compiler.compile(RecursiveComponent, null).then( (protoView) => {
        expect(protoView.elementBinders[0].nestedProtoView).toBe(protoView);
        done();
      });
    });

    describe('XHR', () => {
      it('should load template via xhr', (done) => {
        var xhr = new XHRMock();
        xhr.expect('/parent', 'xhr');

        var compiler = createCompiler((parent, current, control) => {
          current.inheritedProtoView = new ProtoView(current.element, null, null);
        }, null, xhr);

        compiler.compile(XHRParentComponent).then( (protoView) => {
          expect(DOM.getInnerHTML(protoView.element)).toEqual('xhr');
          done();
        });

        xhr.flush();
      });

      it('should return a rejected promise when loading a template fails', (done) => {
        var xhr = new XHRMock();
        xhr.expect('/parent', null);

        var compiler = createCompiler((parent, current, control) => {}, null, xhr);

        PromiseWrapper.then(compiler.compile(XHRParentComponent),
          function(_) { throw 'Failure expected'; },
          function(e) {
            expect(e.message).toEqual('Failed to load the template for XHRParentComponent');
            done();
          }
        );

        xhr.flush();
      });
    });
  });

}


@Component({
  template: new TemplateConfig({
    url: '/parent'
  })
})
class XHRParentComponent {}

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

  constructor(reader:DirectiveMetadataReader, steps:List<CompileStep>, strategy:ShadowDomStrategy,
    xhr: XHRMock) {
    super(dynamicChangeDetection,
          new TemplateLoader(xhr),
          reader,
          new Parser(new Lexer()),
          new CompilerCache(),
          strategy);
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

class FakeShadowDomStrategy extends NativeShadowDomStrategy {
  templateHtml: string;
  constructor(templateHtml: string) {
    this.templateHtml = templateHtml;
  }

  processTemplate(template: Element, cmpMetadata: DirectiveMetadata) {
    DOM.setInnerHTML(template, this.templateHtml);
  }
}
