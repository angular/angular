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
  it
} from 'angular2/test_lib';
import {SpyRenderCompiler, SpyDirectiveResolver} from '../spies';
import {ListWrapper, Map, MapWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {Type, isBlank, stringify, isPresent, isArray} from 'angular2/src/core/facade/lang';
import {PromiseCompleter, PromiseWrapper, Promise} from 'angular2/src/core/facade/async';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {AppProtoView} from 'angular2/src/core/compiler/view';
import {ElementBinder} from 'angular2/src/core/compiler/element_binder';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {PipeResolver} from 'angular2/src/core/compiler/pipe_resolver';
import {Attribute, ViewMetadata, Component, Directive, Pipe} from 'angular2/metadata';
import {internalProtoView} from 'angular2/src/core/compiler/view_ref';
import {DirectiveBinding} from 'angular2/src/core/compiler/element_injector';
import {ViewResolver} from 'angular2/src/core/compiler/view_resolver';
import {
  ComponentUrlMapper,
  RuntimeComponentUrlMapper
} from 'angular2/src/core/compiler/component_url_mapper';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';

import {UrlResolver} from 'angular2/src/core/services/url_resolver';
import {AppRootUrl} from 'angular2/src/core/services/app_root_url';
import {
  ProtoViewDto,
  ViewType,
  RenderProtoViewRef,
  ViewDefinition,
  RenderProtoViewMergeMapping,
  RenderDirectiveMetadata,
  DirectiveBinder,
  RenderElementBinder
} from 'angular2/src/core/render/api';
// TODO(tbosch): Spys don't support named modules...
import {PipeBinding} from 'angular2/src/core/pipes/pipe_binding';



export function main() {
  describe('compiler', function() {
    var directiveResolver, pipeResolver, tplResolver, renderCompiler, protoViewFactory,
        cmpUrlMapper, rootProtoView;
    var renderCompileRequests: any[];

    function createCompiler(renderCompileResults: Array<ProtoViewDto | Promise<ProtoViewDto>>,
                            protoViewFactoryResults: AppProtoView[]) {
      var urlResolver = new UrlResolver();
      renderCompileRequests = [];
      renderCompileResults = ListWrapper.clone(renderCompileResults);
      renderCompiler.spy('compile').andCallFake((view) => {
        renderCompileRequests.push(view);
        return PromiseWrapper.resolve(ListWrapper.removeAt(renderCompileResults, 0));
      });

      protoViewFactory = new FakeProtoViewFactory(protoViewFactoryResults);
      return new Compiler(directiveResolver, pipeResolver, [SomeDefaultPipe], new CompilerCache(),
                          tplResolver, cmpUrlMapper, urlResolver, renderCompiler, protoViewFactory,
                          new AppRootUrl("http://www.app.com"));
    }

    beforeEach(() => {
      directiveResolver = new DirectiveResolver();
      pipeResolver = new PipeResolver();
      tplResolver = new FakeViewResolver();
      cmpUrlMapper = new RuntimeComponentUrlMapper();
      renderCompiler = new SpyRenderCompiler();
      renderCompiler.spy('compileHost')
          .andCallFake((componentId) => {
            return PromiseWrapper.resolve(
                createRenderProtoView([createRenderComponentElementBinder(0)], ViewType.HOST));
          });
      renderCompiler.spy('mergeProtoViewsRecursively')
          .andCallFake((protoViewRefs: Array<RenderProtoViewRef | any[]>) => {
            return PromiseWrapper.resolve(new RenderProtoViewMergeMapping(
                new MergedRenderProtoViewRef(protoViewRefs), 1, [], 0, [], [], [null]));
          });
      // TODO spy on .compile and return RenderProtoViewRef, same for compileHost
      rootProtoView = createRootProtoView(directiveResolver, MainComponent);
    });

    describe('serialize template', () => {

      function captureTemplate(template: ViewMetadata): Promise<ViewDefinition> {
        tplResolver.setView(MainComponent, template);
        var compiler =
            createCompiler([createRenderProtoView()], [rootProtoView, createProtoView()]);
        return compiler.compileInHost(MainComponent)
            .then((_) => {
              expect(renderCompileRequests.length).toBe(1);
              return renderCompileRequests[0];
            });
      }

      function captureDirective(directive): Promise<RenderDirectiveMetadata> {
        return captureTemplate(new ViewMetadata({template: '<div></div>', directives: [directive]}))
            .then((renderTpl) => {
              expect(renderTpl.directives.length).toBe(1);
              return renderTpl.directives[0];
            });
      }

      it('should fill the componentId', inject([AsyncTestCompleter], (async) => {
           captureTemplate(new ViewMetadata({template: '<div></div>'}))
               .then((renderTpl) => {
                 expect(renderTpl.componentId).toEqual(stringify(MainComponent));
                 async.done();
               });
         }));

      it('should fill inline template', inject([AsyncTestCompleter], (async) => {
           captureTemplate(new ViewMetadata({template: '<div></div>'}))
               .then((renderTpl) => {
                 expect(renderTpl.template).toEqual('<div></div>');
                 async.done();
               });
         }));

      it('should fill templateAbsUrl given inline templates',
         inject([AsyncTestCompleter], (async) => {
           cmpUrlMapper.setComponentUrl(MainComponent, '/cmp/main.js');
           captureTemplate(new ViewMetadata({template: '<div></div>'}))
               .then((renderTpl) => {
                 expect(renderTpl.templateAbsUrl).toEqual('http://www.app.com/cmp/main.js');
                 async.done();
               });
         }));

      it('should not fill templateAbsUrl given no inline template or template url',
         inject([AsyncTestCompleter], (async) => {
           cmpUrlMapper.setComponentUrl(MainComponent, '/cmp/main.js');
           captureTemplate(new ViewMetadata({template: null, templateUrl: null}))
               .then((renderTpl) => {
                 expect(renderTpl.templateAbsUrl).toBe(null);
                 async.done();
               });
         }));

      it('should not fill templateAbsUrl given template url with empty string',
         inject([AsyncTestCompleter], (async) => {
           cmpUrlMapper.setComponentUrl(MainComponent, '/cmp/main.js');
           captureTemplate(new ViewMetadata({template: null, templateUrl: ''}))
               .then((renderTpl) => {
                 expect(renderTpl.templateAbsUrl).toBe(null);
                 async.done();
               });
         }));

      it('should not fill templateAbsUrl given template url with blank string',
         inject([AsyncTestCompleter], (async) => {
           cmpUrlMapper.setComponentUrl(MainComponent, '/cmp/main.js');
           captureTemplate(new ViewMetadata({template: null, templateUrl: '   '}))
               .then((renderTpl) => {
                 expect(renderTpl.templateAbsUrl).toBe(null);
                 async.done();
               });
         }));

      it('should fill templateAbsUrl given url template', inject([AsyncTestCompleter], (async) => {
           cmpUrlMapper.setComponentUrl(MainComponent, '/cmp/main.js');
           captureTemplate(new ViewMetadata({templateUrl: 'tpl/main.html'}))
               .then((renderTpl) => {
                 expect(renderTpl.templateAbsUrl).toEqual('http://www.app.com/cmp/tpl/main.html');
                 async.done();
               });
         }));

      it('should fill styleAbsUrls given styleUrls', inject([AsyncTestCompleter], (async) => {
           cmpUrlMapper.setComponentUrl(MainComponent, '/cmp/main.js');
           captureTemplate(new ViewMetadata({styleUrls: ['css/1.css', 'css/2.css']}))
               .then((renderTpl) => {
                 expect(renderTpl.styleAbsUrls)
                     .toEqual(
                         ['http://www.app.com/cmp/css/1.css', 'http://www.app.com/cmp/css/2.css']);
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
                 expect(renderDir.type).toEqual(RenderDirectiveMetadata.COMPONENT_TYPE);
                 async.done();
               });
         }));

      it('should fill directive.type for dynamic components',
         inject([AsyncTestCompleter], (async) => {
           captureDirective(SomeDynamicComponentDirective)
               .then((renderDir) => {
                 expect(renderDir.type).toEqual(RenderDirectiveMetadata.COMPONENT_TYPE);
                 async.done();
               });
         }));

      it('should fill directive.type for decorator directives',
         inject([AsyncTestCompleter], (async) => {
           captureDirective(SomeDirective)
               .then((renderDir) => {
                 expect(renderDir.type).toEqual(RenderDirectiveMetadata.DIRECTIVE_TYPE);
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

      it('should pass the ProtoViewDto', inject([AsyncTestCompleter], (async) => {
           tplResolver.setView(MainComponent, new ViewMetadata({template: '<div></div>'}));
           var renderProtoView = createRenderProtoView();
           var expectedProtoView = createProtoView();
           var compiler = createCompiler([renderProtoView], [rootProtoView, expectedProtoView]);
           compiler.compileInHost(MainComponent)
               .then((_) => {
                 var request = protoViewFactory.requests[1];
                 expect(request[1]).toBe(renderProtoView);
                 async.done();
               });
         }));

      it('should pass the component binding', inject([AsyncTestCompleter], (async) => {
           tplResolver.setView(MainComponent, new ViewMetadata({template: '<div></div>'}));
           var compiler =
               createCompiler([createRenderProtoView()], [rootProtoView, createProtoView()]);
           compiler.compileInHost(MainComponent)
               .then((_) => {
                 var request = protoViewFactory.requests[1];
                 expect(request[0].key.token).toBe(MainComponent);
                 async.done();
               });
         }));

      it('should pass the directive bindings', inject([AsyncTestCompleter], (async) => {
           tplResolver.setView(
               MainComponent,
               new ViewMetadata({template: '<div></div>', directives: [SomeDirective]}));
           var compiler =
               createCompiler([createRenderProtoView()], [rootProtoView, createProtoView()]);
           compiler.compileInHost(MainComponent)
               .then((_) => {
                 var request = protoViewFactory.requests[1];
                 var binding = request[2][0];
                 expect(binding.key.token).toBe(SomeDirective);
                 async.done();
               });
         }));

      it('should pass the pipe bindings', inject([AsyncTestCompleter], (async) => {
           tplResolver.setView(MainComponent,
                               new ViewMetadata({template: '<div></div>', pipes: [SomePipe]}));
           var compiler =
               createCompiler([createRenderProtoView()], [rootProtoView, createProtoView()]);
           compiler.compileInHost(MainComponent)
               .then((_) => {
                 var request = protoViewFactory.requests[1];
                 expect(request[3][0].key.token).toBe(SomeDefaultPipe);
                 expect(request[3][1].key.token).toBe(SomePipe);
                 async.done();
               });
         }));

      it('should use the protoView of the ProtoViewFactory',
         inject([AsyncTestCompleter], (async) => {
           tplResolver.setView(MainComponent, new ViewMetadata({template: '<div></div>'}));
           var compiler =
               createCompiler([createRenderProtoView()], [rootProtoView, createProtoView()]);
           compiler.compileInHost(MainComponent)
               .then((protoViewRef) => {
                 expect(internalProtoView(protoViewRef)).toBe(rootProtoView);
                 async.done();
               });
         }));

    });

    it('should load nested components', inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new ViewMetadata({template: '<div></div>'}));
         tplResolver.setView(NestedComponent, new ViewMetadata({template: '<div></div>'}));
         var mainProtoView =
             createProtoView([createComponentElementBinder(directiveResolver, NestedComponent)]);
         var nestedProtoView = createProtoView();
         var renderPvDtos = [
           createRenderProtoView([createRenderComponentElementBinder(0)]),
           createRenderProtoView()
         ];
         var compiler =
             createCompiler(renderPvDtos, [rootProtoView, mainProtoView, nestedProtoView]);
         compiler.compileInHost(MainComponent)
             .then((protoViewRef) => {
               expect(originalRenderProtoViewRefs(internalProtoView(protoViewRef)))
                   .toEqual(
                       [rootProtoView.render, [mainProtoView.render, [nestedProtoView.render]]]);
               expect(internalProtoView(protoViewRef).elementBinders[0].nestedProtoView)
                   .toBe(mainProtoView);
               expect(mainProtoView.elementBinders[0].nestedProtoView).toBe(nestedProtoView);
               async.done();
             });
       }));

    it('should load nested components in viewcontainers', inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new ViewMetadata({template: '<div></div>'}));
         tplResolver.setView(NestedComponent, new ViewMetadata({template: '<div></div>'}));
         var viewportProtoView = createProtoView(
             [createComponentElementBinder(directiveResolver, NestedComponent)], ViewType.EMBEDDED);
         var mainProtoView = createProtoView([createViewportElementBinder(viewportProtoView)]);
         var nestedProtoView = createProtoView();
         var renderPvDtos = [
           createRenderProtoView([
             createRenderViewportElementBinder(
                 createRenderProtoView([createRenderComponentElementBinder(0)], ViewType.EMBEDDED))
           ]),
           createRenderProtoView()
         ];
         var compiler =
             createCompiler(renderPvDtos, [rootProtoView, mainProtoView, nestedProtoView]);
         compiler.compileInHost(MainComponent)
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef).elementBinders[0].nestedProtoView)
                   .toBe(mainProtoView);
               expect(originalRenderProtoViewRefs(internalProtoView(protoViewRef)))
                   .toEqual([rootProtoView.render, [mainProtoView.render, null]]);
               expect(viewportProtoView.elementBinders[0].nestedProtoView).toBe(nestedProtoView);
               expect(originalRenderProtoViewRefs(viewportProtoView))
                   .toEqual([viewportProtoView.render, [nestedProtoView.render]]);
               async.done();
             });
       }));

    it('should cache compiled host components', inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new ViewMetadata({template: '<div></div>'}));
         var mainPv = createProtoView();
         var compiler = createCompiler([createRenderProtoView([])], [rootProtoView, mainPv]);
         compiler.compileInHost(MainComponent)
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef).elementBinders[0].nestedProtoView)
                   .toBe(mainPv);
               return compiler.compileInHost(MainComponent);
             })
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef).elementBinders[0].nestedProtoView)
                   .toBe(mainPv);
               async.done();
             });
       }));

    it('should not bind directives for cached components', inject([AsyncTestCompleter], (async) => {
         // set up the cache with the test proto view
         var mainPv: AppProtoView = createProtoView();
         var cache: CompilerCache = new CompilerCache();
         cache.setHost(MainComponent, mainPv);

         // create the spy resolver
         var reader: any = new SpyDirectiveResolver();

         // create the compiler
         var compiler = new Compiler(reader, pipeResolver, [], cache, tplResolver, cmpUrlMapper,
                                     new UrlResolver(), renderCompiler, protoViewFactory,
                                     new AppRootUrl("http://www.app.com"));
         compiler.compileInHost(MainComponent)
             .then((protoViewRef) => {
               // the test should have failed if the resolver was called, so we're good
               async.done();
             });
       }));


    it('should cache compiled nested components', inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new ViewMetadata({template: '<div></div>'}));
         tplResolver.setView(MainComponent2, new ViewMetadata({template: '<div></div>'}));
         tplResolver.setView(NestedComponent, new ViewMetadata({template: '<div></div>'}));
         var rootProtoView2 = createRootProtoView(directiveResolver, MainComponent2);
         var mainPv =
             createProtoView([createComponentElementBinder(directiveResolver, NestedComponent)]);
         var nestedPv = createProtoView([]);
         var compiler = createCompiler(
             [createRenderProtoView(), createRenderProtoView(), createRenderProtoView()],
             [rootProtoView, mainPv, nestedPv, rootProtoView2, mainPv]);
         compiler.compileInHost(MainComponent)
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef)
                          .elementBinders[0]
                          .nestedProtoView.elementBinders[0]
                          .nestedProtoView)
                   .toBe(nestedPv);
               return compiler.compileInHost(MainComponent2);
             })
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef)
                          .elementBinders[0]
                          .nestedProtoView.elementBinders[0]
                          .nestedProtoView)
                   .toBe(nestedPv);
               async.done();
             });
       }));

    it('should re-use components being compiled', inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new ViewMetadata({template: '<div></div>'}));
         var renderProtoViewCompleter: PromiseCompleter<ProtoViewDto> = PromiseWrapper.completer();
         var expectedProtoView = createProtoView();
         var compiler = createCompiler([renderProtoViewCompleter.promise],
                                       [rootProtoView, rootProtoView, expectedProtoView]);
         var result = PromiseWrapper.all([
           compiler.compileInHost(MainComponent),
           compiler.compileInHost(MainComponent),
           renderProtoViewCompleter.promise
         ]);
         renderProtoViewCompleter.resolve(createRenderProtoView());
         result.then((protoViewRefs) => {
           expect(internalProtoView(protoViewRefs[0]).elementBinders[0].nestedProtoView)
               .toBe(expectedProtoView);
           expect(internalProtoView(protoViewRefs[1]).elementBinders[0].nestedProtoView)
               .toBe(expectedProtoView);
           async.done();
         });
       }));

    it('should throw on unconditional recursive components',
       inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new ViewMetadata({template: '<div></div>'}));
         var mainProtoView =
             createProtoView([createComponentElementBinder(directiveResolver, MainComponent)]);
         var compiler =
             createCompiler([createRenderProtoView([createRenderComponentElementBinder(0)])],
                            [rootProtoView, mainProtoView]);
         PromiseWrapper.catchError(compiler.compileInHost(MainComponent), (e) => {
           expect(() => { throw e; })
               .toThrowError(`Unconditional component cycle in ${stringify(MainComponent)}`);
           async.done();
           return null;
         });
       }));

    it('should allow recursive components that are connected via an embedded ProtoView',
       inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new ViewMetadata({template: '<div></div>'}));
         var viewportProtoView = createProtoView(
             [createComponentElementBinder(directiveResolver, MainComponent)], ViewType.EMBEDDED);
         var mainProtoView = createProtoView([createViewportElementBinder(viewportProtoView)]);
         var renderPvDtos = [
           createRenderProtoView([
             createRenderViewportElementBinder(
                 createRenderProtoView([createRenderComponentElementBinder(0)], ViewType.EMBEDDED))
           ]),
           createRenderProtoView()
         ];
         var compiler = createCompiler(renderPvDtos, [rootProtoView, mainProtoView]);
         compiler.compileInHost(MainComponent)
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef).elementBinders[0].nestedProtoView)
                   .toBe(mainProtoView);
               expect(mainProtoView.elementBinders[0]
                          .nestedProtoView.elementBinders[0]
                          .nestedProtoView)
                   .toBe(mainProtoView);
               // In case of a cycle, don't merge the embedded proto views into the component!
               expect(originalRenderProtoViewRefs(internalProtoView(protoViewRef)))
                   .toEqual([rootProtoView.render, [mainProtoView.render, null]]);
               expect(originalRenderProtoViewRefs(viewportProtoView))
                   .toEqual([viewportProtoView.render, [mainProtoView.render, null]]);
               async.done();
             });
       }));

    it('should throw on recursive components that are connected via an embedded ProtoView with <ng-content>',
       inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new ViewMetadata({template: '<div></div>'}));
         var viewportProtoView =
             createProtoView([createComponentElementBinder(directiveResolver, MainComponent)],
                             ViewType.EMBEDDED, true);
         var mainProtoView = createProtoView([createViewportElementBinder(viewportProtoView)]);
         var renderPvDtos = [
           createRenderProtoView([
             createRenderViewportElementBinder(
                 createRenderProtoView([createRenderComponentElementBinder(0)], ViewType.EMBEDDED))
           ]),
           createRenderProtoView()
         ];
         var compiler = createCompiler(renderPvDtos, [rootProtoView, mainProtoView]);
         PromiseWrapper.catchError(compiler.compileInHost(MainComponent), (e) => {
           expect(() => { throw e; })
               .toThrowError(
                   `<ng-content> is used within the recursive path of ${stringify(MainComponent)}`);
           async.done();
           return null;
         });
       }));


    it('should create host proto views', inject([AsyncTestCompleter], (async) => {
         tplResolver.setView(MainComponent, new ViewMetadata({template: '<div></div>'}));
         var rootProtoView = createProtoView(
             [createComponentElementBinder(directiveResolver, MainComponent)], ViewType.HOST);
         var mainProtoView = createProtoView();
         var compiler = createCompiler([createRenderProtoView()], [rootProtoView, mainProtoView]);
         compiler.compileInHost(MainComponent)
             .then((protoViewRef) => {
               expect(internalProtoView(protoViewRef)).toBe(rootProtoView);
               expect(rootProtoView.elementBinders[0].nestedProtoView).toBe(mainProtoView);
               async.done();
             });
       }));

    it('should throw for non component types', () => {
      var compiler = createCompiler([], []);
      expect(() => compiler.compileInHost(SomeDirective))
          .toThrowError(
              `Could not load '${stringify(SomeDirective)}' because it is not a component.`);
    });
  });
}

function createDirectiveBinding(directiveResolver, type): DirectiveBinding {
  var annotation = directiveResolver.resolve(type);
  return DirectiveBinding.createFromType(type, annotation);
}

function createProtoView(elementBinders = null, type: ViewType = null,
                         isEmbeddedFragment: boolean = false): AppProtoView {
  if (isBlank(type)) {
    type = ViewType.COMPONENT;
  }
  var pv = new AppProtoView(type, isEmbeddedFragment, new RenderProtoViewRef(), null, null,
                            new Map(), null, null);
  if (isBlank(elementBinders)) {
    elementBinders = [];
  }
  pv.elementBinders = elementBinders;
  return pv;
}

function createComponentElementBinder(directiveResolver, type): ElementBinder {
  var binding = createDirectiveBinding(directiveResolver, type);
  return new ElementBinder(0, null, 0, null, binding);
}

function createViewportElementBinder(nestedProtoView): ElementBinder {
  var elBinder = new ElementBinder(0, null, 0, null, null);
  elBinder.nestedProtoView = nestedProtoView;
  return elBinder;
}

function createRenderProtoView(elementBinders = null, type: ViewType = null): ProtoViewDto {
  if (isBlank(type)) {
    type = ViewType.COMPONENT;
  }
  if (isBlank(elementBinders)) {
    elementBinders = [];
  }
  return new ProtoViewDto(
      {elementBinders: elementBinders, type: type, render: new RenderProtoViewRef()});
}

function createRenderComponentElementBinder(directiveIndex): RenderElementBinder {
  return new RenderElementBinder(
      {directives: [new DirectiveBinder({directiveIndex: directiveIndex})]});
}

function createRenderViewportElementBinder(nestedProtoView): RenderElementBinder {
  return new RenderElementBinder({nestedProtoView: nestedProtoView});
}

function createRootProtoView(directiveResolver, type): AppProtoView {
  return createProtoView([createComponentElementBinder(directiveResolver, type)], ViewType.HOST);
}

@Component({selector: 'main-comp'})
class MainComponent {
}

@Component({selector: 'main-comp2'})
class MainComponent2 {
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

@Pipe({name: 'some-default-pipe'})
class SomeDefaultPipe {
}

@Pipe({name: 'some-pipe'})
class SomePipe {
}

@Directive({selector: 'directive-with-accts'})
class DirectiveWithAttributes {
  constructor(@Attribute('someAttr') someAttr: String) {}
}

class FakeViewResolver extends ViewResolver {
  _cmpViews: Map<Type, ViewMetadata> = new Map();

  constructor() { super(); }

  resolve(component: Type): ViewMetadata {
    // returns null for dynamic components
    return this._cmpViews.has(component) ? this._cmpViews.get(component) : null;
  }

  setView(component: Type, view: ViewMetadata): void { this._cmpViews.set(component, view); }
}

class FakeProtoViewFactory extends ProtoViewFactory {
  requests: any[][];

  constructor(public results: AppProtoView[]) {
    super(null);
    this.requests = [];
  }

  createAppProtoViews(componentBinding: DirectiveBinding, renderProtoView: ProtoViewDto,
                      directives: DirectiveBinding[], pipes: PipeBinding[]): AppProtoView[] {
    this.requests.push([componentBinding, renderProtoView, directives, pipes]);
    return collectEmbeddedPvs(ListWrapper.removeAt(this.results, 0));
  }
}

class MergedRenderProtoViewRef extends RenderProtoViewRef {
  constructor(public originals: RenderProtoViewRef[]) { super(); }
}

function originalRenderProtoViewRefs(appProtoView: AppProtoView) {
  return (<MergedRenderProtoViewRef>appProtoView.mergeMapping.renderProtoViewRef).originals;
}

function collectEmbeddedPvs(pv: AppProtoView, target: AppProtoView[] = null): AppProtoView[] {
  if (isBlank(target)) {
    target = [];
  }
  target.push(pv);
  pv.elementBinders.forEach(elementBinder => {
    if (elementBinder.hasEmbeddedProtoView()) {
      collectEmbeddedPvs(elementBinder.nestedProtoView, target);
    }
  });
  return target;
}
