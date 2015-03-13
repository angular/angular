import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  IS_DARTIUM,
  it,
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';
import {List, ListWrapper, Map, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {Type, isBlank, stringify, isPresent} from 'angular2/src/facade/lang';
import {PromiseWrapper} from 'angular2/src/facade/async';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {ProtoView} from 'angular2/src/core/compiler/view';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Component} from 'angular2/src/core/annotations/annotations';
import {Template} from 'angular2/src/core/annotations/template';
import {CompileElement} from 'angular2/src/core/compiler/pipeline/compile_element';
import {CompileStep} from 'angular2/src/core/compiler/pipeline/compile_step'
import {CompileControl} from 'angular2/src/core/compiler/pipeline/compile_control';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {ComponentUrlMapper, RuntimeComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';
import {StyleUrlResolver} from 'angular2/src/core/compiler/style_url_resolver';
import {CssProcessor} from 'angular2/src/core/compiler/css_processor';

import {Lexer, Parser, dynamicChangeDetection} from 'angular2/change_detection';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';

export function runCompilerCommonTests() {
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
          var urlResolver = new FakeUrlResolver();
          var tplLoader =  new FakeTemplateLoader(urlResolver);
          return new TestableCompiler(reader, steps,tplLoader, tplResolver,
            urlResolver, new ComponentUrlMapper());
        }

        it('should run the steps and return the ProtoView of the root element', inject([AsyncTestCompleter], (async) => {
          var rootProtoView = new ProtoView(null, null, null);
          var compiler = createCompiler( (parent, current, control) => {
            current.inheritedProtoView = rootProtoView;
          });
          tplResolver.setTemplate(MainComponent, new Template({inline: '<div></div>'}));
          compiler.compile(MainComponent).then( (protoView) => {
            expect(protoView).toBe(rootProtoView);
            async.done();
          });
        }));

        it('should use the inline template', inject([AsyncTestCompleter], (async) => {
          var compiler = createCompiler( (parent, current, control) => {
            current.inheritedProtoView = new ProtoView(current.element, null, null);
          });
          compiler.compile(MainComponent).then( (protoView) => {
            expect(DOM.getInnerHTML(protoView.element)).toEqual('inline component');
            async.done();
          });
        }));

        it('should wait for async styles to be resolved', inject([AsyncTestCompleter], (async) => {
          var styleResolved = false;

          var completer = PromiseWrapper.completer();

          var compiler = createCompiler( (parent, current, control) => {
            var protoView = new ProtoView(current.element, null, null);
            ListWrapper.push(protoView.stylePromises, completer.promise.then((_) => {
              styleResolved = true;
            }));
            current.inheritedProtoView = protoView;
          });

          // It should always return a Promise because the style is async
          var pvPromise = compiler.compile(MainComponent);
          expect(pvPromise).toBePromise();
          expect(styleResolved).toEqual(false);

          // The Promise should resolve after the style is ready
          completer.resolve(null);
          pvPromise.then((protoView) => {
            expect(styleResolved).toEqual(true);
            async.done();
          });
        }));

        it('should load nested components', inject([AsyncTestCompleter], (async) => {
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
            async.done();
          });
        }));

        it('should cache compiled components', inject([AsyncTestCompleter], (async) => {
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
            async.done();
          });
        }));

        it('should re-use components being compiled', inject([AsyncTestCompleter], (async) => {
          var nestedElBinders = [];
          var compiler = createCompiler( (parent, current, control) => {
            current.inheritedProtoView = new ProtoView(current.element, null, null);
            if (DOM.hasClass(current.element, 'nested')) {
              current.inheritedElementBinder = current.inheritedProtoView.bindElement(null);
              current.componentDirective = reader.read(NestedComponent);
              ListWrapper.push(nestedElBinders, current.inheritedElementBinder);
            }
          });
          tplResolver.setTemplate(MainComponent,
            new Template({inline: '<div><div class="nested"></div><div class="nested"></div></div>'}));
          compiler.compile(MainComponent).then( (protoView) => {
            expect(nestedElBinders[0].nestedProtoView).toBe(nestedElBinders[1].nestedProtoView);
            async.done();
          });
        }));

        it('should allow recursive components', inject([AsyncTestCompleter], (async) => {
          var compiler = createCompiler( (parent, current, control) => {
            current.inheritedProtoView = new ProtoView(current.element, null, null);
            current.inheritedElementBinder = current.inheritedProtoView.bindElement(null);
            current.componentDirective = reader.read(RecursiveComponent);
          });
          compiler.compile(RecursiveComponent).then( (protoView) => {
            expect(protoView.elementBinders[0].nestedProtoView).toBe(protoView);
            async.done();
          });
        }));
      });
    });

    describe('(mixed async, sync TemplateLoader)', () => {
      var reader = new DirectiveMetadataReader();

      function createCompiler(processClosure, templateResolver: TemplateResolver) {
        var steps = [new MockStep(processClosure)];
        var urlResolver = new FakeUrlResolver();
        var tplLoader = new FakeTemplateLoader(urlResolver);
        return new TestableCompiler(reader, steps, tplLoader, templateResolver,
          urlResolver, new ComponentUrlMapper());
      }

      function createNestedComponentSpec(name, resolver: TemplateResolver, error:string = null) {
        it(`should load nested components ${name}`, inject([AsyncTestCompleter], (async) => {

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
              async.done();
            },
            function(compileError) {
              expect(compileError.message).toEqual(error);
              async.done();
            }
          );
        }));
      }

      var templateResolver = new FakeTemplateResolver();
      templateResolver.setSync(ParentComponent);
      templateResolver.setSync(NestedComponent);
      createNestedComponentSpec('(sync -> sync)', templateResolver);

      templateResolver = new FakeTemplateResolver();
      templateResolver.setAsync(ParentComponent);
      templateResolver.setSync(NestedComponent);
      createNestedComponentSpec('(async -> sync)', templateResolver);

      templateResolver = new FakeTemplateResolver();
      templateResolver.setSync(ParentComponent);
      templateResolver.setAsync(NestedComponent);
      createNestedComponentSpec('(sync -> async)', templateResolver);

      templateResolver = new FakeTemplateResolver();
      templateResolver.setAsync(ParentComponent);
      templateResolver.setAsync(NestedComponent);
      createNestedComponentSpec('(async -> async)', templateResolver);

      templateResolver = new FakeTemplateResolver();
      templateResolver.setError(ParentComponent);
      templateResolver.setSync(NestedComponent);
      createNestedComponentSpec('(error -> sync)', templateResolver,
        'Failed to load the template for ParentComponent');

      templateResolver = new FakeTemplateResolver();
      templateResolver.setSync(ParentComponent);
      templateResolver.setError(NestedComponent);
      createNestedComponentSpec('(sync -> error)', templateResolver,
        'Failed to load the template for NestedComponent -> Failed to compile ParentComponent');

      templateResolver = new FakeTemplateResolver();
      templateResolver.setAsync(ParentComponent);
      templateResolver.setError(NestedComponent);
      createNestedComponentSpec('(async -> error)', templateResolver,
        'Failed to load the template for NestedComponent -> Failed to compile ParentComponent');

    });

    describe('URL resolution', () => {
      it('should resolve template URLs by combining application, component and template URLs', inject([AsyncTestCompleter], (async) => {
        var steps = [new MockStep((parent, current, control) => {
          current.inheritedProtoView = new ProtoView(current.element, null, null);
        })];
        var reader = new DirectiveMetadataReader();
        var tplResolver = new FakeTemplateResolver();
        var urlResolver = new FakeUrlResolver();
        var tplLoader = new FakeTemplateLoader(urlResolver);
        var template = new Template({inline: '<div></div>', url: '/tpl.html'});
        var cmpUrlMapper = new RuntimeComponentUrlMapper();
        cmpUrlMapper.setComponentUrl(MainComponent, '/cmp');

        var compiler = new TestableCompiler(reader, steps, tplLoader, tplResolver,
          urlResolver, cmpUrlMapper);

        tplResolver.forceSync();
        tplResolver.setTemplate(MainComponent, template);
        compiler.compile(MainComponent).then((protoView) => {
          expect(tplLoader.getTemplateUrl(template)).toEqual('http://www.app.com/cmp/tpl.html');
          async.done();
        });
      }))
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
    templateResolver: TemplateResolver, urlResolver: UrlResolver, cmpUrlMapper: ComponentUrlMapper) {
    super(dynamicChangeDetection,
          loader,
          reader,
          new Parser(new Lexer()),
          new CompilerCache(),
          new NativeShadowDomStrategy(new StyleUrlResolver(urlResolver)),
          templateResolver,
          cmpUrlMapper,
          urlResolver,
          new CssProcessor(null));

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

class FakeUrlResolver extends UrlResolver {
  constructor() {
    super();
  }

  resolve(baseUrl: string, url: string): string {
    if (baseUrl === null && url == './') {
      return 'http://www.app.com';
    };

    return baseUrl + url;
  }
}

class FakeTemplateLoader extends TemplateLoader {
  constructor(urlResolver: UrlResolver) {
    super(null, urlResolver);
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
      return template;
    }

    if (ListWrapper.contains(this._asyncCmp, component)) {
      return new Template({url: html});
    }

    if (this._forceSync) return template;
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
