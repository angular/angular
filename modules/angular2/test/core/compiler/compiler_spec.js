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
} from 'angular2/test_lib';

import {List, ListWrapper, Map, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {Type, isBlank, stringify, isPresent} from 'angular2/src/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';

import {NewCompiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {ProtoView} from 'angular2/src/core/compiler/view';
import {ElementBinder} from 'angular2/src/core/compiler/element_binder';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Component, DynamicComponent, Viewport, Decorator} from 'angular2/src/core/annotations/annotations';
import {PropertySetter, Attribute} from 'angular2/src/core/annotations/di';
import {Template} from 'angular2/src/core/annotations/template';
import {DirectiveBinding} from 'angular2/src/core/compiler/element_injector';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {ComponentUrlMapper, RuntimeComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';

import {UrlResolver} from 'angular2/src/services/url_resolver';
import * as renderApi from 'angular2/src/render/api';

export function main() {
  describe('compiler', function() {
    var reader, tplResolver, renderer, protoViewFactory, cmpUrlMapper;

    beforeEach(() => {
      reader = new DirectiveMetadataReader();
      tplResolver = new FakeTemplateResolver();
      cmpUrlMapper = new RuntimeComponentUrlMapper();
    });

    function createCompiler(renderCompileResults:List, protoViewFactoryResults:List<ProtoView>) {
      var urlResolver = new FakeUrlResolver();
      renderer = new FakeRenderer(renderCompileResults);
      protoViewFactory = new FakeProtoViewFactory(protoViewFactoryResults)
      return new NewCompiler(
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

      function captureTemplate(template:Template):Promise<renderApi.Template> {
        tplResolver.setTemplate(MainComponent, template);
        var compiler = createCompiler([createRenderProtoView()], [createProtoView()]);
        return compiler.compile(MainComponent).then( (protoView) => {
          expect(renderer.requests.length).toBe(1);
          return renderer.requests[0];
        });
      }

      function captureDirective(directive):Promise<renderApi.DirectiveMetadata> {
        return captureTemplate(new Template({inline: '<div></div>', directives: [directive]})).then( (renderTpl) => {
          expect(renderTpl.directives.length).toBe(1);
          return renderTpl.directives[0];
        });
      }

      it('should fill the componentId', inject([AsyncTestCompleter], (async) => {
        captureTemplate(new Template({inline: '<div></div>'})).then( (renderTpl) => {
          expect(renderTpl.componentId).toEqual(stringify(MainComponent));
          async.done();
        });
      }));

      it('should fill inline', inject([AsyncTestCompleter], (async) => {
        captureTemplate(new Template({inline: '<div></div>'})).then( (renderTpl) => {
          expect(renderTpl.inline).toEqual('<div></div>');
          async.done();
        });
      }));

      it('should fill absUrl given inline templates', inject([AsyncTestCompleter], (async) => {
        cmpUrlMapper.setComponentUrl(MainComponent, '/mainComponent');
        captureTemplate(new Template({inline: '<div></div>'})).then( (renderTpl) => {
          expect(renderTpl.absUrl).toEqual('http://www.app.com/mainComponent');
          async.done();
        });
      }));

      it('should fill absUrl given url template', inject([AsyncTestCompleter], (async) => {
        cmpUrlMapper.setComponentUrl(MainComponent, '/mainComponent');
        captureTemplate(new Template({url: '/someTemplate'})).then( (renderTpl) => {
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

      it('should set directive.events', inject([AsyncTestCompleter], (async) => {
        captureDirective(DirectiveWithEvents).then( (renderDir) => {
          expect(renderDir.events).toEqual(MapWrapper.createFromStringMap({
            'someEvent': 'someAction'
          }));
          async.done();
        });
      }));

      it('should set directive.bind', inject([AsyncTestCompleter], (async) => {
        captureDirective(DirectiveWithBind).then( (renderDir) => {
          expect(renderDir.bind).toEqual(MapWrapper.createFromStringMap({
            'a': 'b'
          }));
          async.done();
        });
      }));

      it('should read @PropertySetter', inject([AsyncTestCompleter], (async) => {
        captureDirective(DirectiveWithPropertySetters).then( (renderDir) => {
          expect(renderDir.setters).toEqual(['someProp']);
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
        tplResolver.setTemplate(MainComponent, new Template({inline: '<div></div>'}));
        var renderProtoView = createRenderProtoView();
        var expectedProtoView = createProtoView();
        var compiler = createCompiler([renderProtoView], [expectedProtoView]);
        compiler.compile(MainComponent).then( (protoView) => {
          var request = protoViewFactory.requests[0];
          expect(request[1]).toBe(renderProtoView);
          async.done();
        });
      }));

      it('should pass the component annotation', inject([AsyncTestCompleter], (async) => {
        tplResolver.setTemplate(MainComponent, new Template({inline: '<div></div>'}));
        var compiler = createCompiler([createRenderProtoView()], [createProtoView()]);
        compiler.compile(MainComponent).then( (protoView) => {
          var request = protoViewFactory.requests[0];
          expect(request[0]).toEqual(new Component({
            selector: 'main-comp'
          }));
          async.done();
        });
      }));

      it('should pass the directive bindings', inject([AsyncTestCompleter], (async) => {
        tplResolver.setTemplate(MainComponent,
          new Template({
            inline: '<div></div>',
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
        tplResolver.setTemplate(MainComponent, new Template({inline: '<div></div>'}));
        var renderProtoView = createRenderProtoView();
        var expectedProtoView = createProtoView();
        var compiler = createCompiler([renderProtoView], [expectedProtoView]);
        compiler.compile(MainComponent).then( (protoView) => {
          expect(protoView).toBe(expectedProtoView);
          async.done();
        });
      }));

    });

    it('should load nested components in root ProtoView', inject([AsyncTestCompleter], (async) => {
      tplResolver.setTemplate(MainComponent, new Template({inline: '<div></div>'}));
      tplResolver.setTemplate(NestedComponent, new Template({inline: '<div></div>'}));
      var mainProtoView = createProtoView([
        createComponentElementBinder(reader, NestedComponent)
      ]);
      var nestedProtoView = createProtoView();
      var compiler = createCompiler(
        [createRenderProtoView(), createRenderProtoView()],
        [mainProtoView, nestedProtoView]
      );
      compiler.compile(MainComponent).then( (protoView) => {
        expect(protoView).toBe(mainProtoView);
        expect(mainProtoView.elementBinders[0].nestedProtoView).toBe(nestedProtoView);
        async.done();
      });
    }));

    it('should load nested components in viewport ProtoView', inject([AsyncTestCompleter], (async) => {
      tplResolver.setTemplate(MainComponent, new Template({inline: '<div></div>'}));
      tplResolver.setTemplate(NestedComponent, new Template({inline: '<div></div>'}));
      var mainProtoView = createProtoView([
        createViewportElementBinder(createProtoView([
          createComponentElementBinder(reader, NestedComponent)
        ]))
      ]);
      var nestedProtoView = createProtoView();
      var compiler = createCompiler(
        [createRenderProtoView(), createRenderProtoView()],
        [mainProtoView, nestedProtoView]
      );
      compiler.compile(MainComponent).then( (protoView) => {
        expect(protoView).toBe(mainProtoView);
        expect(
          mainProtoView.elementBinders[0].nestedProtoView.elementBinders[0].nestedProtoView
        ).toBe(nestedProtoView);
        async.done();
      });
    }));

    it('should cache compiled components', inject([AsyncTestCompleter], (async) => {
      tplResolver.setTemplate(MainComponent, new Template({inline: '<div></div>'}));
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
      tplResolver.setTemplate(MainComponent, new Template({inline: '<div></div>'}));
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
      tplResolver.setTemplate(MainComponent, new Template({inline: '<div></div>'}));
      var mainProtoView = createProtoView([
        createComponentElementBinder(reader, MainComponent)
      ]);
      var compiler = createCompiler(
        [createRenderProtoView()],
        [mainProtoView]
      );
      compiler.compile(MainComponent).then( (protoView) => {
        expect(protoView).toBe(mainProtoView);
        expect(mainProtoView.elementBinders[0].nestedProtoView).toBe(mainProtoView);
        async.done();
      });
    }));
  });
}

function createProtoView(elementBinders = null) {
  var pv = new ProtoView(null, null, null, null);
  if (isPresent(elementBinders)) {
    pv.elementBinders = elementBinders;
  }
  return pv;
}

function createComponentElementBinder(reader, type) {
  var meta = reader.read(type);
  var binding = DirectiveBinding.createFromType(meta.type, meta.annotation);
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

function createRenderProtoView() {
  return new renderApi.ProtoView();
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
  events: {'someEvent': 'someAction'}
})
class DirectiveWithEvents {}

@Decorator({
  bind: {'a': 'b'}
})
class DirectiveWithBind {}

@Decorator()
class DirectiveWithPropertySetters {
  constructor(@PropertySetter('someProp') someProp) {}
}

@Decorator()
class DirectiveWithAttributes {
  constructor(@Attribute('someAttr') someAttr:string) {}
}

class FakeRenderer extends renderApi.Renderer {
  requests:List<renderApi.Template>;
  _results:List;

  constructor(results) {
    super();
    this._results = results;
    this.requests = [];
  }

  compile(template:renderApi.Template):Promise<renderApi.ProtoView> {
    ListWrapper.push(this.requests, template);
    return PromiseWrapper.resolve(ListWrapper.removeAt(this._results, 0));
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


class FakeTemplateResolver extends TemplateResolver {
  _cmpTemplates: Map;

  constructor() {
    super();
    this._cmpTemplates = MapWrapper.create();
  }

  resolve(component: Type): Template {
    var template = MapWrapper.get(this._cmpTemplates, component);
    if (isBlank(template)) {
      throw 'No template';
    }
    return template;
  }

  setTemplate(component: Type, template: Template) {
    MapWrapper.set(this._cmpTemplates, component, template);
  }
}

class FakeProtoViewFactory extends ProtoViewFactory {
  requests:List;
  _results:List;

  constructor(results) {
    super(null, null);
    this.requests = [];
    this._results = results;
  }

  createProtoView(componentAnnotation:Component, renderProtoView: renderApi.ProtoView, directives:List<DirectiveBinding>):ProtoView {
    ListWrapper.push(this.requests, [componentAnnotation, renderProtoView, directives]);
    return ListWrapper.removeAt(this._results, 0);
  }
}