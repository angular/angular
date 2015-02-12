import {describe, beforeEach, it, expect, ddescribe, iit, el, IS_DARTIUM} from 'angular2/test_lib';

import {DOM, Element, TemplateElement} from 'angular2/src/facade/dom';
import {List, ListWrapper, Map, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {Type, isBlank, stringify, isPresent} from 'angular2/src/facade/lang';
import {PromiseWrapper} from 'angular2/src/facade/async';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {ProtoView} from 'angular2/src/core/compiler/view';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {Component} from 'angular2/src/core/annotations/annotations';
import {Template} from 'angular2/src/core/annotations/template';
import {CompileElement} from 'angular2/src/core/compiler/pipeline/compile_element';
import {CompileStep} from 'angular2/src/core/compiler/pipeline/compile_step'
import {CompileControl} from 'angular2/src/core/compiler/pipeline/compile_control';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';

import {Lexer, Parser, dynamicChangeDetection} from 'angular2/change_detection';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';

export function main() {
  describe('compiler', function() {
    StringMapWrapper.forEach({
      '(sync TemplateLoader)': true,
      '(async TemplateLoader)': false
    }, (sync, name) => {
      var reader, tplResolver;

      beforeEach(() => {
        reader = new DirectiveMetadataReader();
        tplResolver = new FakeTemplateResolver();
        if (sync) {
          tplResolver.forceSync();
        } else {
          tplResolver.forceAsync();
        }
      });

      describe(name, () => {

        function createCompiler(processClosure) {
          var steps = [new MockStep(processClosure)];
          return new TestableCompiler(reader, steps, new FakeTemplateLoader(), tplResolver);
        }

        it('should run the steps and return the ProtoView of the root element', (done) => {
          var rootProtoView = new ProtoView(null, null, null);
          var compiler = createCompiler( (parent, current, control) => {
            current.inheritedProtoView = rootProtoView;
          });
          tplResolver.setTemplate(MainComponent, new Template({inline: '<div></div>'}));
          compiler.compile(MainComponent).then( (protoView) => {
            expect(protoView).toBe(rootProtoView);
            done();
          });
        });

        it('should use the inline template', (done) => {
          var compiler = createCompiler( (parent, current, control) => {
            current.inheritedProtoView = new ProtoView(current.element, null, null);
          });
          compiler.compile(MainComponent).then( (protoView) => {
            expect(DOM.getInnerHTML(protoView.element)).toEqual('inline component');
            done();
          });
        });

        it('should load nested components', (done) => {
          var compiler = createCompiler( (parent, current, control) => {
            if (DOM.hasClass(current.element, 'nested')) {
              current.componentDirective = reader.read(NestedComponent);
              current.inheritedProtoView = parent.inheritedProtoView;
              current.inheritedElementBinder = current.inheritedProtoView.bindElement(null);
            } else {
              current.inheritedProtoView = new ProtoView(current.element, null, null);
            }
          });
          tplResolver.setTemplate(MainComponent, new Template({inline: '<div class="nested"></div>'}));
          compiler.compile(MainComponent).then( (protoView) => {
            var nestedView = protoView.elementBinders[0].nestedProtoView;
            expect(DOM.getInnerHTML(nestedView.element)).toEqual('nested component');
            done();
          });
        });

        it('should cache compiled components', (done) => {
          var compiler = createCompiler( (parent, current, control) => {
            current.inheritedProtoView = new ProtoView(current.element, null, null);
          });
          var firstProtoView;
          tplResolver.setTemplate(MainComponent, new Template({inline: '<div></div>'}));
          compiler.compile(MainComponent).then( (protoView) => {
            firstProtoView = protoView;
            return compiler.compile(MainComponent);
          }).then( (protoView) => {
            expect(firstProtoView).toBe(protoView);
            done();
          });
        });

        it('should re-use components being compiled', (done) => {
          var nestedElBinders = [];
          var compiler = createCompiler( (parent, current, control) => {
            if (DOM.hasClass(current.element, 'nested')) {
              current.inheritedProtoView = new ProtoView(current.element, null, null);
              current.inheritedElementBinder = current.inheritedProtoView.bindElement(null);
              current.componentDirective = reader.read(NestedComponent);
              ListWrapper.push(nestedElBinders, current.inheritedElementBinder);
            }
          });
          tplResolver.setTemplate(MainComponent,
            new Template({inline: '<div><div class="nested"></div><div class="nested"></div></div>'}));
          compiler.compile(MainComponent).then( (protoView) => {
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
          compiler.compile(RecursiveComponent).then( (protoView) => {
            expect(protoView.elementBinders[0].nestedProtoView).toBe(protoView);
            done();
          });
        });
      });
    });

    describe('(mixed async, sync TemplateLoader)', () => {
      var reader = new DirectiveMetadataReader();

      function createCompiler(processClosure, resolver: TemplateResolver) {
        var steps = [new MockStep(processClosure)];
        return new TestableCompiler(reader, steps, new FakeTemplateLoader(), resolver);
      }

      function createNestedComponentSpec(name, resolver: TemplateResolver, error:string = null) {
        it(`should load nested components ${name}`, (done) => {

          var compiler = createCompiler((parent, current, control) => {
            if (DOM.hasClass(current.element, 'parent')) {
              current.componentDirective = reader.read(NestedComponent);
              current.inheritedProtoView = parent.inheritedProtoView;
              current.inheritedElementBinder = current.inheritedProtoView.bindElement(null);
            } else {
              current.inheritedProtoView = new ProtoView(current.element, null, null);
            }
          }, resolver);

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

      var resolver = new FakeTemplateResolver();
      resolver.setSync(ParentComponent);
      resolver.setSync(NestedComponent);
      createNestedComponentSpec('(sync -> sync)', resolver);

      resolver = new FakeTemplateResolver();
      resolver.setAsync(ParentComponent);
      resolver.setSync(NestedComponent);
      createNestedComponentSpec('(async -> sync)', resolver);

      resolver = new FakeTemplateResolver();
      resolver.setSync(ParentComponent);
      resolver.setAsync(NestedComponent);
      createNestedComponentSpec('(sync -> async)', resolver);

      resolver = new FakeTemplateResolver();
      resolver.setAsync(ParentComponent);
      resolver.setAsync(NestedComponent);
      createNestedComponentSpec('(async -> async)', resolver);

      resolver = new FakeTemplateResolver();
      resolver.setError(ParentComponent);
      resolver.setSync(NestedComponent);
      createNestedComponentSpec('(error -> sync)', resolver,
        'Failed to load the template for ParentComponent');

      // TODO(vicb): Check why errors this fails with Dart
      // TODO(vicb): The Promise is rejected with the correct error but an exc is thrown before
      //resolver = new FakeTemplateResolver();
      //resolver.setSync(ParentComponent);
      //resolver.setError(NestedComponent);
      //createNestedComponentSpec('(sync -> error)', resolver,
      //  'Failed to load the template for NestedComponent -> Failed to compile ParentComponent');
      //
      //resolver = new FakeTemplateResolver();
      //resolver.setAsync(ParentComponent);
      //resolver.setError(NestedComponent);
      //createNestedComponentSpec('(async -> error)', resolver,
      //  'Failed to load the template for NestedComponent -> Failed to compile ParentComponent');

    });
  });
}

@Component()
@Template({inline: '<div class="parent"></div>'})
class ParentComponent {}

@Component()
@Template({inline: 'inline component'})
class MainComponent {}

@Component()
@Template({inline: 'nested component'})
class NestedComponent {}

@Component({selector: 'rec-comp'})
@Template({inline: '<div rec-comp></div>'})
class RecursiveComponent {}

class TestableCompiler extends Compiler {
  steps:List;

  constructor(reader:DirectiveMetadataReader, steps:List<CompileStep>, loader: TemplateLoader,
    resolver: TemplateResolver) {
    super(dynamicChangeDetection, loader, reader, new Parser(new Lexer()), new CompilerCache(),
          new NativeShadowDomStrategy(), resolver);
    this.steps = steps;
  }

  createSteps(component:Type, template: Template):List<CompileStep> {
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
  constructor() {
    super(null);
  }

  load(template: Template) {
    if (isPresent(template.inline)) {
      return DOM.createTemplate(template.inline);
    }

    if (isPresent(template.url)) {
      var tplElement = DOM.createTemplate(template.url);
      return PromiseWrapper.resolve(tplElement);
    }

    return PromiseWrapper.reject('Fail to load');
  }
}

class FakeTemplateResolver extends TemplateResolver {
  _forceSync: boolean;
  _forceAsync: boolean;
  _cmpTemplates: Map;
  _syncCmp: List<Type>;
  _asyncCmp: List<Type>;
  _errorCmp: List<Type>;

  constructor() {
    super();
    this._forceSync = false;
    this._forceAsync = false;
    this._syncCmp = [];
    this._asyncCmp = [];
    this._errorCmp = [];
    this._cmpTemplates = MapWrapper.create();
  }

  resolve(component: Type): Template {
    var template = MapWrapper.get(this._cmpTemplates, component);
    if (isBlank(template)) {
      template = super.resolve(component);
    }

    var html = template.inline;

    if (isBlank(template.inline)) {
      throw 'The tested component must define an inline template';
    }

    if (ListWrapper.contains(this._errorCmp, component)) {
      return new Template({url: null, inline: null});
    }

    if (ListWrapper.contains(this._syncCmp, component)) {
      return new Template({inline: html});
    }

    if (ListWrapper.contains(this._asyncCmp, component)) {
      return new Template({url: html});
    }

    if (this._forceSync) return new Template({inline: html});
    if (this._forceAsync) return new Template({url: html});

    throw 'No template';
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

  setTemplate(component: Type, template: Template) {
    MapWrapper.set(this._cmpTemplates, component, template);
  }
}
