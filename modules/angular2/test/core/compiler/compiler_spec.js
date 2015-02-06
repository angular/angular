import {describe, beforeEach, it, expect, ddescribe, iit, el, IS_DARTIUM} from 'angular2/test_lib';
import {DOM, Element, TemplateElement} from 'angular2/src/facade/dom';
import {List, ListWrapper, Map, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {Type, isBlank, stringify} from 'angular2/src/facade/lang';
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

    var syncTemplateLoader = new FakeTemplateLoader();
    syncTemplateLoader.forceSync();
    var asyncTemplateLoader = new FakeTemplateLoader();
    asyncTemplateLoader.forceAsync();

    StringMapWrapper.forEach({
      '(sync TemplateLoader)': syncTemplateLoader,
      '(async TemplateLoader)': asyncTemplateLoader
    }, (templateLoader, name) => {

      describe(name, () => {

        function createCompiler(processClosure) {
          var steps = [new MockStep(processClosure)];
          return new TestableCompiler(reader, steps, templateLoader);
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
      });
    });

    describe('(mixed async, sync TemplateLoader)', () => {
      function createCompiler(processClosure, templateLoader: TemplateLoader) {
        var steps = [new MockStep(processClosure)];
        return new TestableCompiler(reader, steps, templateLoader);
      }

      function createNestedComponentSpec(name, loader: TemplateLoader, error:string = null) {
        it(`should load nested components ${name}`, (done) => {

          var compiler = createCompiler((parent, current, control) => {
            if (DOM.hasClass(current.element, 'parent')) {
              current.componentDirective = reader.read(NestedComponent);
              current.inheritedProtoView = parent.inheritedProtoView;
              current.inheritedElementBinder = current.inheritedProtoView.bindElement(null);
            } else {
              current.inheritedProtoView = new ProtoView(current.element, null, null);
            }
          }, loader);

          PromiseWrapper.then(compiler.compile(ParentComponent),
            function(protoView) {
              var nestedView = protoView.elementBinders[0].nestedProtoView;
              expect(error).toBeNull();
              expect(DOM.getInnerHTML(nestedView.element)).toEqual('nested component');
              done();
            },
            function(compileError) {
              expect(compileError.message).toEqual(error);
              done();
            }
          );
        });
      }

      var loader = new FakeTemplateLoader();
      loader.setSync(ParentComponent);
      loader.setSync(NestedComponent);
      createNestedComponentSpec('(sync -> sync)', loader);

      loader = new FakeTemplateLoader();
      loader.setAsync(ParentComponent);
      loader.setSync(NestedComponent);
      createNestedComponentSpec('(async -> sync)', loader);

      loader = new FakeTemplateLoader();
      loader.setSync(ParentComponent);
      loader.setAsync(NestedComponent);
      createNestedComponentSpec('(sync -> async)', loader);

      loader = new FakeTemplateLoader();
      loader.setAsync(ParentComponent);
      loader.setAsync(NestedComponent);
      createNestedComponentSpec('(async -> async)', loader);

      loader = new FakeTemplateLoader();
      loader.setError(ParentComponent);
      loader.setSync(NestedComponent);
      createNestedComponentSpec('(error -> sync)', loader,
        'Failed to load the template for ParentComponent');

      // TODO(vicb): Check why errors this fails with Dart
      // TODO(vicb): The Promise is rejected with the correct error but an exc is thrown before
      //loader = new FakeTemplateLoader();
      //loader.setSync(ParentComponent);
      //loader.setError(NestedComponent);
      //createNestedComponentSpec('(sync -> error)', loader,
      //  'Failed to load the template for NestedComponent -> Failed to compile ParentComponent');
      //
      //loader = new FakeTemplateLoader();
      //loader.setAsync(ParentComponent);
      //loader.setError(NestedComponent);
      //createNestedComponentSpec('(async -> error)', loader,
      //  'Failed to load the template for NestedComponent -> Failed to compile ParentComponent');

    });
  });
}

@Component({
  template: new TemplateConfig({
    inline: '<div class="parent"></div>'
  })
})
class ParentComponent {}

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

  constructor(reader:DirectiveMetadataReader, steps:List<CompileStep>, loader: TemplateLoader) {
    super(dynamicChangeDetection, loader, reader, new Parser(new Lexer()), new CompilerCache(),
          new NativeShadowDomStrategy());
    this.steps = steps;
  }

  createSteps(component):List<CompileStep> {
    return this.steps;
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

class FakeTemplateLoader extends TemplateLoader {
  _forceSync: boolean;
  _forceAsync: boolean;
  _syncCmp: List<Type>;
  _asyncCmp: List<Type>;
  _errorCmp: List<Type>;

  constructor() {
    super (new XHRMock());
    this._forceSync = false;
    this._forceAsync = false;
    this._syncCmp = [];
    this._asyncCmp = [];
    this._errorCmp = [];
  }

  forceSync() {
    this._forceSync = true;
    this._forceAsync = false;
  }

  forceAsync() {
    this._forceAsync = true;
    this._forceSync = false;
  }

  setSync(component: Type) {
    ListWrapper.push(this._syncCmp, component);
  }

  setAsync(component: Type) {
    ListWrapper.push(this._asyncCmp, component);
  }

  setError(component: Type) {
    ListWrapper.push(this._errorCmp, component);
  }

  load(cmpMetadata: DirectiveMetadata) {
    var annotation:Component = cmpMetadata.annotation;
    var tplConfig:TemplateConfig = annotation.template;

    if (isBlank(tplConfig.inline)) {
      throw 'The component must define an inline template';
    }

    var template = DOM.createTemplate(tplConfig.inline);

    if (ListWrapper.contains(this._errorCmp, cmpMetadata.type)) {
      return PromiseWrapper.reject('Fail to load');
    }

    if (ListWrapper.contains(this._syncCmp, cmpMetadata.type)) {
      return template;
    }

    if (ListWrapper.contains(this._asyncCmp, cmpMetadata.type)) {
      return PromiseWrapper.resolve(template);
    }

    if (this._forceSync) return template;
    if (this._forceAsync) return PromiseWrapper.resolve(template);

    throw `No template configured for ${stringify(cmpMetadata.type)}`;
  }
}
