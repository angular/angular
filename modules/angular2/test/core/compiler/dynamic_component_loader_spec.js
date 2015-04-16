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
import {Renderer} from 'angular2/src/render/api';

export function main() {
  describe("DynamicComponentLoader", () => {
    var compiler;
    var viewFactory;
    var directiveMetadataReader;
    var renderer;
    var loader;

    beforeEach( () => {
      compiler = new SpyCompiler();
      viewFactory = new SpyViewFactory();
      renderer = new SpyRenderer();
      directiveMetadataReader = new DirectiveMetadataReader();
      loader = new DynamicComponentLoader(compiler, directiveMetadataReader, renderer, viewFactory);;
    });

    function createProtoView() {
      return new AppProtoView(null, null, null);
    }

    function createElementRef(view, boundElementIndex) {
      var peli = new ProtoElementInjector(null, boundElementIndex, []);
      var eli = new ElementInjector(peli, null);
      var preBuiltObjects = new PreBuiltObjects(view, null, null, null);
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

      it('should add the child view into the host view', inject([AsyncTestCompleter], (async) => {
        var log = [];
        var hostView = new SpyAppView();
        var childView = new SpyAppView();
        hostView.spy('setDynamicComponentChildView').andCallFake( (boundElementIndex, childView) => {
          ListWrapper.push(log, ['setDynamicComponentChildView', boundElementIndex, childView]);
        });
        childView.spy('hydrate').andCallFake( (appInjector, hostElementInjector, context, locals) => {
          ListWrapper.push(log, 'hydrate');
        });
        compiler.spy('compile').andCallFake( (_) => PromiseWrapper.resolve(createProtoView()));
        viewFactory.spy('getView').andCallFake( (_) => childView);

        var elementRef = createElementRef(hostView, 23);
        loader.loadIntoExistingLocation(SomeComponent, elementRef).then( (componentRef) => {
          expect(log[0]).toEqual('hydrate');
          expect(log[1]).toEqual(['setDynamicComponentChildView', 23, childView]);
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
@IMPLEMENTS(Renderer)
class SpyRenderer extends SpyObject {noSuchMethod(m){return super.noSuchMethod(m)}}

@proxy
@IMPLEMENTS(AppView)
class SpyAppView extends SpyObject {noSuchMethod(m){return super.noSuchMethod(m)}}
