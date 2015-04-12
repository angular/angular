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
  SpyObject, proxy
} from 'angular2/test_lib';

import {List, ListWrapper, Map, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {IMPLEMENTS, Type, isBlank, stringify, isPresent} from 'angular2/src/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {AppProtoView} from 'angular2/src/core/compiler/view';
import {ElementBinder} from 'angular2/src/core/compiler/element_binder';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Component, DynamicComponent, Viewport, Decorator} from 'angular2/src/core/annotations/annotations';
import {Attribute} from 'angular2/src/core/annotations/di';
import {View} from 'angular2/src/core/annotations/view';
import {DirectiveBinding} from 'angular2/src/core/compiler/element_injector';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {ComponentUrlMapper, RuntimeComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';

import {UrlResolver} from 'angular2/src/services/url_resolver';
import * as renderApi from 'angular2/src/render/api';
// TODO(tbosch): Spys don't support named modules...
import {Renderer} from 'angular2/src/render/api';

export function main() {
  describe('compiler', function() {
    var reader, tplResolver, renderer, protoViewFactory, cmpUrlMapper, renderCompileRequests;

    beforeEach(() => {
      reader = new DirectiveMetadataReader();
      tplResolver = new FakeTemplateResolver();
      cmpUrlMapper = new RuntimeComponentUrlMapper();
      renderer = new SpyRenderer();
    });

    function createCompiler(renderCompileResults:List, protoViewFactoryResults:List<AppProtoView>) {
      var urlResolver = new FakeUrlResolver();
      renderCompileRequests = [];
      renderer.spy('compile').andCallFake( (template) => {
        ListWrapper.push(renderCompileRequests, template);
        return PromiseWrapper.resolve(ListWrapper.removeAt(renderCompileResults, 0));
      });

      protoViewFactory = new FakeProtoViewFactory(protoViewFactoryResults)
      return new Compiler(
        reader,
        new CompilerCache(),
        tplResolver,
        cmpUrlMapper,
        urlResolver,
        renderer,
        protoViewFactory
      );
    }

    describe('serialize template', () => {

      function captureTemplate(template:View):Promise<renderApi.ViewDefinition> {
        tplResolver.setView(MainComponent, template);
        var compiler = createCompiler([createRenderProtoView()], [createProtoView()]);
        return compiler.compile(MainComponent).then( (protoView) => {
          expect(renderCompileRequests.length).toBe(1);
          return renderCompileRequests[0];
        });
      }

      function captureDirective(directive):Promise<renderApi.DirectiveMetadata> {
        return captureTemplate(new View({template: '<div></div>', directives: [directive]})).then( (renderTpl) => {
          expect(renderTpl.directives.length).toBe(1);
          return renderTpl.directives[0];
        });
      }

      it('should fill the componentId', inject([AsyncTestCompleter], (async) => {
        captureTemplate(new View({template: '<div></div>'})).then( (renderTpl) => {
          expect(renderTpl.componentId).toEqual(stringify(MainComponent));
          async.done();
        });
      }));

      it('should fill inline template', inject([AsyncTestCompleter], (async) => {
        captureTemplate(new View({template: '<div></div>'})).then( (renderTpl) => {
          expect(renderTpl.template).toEqual('<div></div>');
          async.done();
        });
      }));

      it('should fill absUrl given inline templates', inject([AsyncTestCompleter], (async) => {
        cmpUrlMapper.setComponentUrl(MainComponent, '/mainComponent');
        captureTemplate(new View({template: '<div></div>'})).then( (renderTpl) => {
          expect(renderTpl.absUrl).toEqual('http://www.app.com/mainComponent');
          async.done();
        });
      }));

      it('should not fill absUrl given no inline template or template url', inject([AsyncTestCompleter], (async) => {
        cmpUrlMapper.setComponentUrl(MainComponent, '/mainComponent');
        captureTemplate(new View({template: null, templateUrl: null})).then( (renderTpl) => {
          expect(renderTpl.absUrl).toBe(null)
          async.done();
        });
      }));

      it('should fill absUrl given url template', inject([AsyncTestCompleter], (async) => {
        cmpUrlMapper.setComponentUrl(MainComponent, '/mainComponent');
        captureTemplate(new View({templateUrl: '/someTemplate'})).then( (renderTpl) => {
          expect(renderTpl.absUrl).toEqual('http://www.app.com/mainComponent/someTemplate');
          async.done();
        });
      }));

      it('should fill directive.id', inject([AsyncTestCompleter], (async) => {
        captureDirective(MainComponent).then( (renderDir) => {
          expect(renderDir.id).toEqual(stringify(MainComponent));
          async.done();
        });
      }));

      it('should fill directive.selector', inject([AsyncTestCompleter], (async) => {
        captureDirective(MainComponent).then( (renderDir) => {
          expect(renderDir.selector).toEqual('main-comp');
          async.done();
        });
      }));

      it('should fill directive.type for components', inject([AsyncTestCompleter], (async) => {
        captureDirective(MainComponent).then( (renderDir) => {
          expect(renderDir.type).toEqual(renderApi.DirectiveMetadata.COMPONENT_TYPE);
          async.done();
        });
      }));

      it('should fill directive.type for dynamic components', inject([AsyncTestCompleter], (async) => {
        captureDirective(SomeDynamicComponentDirective).then( (renderDir) => {
          expect(renderDir.type).toEqual(renderApi.DirectiveMetadata.COMPONENT_TYPE);
          async.done();
        });
      }));

      it('should fill directive.type for viewport directives', inject([AsyncTestCompleter], (async) => {
        captureDirective(SomeViewportDirective).then( (renderDir) => {
          expect(renderDir.type).toEqual(renderApi.DirectiveMetadata.VIEWPORT_TYPE);
          async.done();
        });
      }));

      it('should fill directive.type for decorator directives', inject([AsyncTestCompleter], (async) => {
        captureDirective(SomeDecoratorDirective).then( (renderDir) => {
          expect(renderDir.type).toEqual(renderApi.DirectiveMetadata.DECORATOR_TYPE);
          async.done();
        });
      }));

      it('should set directive.compileChildren to false for other directives', inject([AsyncTestCompleter], (async) => {
        captureDirective(MainComponent).then( (renderDir) => {
          expect(renderDir.compileChildren).toEqual(true);
          async.done();
        });
      }));

      it('should set directive.compileChildren to true for decorator directives', inject([AsyncTestCompleter], (async) => {
        captureDirective(SomeDecoratorDirective).then( (renderDir) => {
          expect(renderDir.compileChildren).toEqual(true);
          async.done();
        });
      }));

      it('should set directive.compileChildren to false for decorator directives', inject([AsyncTestCompleter], (async) => {
        captureDirective(IgnoreChildrenDecoratorDirective).then( (renderDir) => {
          expect(renderDir.compileChildren).toEqual(false);
          async.done();
        });
      }));

      it('should set directive.hostListeners', inject([AsyncTestCompleter], (async) => {
        captureDirective(DirectiveWithEvents).then( (renderDir) => {
          expect(renderDir.hostListeners).toEqual(MapWrapper.createFromStringMap({
            'someEvent': 'someAction'
          }));
          async.done();
        });
      }));

      it('should set directive.hostProperties', inject([AsyncTestCompleter], (async) => {
        captureDirective(DirectiveWithProperties).then( (renderDir) => {
          expect(renderDir.hostProperties).toEqual(MapWrapper.createFromStringMap({
            'someField': 'someProp'
          }));
          async.done();
        });
      }));

      it('should set directive.bind', inject([AsyncTestCompleter], (async) => {
        captureDirective(DirectiveWithBind).then( (renderDir) => {
          expect(renderDir.properties).toEqual(MapWrapper.createFromStringMap({
            'a': 'b'
          }));
          async.done();
        });
      }));

      it('should read @Attribute', inject([AsyncTestCompleter], (async) => {
        captureDirective(DirectiveWithAttributes).then( (renderDir) => {
          expect(renderDir.readAttributes).toEqual(['someAttr']);
          async.done();
        });
      }));
    });

    describe('call ProtoViewFactory', () => {

      it('should pass the render protoView', inject([AsyncTestCompleter], (async) => {
        tplResolver.setView(MainComponent, new View({template: '<div></div>'}));
        var renderProtoView = createRenderProtoView();
        var expectedProtoView = createProtoView();
        var compiler = createCompiler([renderProtoView], [expectedProtoView]);
        compiler.compile(MainComponent).then( (protoView) => {
          var request = protoViewFactory.requests[0];
          expect(request[1]).toBe(renderProtoView);
          async.done();
        });
      }));

      it('should pass the component binding', inject([AsyncTestCompleter], (async) => {
        tplResolver.setView(MainComponent, new View({template: '<div></div>'}));
        var compiler = createCompiler([createRenderProtoView()], [createProtoView()]);
        compiler.compile(MainComponent).then( (protoView) => {
          var request = protoViewFactory.requests[0];
          expect(request[0].key.token).toBe(MainComponent);
          async.done();
        });
      }));

      it('should pass the directive bindings', inject([AsyncTestCompleter], (async) => {
        tplResolver.setView(MainComponent,
          new View({
            template: '<div></div>',
            directives: [SomeDecoratorDirective]
          })
        );
        var compiler = createCompiler([createRenderProtoView()], [createProtoView()]);
        compiler.compile(MainComponent).then( (protoView) => {
          var request = protoViewFactory.requests[0];
          var binding = request[2][0];
          expect(binding.key.token).toBe(SomeDecoratorDirective);
          async.done();
        });
      }));

      it('should use the protoView of the ProtoViewFactory', inject([AsyncTestCompleter], (async) => {
        tplResolver.setView(MainComponent, new View({template: '<div></div>'}));
        var renderProtoView = createRenderProtoView();
        var expectedProtoView = createProtoView();
        var compiler = createCompiler([renderProtoView], [expectedProtoView]);
        compiler.compile(MainComponent).then( (protoView) => {
          expect(protoView).toBe(expectedProtoView);
          async.done();
        });
      }));

    });

    it('should load nested components', inject([AsyncTestCompleter], (async) => {
      tplResolver.setView(MainComponent, new View({template: '<div></div>'}));
      tplResolver.setView(NestedComponent, new View({template: '<div></div>'}));
      var mainProtoView = createProtoView([
        createComponentElementBinder(reader, NestedComponent)
      ]);
      var nestedProtoView = createProtoView();
      var compiler = createCompiler(
        [
          createRenderProtoView([createRenderComponentElementBinder(0)]),
          createRenderProtoView()
        ],
        [mainProtoView, nestedProtoView]
      );
      compiler.compile(MainComponent).then( (protoView) => {
        expect(protoView).toBe(mainProtoView);
        expect(mainProtoView.elementBinders[0].nestedProtoView).toBe(nestedProtoView);
        // parentProtoView of nested components has to be null as components can
        // be used by multiple other components.
        expect(nestedProtoView.parentProtoView).toBe(null);
        async.done();
      });
    }));

    it('should load nested components in viewport', inject([AsyncTestCompleter], (async) => {
      tplResolver.setView(MainComponent, new View({template: '<div></div>'}));
      tplResolver.setView(NestedComponent, new View({template: '<div></div>'}));
      var mainProtoView = createProtoView([
        createViewportElementBinder(null)
      ]);
      var viewportProtoView = createProtoView([
        createComponentElementBinder(reader, NestedComponent)
      ]);
      var nestedProtoView = createProtoView();
      var compiler = createCompiler(
        [
          createRenderProtoView([
            createRenderViewportElementBinder(
              createRenderProtoView([
                createRenderComponentElementBinder(0)
              ])
            )
          ]),
          createRenderProtoView()
        ],
        [mainProtoView, viewportProtoView, nestedProtoView]
      );
      compiler.compile(MainComponent).then( (protoView) => {
        expect(protoView).toBe(mainProtoView);
        expect(mainProtoView.elementBinders[0].nestedProtoView).toBe(viewportProtoView);
        expect(viewportProtoView.parentProtoView).toBe(mainProtoView);
        expect(viewportProtoView.elementBinders[0].nestedProtoView).toBe(nestedProtoView);
        // parentProtoView of nested components has to be null as components can
        // be used by multiple other components.
        expect(nestedProtoView.parentProtoView).toBe(null);

        async.done();
      });
    }));

    it('should cache compiled components', inject([AsyncTestCompleter], (async) => {
      tplResolver.setView(MainComponent, new View({template: '<div></div>'}));
      var renderProtoView = createRenderProtoView();
      var expectedProtoView = createProtoView();
      var compiler = createCompiler([renderProtoView], [expectedProtoView]);
      compiler.compile(MainComponent).then( (protoView) => {
        expect(protoView).toBe(expectedProtoView);
        return compiler.compile(MainComponent);
      }).then( (protoView) => {
        expect(protoView).toBe(expectedProtoView);
        async.done();
      });
    }));

    it('should re-use components being compiled', inject([AsyncTestCompleter], (async) => {
      tplResolver.setView(MainComponent, new View({template: '<div></div>'}));
      var renderProtoViewCompleter = PromiseWrapper.completer();
      var expectedProtoView = createProtoView();
      var compiler = createCompiler([renderProtoViewCompleter.promise], [expectedProtoView]);
      renderProtoViewCompleter.resolve(createRenderProtoView());
      PromiseWrapper.all([
        compiler.compile(MainComponent),
        compiler.compile(MainComponent)
      ]).then( (protoViews) => {
        expect(protoViews[0]).toBe(expectedProtoView);
        expect(protoViews[1]).toBe(expectedProtoView);
        async.done();
      });
    }));

    it('should allow recursive components', inject([AsyncTestCompleter], (async) => {
      tplResolver.setView(MainComponent, new View({template: '<div></div>'}));
      var mainProtoView = createProtoView([
        createComponentElementBinder(reader, MainComponent)
      ]);
      var compiler = createCompiler(
        [createRenderProtoView([
          createRenderComponentElementBinder(0)
        ])],
        [mainProtoView]
      );
      compiler.compile(MainComponent).then( (protoView) => {
        expect(protoView).toBe(mainProtoView);
        expect(mainProtoView.elementBinders[0].nestedProtoView).toBe(mainProtoView);
        async.done();
      });
    }));

    it('should create host proto views', inject([AsyncTestCompleter], (async) => {
      renderer.spy('createHostProtoView').andCallFake( (componentId) => {
        return PromiseWrapper.resolve(
          createRenderProtoView([createRenderComponentElementBinder(0)])
        );
      });
      tplResolver.setView(MainComponent, new View({template: '<div></div>'}));
      var rootProtoView = createProtoView([
        createComponentElementBinder(reader, MainComponent)
      ]);
      var mainProtoView = createProtoView();
      var compiler = createCompiler(
        [
          createRenderProtoView()
        ],
        [rootProtoView, mainProtoView]
      );
      compiler.compileInHost(MainComponent).then( (protoView) => {
        expect(protoView).toBe(rootProtoView);
        expect(rootProtoView.elementBinders[0].nestedProtoView).toBe(mainProtoView);
        async.done();
      });
    }));

    it('should create imperative proto views', inject([AsyncTestCompleter], (async) => {
      renderer.spy('createImperativeComponentProtoView').andCallFake( (rendererId) => {
        return PromiseWrapper.resolve(
          createRenderProtoView([])
        );
      });
      tplResolver.setView(MainComponent, new View({renderer: 'some-renderer'}));
      var mainProtoView = createProtoView();
      var compiler = createCompiler(
        [],
        [mainProtoView]
      );
      compiler.compile(MainComponent).then( (protoView) => {
        expect(protoView).toBe(mainProtoView);
        expect(renderer.spy('createImperativeComponentProtoView')).toHaveBeenCalledWith('some-renderer');
        async.done();
      });
    }));

    it('should throw for non component types', () => {
      var compiler = createCompiler([], []);
      expect(
        () => compiler.compile(SomeDecoratorDirective)
      ).toThrowError(`Could not load '${stringify(SomeDecoratorDirective)}' because it is not a component.`);
    });
  });
}

function createDirectiveBinding(reader, type) {
  var meta = reader.read(type);
  return DirectiveBinding.createFromType(meta.type, meta.annotation);
}

function createProtoView(elementBinders = null) {
  var pv = new AppProtoView(null, null);
  if (isBlank(elementBinders)) {
    elementBinders = [];
  }
  pv.elementBinders = elementBinders;
  return pv;
}

function createComponentElementBinder(reader, type) {
  var binding = createDirectiveBinding(reader, type);
  return new ElementBinder(
    0, null, 0,
    null, binding,
    null
  );
}

function createViewportElementBinder(nestedProtoView) {
  var elBinder = new ElementBinder(
    0, null, 0,
    null, null,
    null
  );
  elBinder.nestedProtoView = nestedProtoView;
  return elBinder;
}

function createRenderProtoView(elementBinders = null) {
  if (isBlank(elementBinders)) {
    elementBinders = [];
  }
  return new renderApi.ProtoViewDto({
    elementBinders: elementBinders
  });
}

function createRenderComponentElementBinder(directiveIndex) {
  return new renderApi.ElementBinder({
    directives: [new renderApi.DirectiveBinder({
      directiveIndex: directiveIndex
    })]
  });
}

function createRenderViewportElementBinder(nestedProtoView) {
  return new renderApi.ElementBinder({
    nestedProtoView: nestedProtoView
  });
}

@Component({
  selector: 'main-comp'
})
class MainComponent {}

@Component()
class NestedComponent {}

class RecursiveComponent {}

@DynamicComponent()
class SomeDynamicComponentDirective {}

@Viewport()
class SomeViewportDirective {}

@Decorator()
class SomeDecoratorDirective {}

@Decorator({
  compileChildren: false
})
class IgnoreChildrenDecoratorDirective {}

@Decorator({
  hostListeners: {'someEvent': 'someAction'}
})
class DirectiveWithEvents {}

@Decorator({
  hostProperties: {'someField': 'someProp'}
})
class DirectiveWithProperties {}

@Decorator({
  properties: {'a': 'b'}
})
class DirectiveWithBind {}

@Decorator()
class DirectiveWithAttributes {
  constructor(@Attribute('someAttr') someAttr:string) {}
}

@proxy
@IMPLEMENTS(Renderer)
class SpyRenderer extends SpyObject {
  constructor(){super(Renderer);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

class FakeUrlResolver extends UrlResolver {
  constructor() {
    super();
  }

  resolve(baseUrl: string, url: string): string {
    if (baseUrl === null && url == './') {
      return 'http://www.app.com';
    }

    return baseUrl + url;
  }
}


class FakeTemplateResolver extends TemplateResolver {
  _cmpTemplates: Map;

  constructor() {
    super();
    this._cmpTemplates = MapWrapper.create();
  }

  resolve(component: Type): View {
    var template = MapWrapper.get(this._cmpTemplates, component);
    if (isBlank(template)) {
      throw 'No template';
    }
    return template;
  }

  setView(component: Type, template: View) {
    MapWrapper.set(this._cmpTemplates, component, template);
  }
}

class FakeProtoViewFactory extends ProtoViewFactory {
  requests:List;
  _results:List;

  constructor(results) {
    super(null);
    this.requests = [];
    this._results = results;
  }

  createProtoView(componentBinding:DirectiveBinding, renderProtoView: renderApi.ProtoViewDto,
                  directives:List<DirectiveBinding>):AppProtoView {
    ListWrapper.push(this.requests, [componentBinding, renderProtoView, directives]);
    return ListWrapper.removeAt(this._results, 0);
  }
}
