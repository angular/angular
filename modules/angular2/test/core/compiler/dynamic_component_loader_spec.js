import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachBindings,
  it,
  xit,
  SpyObject, proxy
} from 'angular2/test_lib';
import {IMPLEMENTS} from 'angular2/src/facade/lang';
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {Decorator, Viewport, Component} from 'angular2/src/core/annotations/annotations';
import {ElementRef, ElementInjector, ProtoElementInjector, PreBuiltObjects} from 'angular2/src/core/compiler/element_injector';
import {Compiler} from 'angular2/src/core/compiler/compiler';
import {AppProtoView, AppView} from 'angular2/src/core/compiler/view';
import {ViewFactory} from 'angular2/src/core/compiler/view_factory'
import {AppViewHydrator} from 'angular2/src/core/compiler/view_hydrator';

export function main() {
  describe("DynamicComponentLoader", () => {
    var compiler;
    var viewFactory;
    var directiveMetadataReader;
    var viewHydrator;
    var loader;

    beforeEach( () => {
      compiler = new SpyCompiler();
      viewFactory = new SpyViewFactory();
      viewHydrator = new SpyAppViewHydrator();
      directiveMetadataReader = new DirectiveMetadataReader();
      loader = new DynamicComponentLoader(compiler, directiveMetadataReader, viewFactory, viewHydrator);
    });

    function createProtoView() {
      return new AppProtoView(null, null);
    }

    function createEmptyView() {
      var view = new AppView(null, null, null, createProtoView(), MapWrapper.create());
      view.init(null, [], [], [], []);
      return view;
    }

    function createElementRef(view, boundElementIndex) {
      var peli = new ProtoElementInjector(null, boundElementIndex, []);
      var eli = new ElementInjector(peli, null);
      var preBuiltObjects = new PreBuiltObjects(view, null, null);
      eli.instantiateDirectives(null, null, null, preBuiltObjects);
      return new ElementRef(eli);
    }

    describe("loadIntoExistingLocation", () => {
      describe('Load errors', () => {
        it('should throw when trying to load a decorator', () => {
          expect(() => loader.loadIntoExistingLocation(SomeDecorator, null))
            .toThrowError("Could not load 'SomeDecorator' because it is not a component.");
        });

        it('should throw when trying to load a viewport', () => {
          expect(() => loader.loadIntoExistingLocation(SomeViewport, null))
            .toThrowError("Could not load 'SomeViewport' because it is not a component.");
        });
      });

      it('should compile, create and hydrate the view', inject([AsyncTestCompleter], (async) => {
        var log = [];
        var protoView = createProtoView();
        var hostView = createEmptyView();
        var childView = createEmptyView();
        viewHydrator.spy('hydrateDynamicComponentView').andCallFake( (hostView, boundElementIndex,
            componentView, componentDirective, injector) => {
          ListWrapper.push(log, ['hydrateDynamicComponentView', hostView, boundElementIndex, componentView]);
        });
        viewFactory.spy('getView').andCallFake( (protoView) => {
          ListWrapper.push(log, ['getView', protoView]);
          return childView;
        });
        compiler.spy('compile').andCallFake( (_) => PromiseWrapper.resolve(protoView));

        var elementRef = createElementRef(hostView, 23);
        loader.loadIntoExistingLocation(SomeComponent, elementRef).then( (componentRef) => {
          expect(log[0]).toEqual(['getView', protoView]);
          expect(log[1]).toEqual(['hydrateDynamicComponentView', hostView, 23, childView]);
          async.done();
        });
      }));

    });

  });
}

@Decorator({selector: 'someDecorator'})
class SomeDecorator {}

@Viewport({selector: 'someViewport'})
class SomeViewport {}

@Component({selector: 'someComponent'})
class SomeComponent {}


@proxy
@IMPLEMENTS(Compiler)
class SpyCompiler extends SpyObject {noSuchMethod(m){return super.noSuchMethod(m)}}

@proxy
@IMPLEMENTS(ViewFactory)
class SpyViewFactory extends SpyObject {noSuchMethod(m){return super.noSuchMethod(m)}}

@proxy
@IMPLEMENTS(AppViewHydrator)
class SpyAppViewHydrator extends SpyObject {noSuchMethod(m){return super.noSuchMethod(m)}}

@proxy
@IMPLEMENTS(AppView)
class SpyAppView extends SpyObject {noSuchMethod(m){return super.noSuchMethod(m)}}
