import {
  AsyncTestCompleter,
  beforeEach,
  xdescribe,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  IS_DARTIUM,
  it,
  SpyObject,
  proxy
} from 'angular2/test_lib';

import {List, ListWrapper, Map, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {IMPLEMENTS, Type, isBlank, stringify, isPresent} from 'angular2/src/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {AppProtoView} from 'angular2/src/core/compiler/view';
import {ElementBinder} from 'angular2/src/core/compiler/element_binder';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {Attribute, View, Component, Directive} from 'angular2/annotations';
import * as viewAnn from 'angular2/src/core/annotations_impl/view';
import {internalProtoView} from 'angular2/src/core/compiler/view_ref';
import {DirectiveBinding} from 'angular2/src/core/compiler/element_injector';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {
  ComponentUrlMapper,
  RuntimeComponentUrlMapper
} from 'angular2/src/core/compiler/component_url_mapper';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';

import {UrlResolver} from 'angular2/src/services/url_resolver';
import * as renderApi from 'angular2/src/render/api';
// TODO(tbosch): Spys don't support named modules...
import {RenderCompiler} from 'angular2/src/render/api';

export function main() {
  describe('compiler', function() {
    var directiveResolver, tplResolver, renderCompiler, protoViewFactory, cmpUrlMapper,
        renderCompileRequests;

    beforeEach(() => {
      directiveResolver = new DirectiveResolver();
      tplResolver = new FakeTemplateResolver();
      cmpUrlMapper = new RuntimeComponentUrlMapper();
      renderCompiler = new SpyRenderCompiler();
    });

    function createCompiler(renderCompileResults: List<renderApi.ProtoViewDto>,
                            protoViewFactoryResults: List<List<AppProtoView>>) {
      var urlResolver = new FakeUrlResolver();
      renderCompileRequests = [];
      renderCompiler.spy('compile').andCallFake((template) => {
        ListWrapper.push(renderCompileRequests, template);
        return PromiseWrapper.resolve(ListWrapper.removeAt(renderCompileResults, 0));
      });

      protoViewFactory = new FakeProtoViewFactory(protoViewFactoryResults);
      return new Compiler(directiveResolver, new CompilerCache(), tplResolver, cmpUrlMapper,
                          urlResolver, renderCompiler, protoViewFactory);
    }

    describe('serialize template', () => {

      function captureTemplate(template: viewAnn.View): Promise<renderApi.ViewDefinition> {
        tplResolver.setView(MainComponent, template);
        var compiler = createCompiler([createRenderProtoView()], [[createProtoView()]]);
        return compiler.compile(MainComponent)
            .then((_) => {
              expect(renderCompileRequests.length).toBe(1);
              return renderCompileRequests[0];
            });
      }

      function captureDirective(directive): Promise<renderApi.DirectiveMetadata> {
        return captureTemplate(new viewAnn.View({template: '<div></div>', directives: [directive]}))
            .then((renderTpl) => {
              expect(renderTpl.directives.length).toBe(1);
              return renderTpl.directives[0];
            });
      }

      it('should fill the componentId', inject([AsyncTestCompleter], (async) => {
           captureTemplate(new viewAnn.View({template: '<div></div>'}))
               .then((renderTpl) => {
                 expect(renderTpl.componentId).toEqual(stringify(MainComponent));
                 async.done();
               });
         }));

      it('should fill inline template', inject([AsyncTestCompleter], (async) => {
           captureTemplate(new viewAnn.View({template: '<div></div>'}))
               .then((renderTpl) => {
                 expect(renderTpl.template).toEqual('<div></div>');
                 async.done();
               });
         }));

      it('should fill templateAbsUrl given inline templates',
         inject([AsyncTestCompleter], (async) => {
           cmpUrlMapper.setComponentUrl(MainComponent, '/mainComponent');
           captureTemplate(new viewAnn.View({template: '<div></div>'}))
               .then((renderTpl) => {
                 expect(renderTpl.templateAbsUrl).toEqual('http://www.app.com/mainComponent');
                 async.done();
               });
         }));

      it('should not fill templateAbsUrl given no inline template or template url',
         inject([AsyncTestCompleter], (async) => {
           cmpUrlMapper.setComponentUrl(MainComponent, '/mainComponent');
           captureTemplate(new viewAnn.View({template: null, templateUrl: null}))
               .then((renderTpl) => {
                 expect(renderTpl.templateAbsUrl).toBe(null);
                 async.done();
               });
         }));

      it('should fill templateAbsUrl given url template', inject([AsyncTestCompleter], (async) => {
           cmpUrlMapper.setComponentUrl(MainComponent, '/mainComponent');
           captureTemplate(new viewAnn.View({templateUrl: '/someTemplate'}))
               .then((renderTpl) => {
                 expect(renderTpl.templateAbsUrl)
                     .toEqual('http://www.app.com/mainComponent/someTemplate');
                 async.done();
               });
         }));

      it('should fill styleAbsUrls given styleUrls', inject([AsyncTestCompleter], (async) => {
           cmpUrlMapper.setComponentUrl(MainComponent, '/mainComponent');
           captureTemplate(new viewAnn.View({styleUrls: ['/1.css', '/2.css']}))
               .then((renderTpl) => {
                 expect(renderTpl.styleAbsUrls)
                     .toEqual([
                       'http://www.app.com/mainComponent/1.css',
                       'http://www.app.com/mainComponent/2.css'
                     ]);
                 async.done();
               });
         }));

      it('should fill directive.id', inject([AsyncTestCompleter], (async) => {
           captureDirective(MainComponent)
               .then((renderDir) => {
                 expect(renderDir.id).toEqual(stringify(MainComponent));
                 async.done();
               });
         }));

      it('should fill directive.selector', inject([AsyncTestCompleter], (async) => {
           captureDirective(MainComponent)
               .then((renderDir) => {
                 expect(renderDir.selector).toEqual('main-comp');
                 async.done();
               });
         }));

      it('should fill directive.type for components', inject([AsyncTestCompleter], (async) => {
           captureDirective(MainComponent)
               .then((renderDir) => {
                 expect(renderDir.type).toEqual(renderApi.DirectiveMetadata.COMPONENT_TYPE);
                 async.done();
               });
         }));

      it('should fill directive.type for dynamic components',
         inject([AsyncTestCompleter], (async) => {
           captureDirective(SomeDynamicComponentDirective)
               .then((renderDir) => {
                 expect(renderDir.type).toEqual(renderApi.DirectiveMetadata.COMPONENT_TYPE);
                 async.done();
               });
         }));

      it('should fill directive.type for decorator directives',
         inject([AsyncTestCompleter], (async) => {
           captureDirective(SomeDirective)
               .then((renderDir) => {
                 expect(renderDir.type).toEqual(renderApi.DirectiveMetadata.DIRECTIVE_TYPE);
                 async.done();
               });
         }));

      it('should set directive.compileChildren to false for other directives',
         inject([AsyncTestCompleter], (async) => {
           captureDirective(MainComponent)
               .then((renderDir) => {
                 expect(renderDir.compileChildren).toEqual(true);
                 async.done();
               });
         }));

      it('should set directive.compileChildren to true for decorator directives',
         inject([AsyncTestCompleter], (async) => {
           captureDirective(SomeDirective)
               .then((renderDir) => {
                 expect(renderDir.compileChildren).toEqual(true);
                 async.done();
               });
         }));

      it('should set directive.compileChildren to false for decorator directives',
         inject([AsyncTestCompleter], (async) => {
           captureDirective(IgnoreChildrenDirective)
               .then((renderDir) => {
                 expect(renderDir.compileChildren).toEqual(false);
                 async.done();
               });
         }));

      it('should set directive.hostListeners', inject([AsyncTestCompleter], (async) => {
           captureDirective(DirectiveWithEvents)
               .then((renderDir) => {
                 expect(renderDir.hostListeners)
                     .toEqual(MapWrapper.createFromStringMap({'someEvent': 'someAction'}));
                 async.done();
               });
         }));

      it('should set directive.hostProperties', inject([AsyncTestCompleter], (async) => {
           captureDirective(DirectiveWithProperties)
               .then((renderDir) => {
                 expect(renderDir.hostProperties)
                     .toEqual(MapWrapper.createFromStringMap({'someProp': 'someExp'}));
                 async.done();
               });
         }));

      it('should set directive.bind', inject([AsyncTestCompleter], (async) => {
           captureDirective(DirectiveWithBind)
               .then((renderDir) => {
                 expect(renderDir.properties).toEqual(['a: b']);
                 async.done();
               });
         }));

      it('should read @Attribute', inject([AsyncTestCompleter], (async) => {
           captureDirective(DirectiveWithAttributes)
               .then((renderDir) => {
                 expect(renderDir.readAttributes).toEqual(['someAttr']);
                 async.done();
               });
         }));
    });

    describe('call ProtoViewFactory', () => {

      it('should pass the render protoView', inject([AsyncTestCompleter], (async) => {
           tplResolver.setView(MainComponent, new viewAnn.View({template: '<div></div>'}));
           var renderProtoView = createRenderProtoView();
           var expectedProtoView = createProtoView();
           var compiler = createCompiler([renderProtoView], [[expectedProtoView]]);
           compiler.compile(MainComponent)
               .then((_) => {
                 var request = protoViewFactory.requests[0];
                 expect(request[1]).toBe(renderProtoView);
                 async.done();
               });
         }));

      it('should pass the component binding', inject([AsyncTestCompleter], (async) => {
           tplResolver.setView(MainComponent, new viewAnn.View({template: '<div></div>'}));
           var compiler = createCompiler([createRenderProtoView()], [[createProtoView()]]);
           compiler.compile(MainComponent)
               .then((_) => {
                 var request = protoViewFactory.requests[0];
                 expect(request[0].key.token).toBe(MainComponent);
                 async.done();
               });
         }));

      it('should pass the directive bindings', inject([AsyncTestCompleter], (async) => {
           tplResolver.setView(
               MainComponent,
               new viewAnn.View({template: '<div></div>', directives: [SomeDirective]}));
           var compiler = createCompiler([createRenderProtoView()], [[createProtoView()]]);
           compiler.compile(MainComponent)
               .then((_) => {
                 var request = protoViewFactory.requests[0];
                 var binding = request[2][0];
                 expect(binding.key.token).toBe(SomeDirective);
                 async.done();
               });
         }));

      it('should use the protoView of the ProtoViewFactory',
         inject([AsyncTestCompleter], (async) => {
           tplResolver.setView(MainComponent, new viewAnn.View({template: '<div></div>'}));
           var renderProtoView = createRenderProtoView();
           var expectedProtoView = createProtoView();
           var compiler = createCompiler([renderProtoView], [[expectedProtoView]]);
           compiler.compile(MainComponent)
               .then((protoViewRef) => {
                 expect(internalProtoView(protoViewRef)).toBe(expectedProtoView);
                 async.done();
               });
         }));

    });

    it('should load nested components', inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new viewAnn.View({template: '<div></div>'}));
         tplResolver.setView(NestedComponent, new viewAnn.View({template: '<div></div>'}));
         var mainProtoView =
             createProtoView([createComponentElementBinder(directiveResolver, NestedComponent)]);
         var nestedProtoView = createProtoView();
         var compiler = createCompiler([
           createRenderProtoView([createRenderComponentElementBinder(0)]),
           createRenderProtoView()
         ],
                                       [[mainProtoView], [nestedProtoView]]);
         compiler.compile(MainComponent)
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef)).toBe(mainProtoView);
               expect(mainProtoView.elementBinders[0].nestedProtoView).toBe(nestedProtoView);
               async.done();
             });
       }));

    it('should load nested components in viewcontainers', inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new viewAnn.View({template: '<div></div>'}));
         tplResolver.setView(NestedComponent, new viewAnn.View({template: '<div></div>'}));
         var mainProtoView = createProtoView([createViewportElementBinder(null)]);
         var viewportProtoView =
             createProtoView([createComponentElementBinder(directiveResolver, NestedComponent)]);
         var nestedProtoView = createProtoView();
         var compiler = createCompiler([
           createRenderProtoView([
             createRenderViewportElementBinder(createRenderProtoView(
                 [createRenderComponentElementBinder(0)], renderApi.ViewType.EMBEDDED))
           ]),
           createRenderProtoView()
         ],
                                       [[mainProtoView, viewportProtoView], [nestedProtoView]]);
         compiler.compile(MainComponent)
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef)).toBe(mainProtoView);
               expect(viewportProtoView.elementBinders[0].nestedProtoView).toBe(nestedProtoView);

               async.done();
             });
       }));

    it('should cache compiled components', inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new viewAnn.View({template: '<div></div>'}));
         var renderProtoView = createRenderProtoView();
         var expectedProtoView = createProtoView();
         var compiler = createCompiler([renderProtoView], [[expectedProtoView]]);
         compiler.compile(MainComponent)
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef)).toBe(expectedProtoView);
               return compiler.compile(MainComponent);
             })
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef)).toBe(expectedProtoView);
               async.done();
             });
       }));

    it('should re-use components being compiled', inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new viewAnn.View({template: '<div></div>'}));
         var renderProtoViewCompleter = PromiseWrapper.completer();
         var expectedProtoView = createProtoView();
         var compiler = createCompiler([renderProtoViewCompleter.promise], [[expectedProtoView]]);
         renderProtoViewCompleter.resolve(createRenderProtoView());
         PromiseWrapper.all([compiler.compile(MainComponent), compiler.compile(MainComponent)])
             .then((protoViewRefs) => {
               expect(internalProtoView(protoViewRefs[0])).toBe(expectedProtoView);
               expect(internalProtoView(protoViewRefs[1])).toBe(expectedProtoView);
               async.done();
             });
       }));

    it('should allow recursive components', inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new viewAnn.View({template: '<div></div>'}));
         var mainProtoView =
             createProtoView([createComponentElementBinder(directiveResolver, MainComponent)]);
         var compiler = createCompiler(
             [createRenderProtoView([createRenderComponentElementBinder(0)])], [[mainProtoView]]);
         compiler.compile(MainComponent)
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef)).toBe(mainProtoView);
               expect(mainProtoView.elementBinders[0].nestedProtoView).toBe(mainProtoView);
               async.done();
             });
       }));

    it('should create host proto views', inject([AsyncTestCompleter], (async) => {
         renderCompiler.spy('compileHost')
             .andCallFake((componentId) => {
               return PromiseWrapper.resolve(createRenderProtoView(
                   [createRenderComponentElementBinder(0)], renderApi.ViewType.HOST));
             });
         tplResolver.setView(MainComponent, new viewAnn.View({template: '<div></div>'}));
         var rootProtoView =
             createProtoView([createComponentElementBinder(directiveResolver, MainComponent)]);
         var mainProtoView = createProtoView();
         var compiler =
             createCompiler([createRenderProtoView()], [[rootProtoView], [mainProtoView]]);
         compiler.compileInHost(MainComponent)
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef)).toBe(rootProtoView);
               expect(rootProtoView.elementBinders[0].nestedProtoView).toBe(mainProtoView);
               async.done();
             });
       }));

    it('should throw for non component types', () => {
      var compiler = createCompiler([], []);
      expect(() => compiler.compile(SomeDirective))
          .toThrowError(
              `Could not load '${stringify(SomeDirective)}' because it is not a component.`);
    });
  });
}

function createDirectiveBinding(directiveResolver, type) {
  var annotation = directiveResolver.resolve(type);
  return DirectiveBinding.createFromType(type, annotation);
}

function createProtoView(elementBinders = null) {
  var pv = new AppProtoView(null, null, MapWrapper.create());
  if (isBlank(elementBinders)) {
    elementBinders = [];
  }
  pv.elementBinders = elementBinders;
  return pv;
}

function createComponentElementBinder(directiveResolver, type) {
  var binding = createDirectiveBinding(directiveResolver, type);
  return new ElementBinder(0, null, 0, null, null, binding);
}

function createViewportElementBinder(nestedProtoView) {
  var elBinder = new ElementBinder(0, null, 0, null, null, null);
  elBinder.nestedProtoView = nestedProtoView;
  return elBinder;
}

function createRenderProtoView(elementBinders = null, type: renderApi.ViewType = null) {
  if (isBlank(type)) {
    type = renderApi.ViewType.COMPONENT;
  }
  if (isBlank(elementBinders)) {
    elementBinders = [];
  }
  return new renderApi.ProtoViewDto({elementBinders: elementBinders, type: type});
}

function createRenderComponentElementBinder(directiveIndex) {
  return new renderApi.ElementBinder(
      {directives: [new renderApi.DirectiveBinder({directiveIndex: directiveIndex})]});
}

function createRenderViewportElementBinder(nestedProtoView) {
  return new renderApi.ElementBinder({nestedProtoView: nestedProtoView});
}

@Component({selector: 'main-comp'})
class MainComponent {
}

@Component({selector: 'nested'})
class NestedComponent {
}

class RecursiveComponent {}

@Component({selector: 'some-dynamic'})
class SomeDynamicComponentDirective {
}

@Directive({selector: 'some'})
class SomeDirective {
}

@Directive({compileChildren: false})
class IgnoreChildrenDirective {
}

@Directive({host: {'(someEvent)': 'someAction'}})
class DirectiveWithEvents {
}

@Directive({host: {'[someProp]': 'someExp'}})
class DirectiveWithProperties {
}

@Directive({properties: ['a: b']})
class DirectiveWithBind {
}

@Directive({selector: 'directive-with-accts'})
class DirectiveWithAttributes {
  constructor(@Attribute('someAttr') someAttr: String) {}
}

@proxy
@IMPLEMENTS(RenderCompiler)
class SpyRenderCompiler extends SpyObject {
  constructor() { super(RenderCompiler); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

class FakeUrlResolver extends UrlResolver {
  constructor() { super(); }

  resolve(baseUrl: string, url: string): string {
    if (baseUrl === null && url == './') {
      return 'http://www.app.com';
    }

    return baseUrl + url;
  }
}


class FakeTemplateResolver extends TemplateResolver {
  _cmpTemplates: Map<Type, viewAnn.View>;

  constructor() {
    super();
    this._cmpTemplates = MapWrapper.create();
  }

  resolve(component: Type): viewAnn.View {
    var template = MapWrapper.get(this._cmpTemplates, component);
    if (isBlank(template)) {
      // dynamic component
      return null;
    }
    return template;
  }

  setView(component: Type, template: viewAnn.View) {
    MapWrapper.set(this._cmpTemplates, component, template);
  }
}

class FakeProtoViewFactory extends ProtoViewFactory {
  requests: List<List<any>>;

  constructor(public results: List<List<AppProtoView>>) {
    super(null);
    this.requests = [];
  }

  createAppProtoViews(componentBinding: DirectiveBinding, renderProtoView: renderApi.ProtoViewDto,
                      directives: List<DirectiveBinding>): List<AppProtoView> {
    ListWrapper.push(this.requests, [componentBinding, renderProtoView, directives]);
    return ListWrapper.removeAt(this.results, 0);
  }
}
