import {
  AsyncTestCompleter,
  inject,
  ddescribe,
  describe,
  it,
  iit,
  expect,
  beforeEach,
  createTestInjectorWithRuntimeCompiler,
  beforeEachProviders,
  TestComponentBuilder
} from "angular2/testing_internal";
import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {
  bind,
  provide,
  Provider,
  Injector,
  ViewMetadata,
  Component,
  View,
  Injectable,
  ElementRef
} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {WebWorkerRenderer} from "angular2/src/web_workers/worker/renderer";
import {
  ClientMessageBrokerFactory,
  ClientMessageBrokerFactory_,
  UiArguments,
  FnArg
} from "angular2/src/web_workers/shared/client_message_broker";
import {Serializer} from "angular2/src/web_workers/shared/serializer";
import {
  RenderProtoViewRef,
  RenderViewWithFragments,
  RenderViewRef,
  RenderFragmentRef,
  Renderer
} from "angular2/src/core/render/api";
import {DomRenderer, DomRenderer_} from 'angular2/src/platform/dom/dom_renderer';
import {DefaultRenderView} from 'angular2/src/core/render/view';
import {
  RenderProtoViewRefStore,
  WebWorkerRenderProtoViewRef
} from "angular2/src/web_workers/shared/render_proto_view_ref_store";
import {
  RenderViewWithFragmentsStore,
  WebWorkerRenderViewRef
} from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import {MessageBasedRenderer} from 'angular2/src/web_workers/ui/renderer';
import {createPairedMessageBuses, PairedMessageBuses} from '../shared/web_worker_test_util';
import {
  ServiceMessageBrokerFactory,
  ServiceMessageBrokerFactory_
} from 'angular2/src/web_workers/shared/service_message_broker';
import {WebWorkerEventDispatcher} from 'angular2/src/web_workers/worker/event_dispatcher';


export function main() {
  function createWebWorkerBrokerFactory(
      messageBuses: PairedMessageBuses, workerSerializer: Serializer, uiSerializer: Serializer,
      domRenderer: DomRenderer, uiRenderProtoViewStore: RenderProtoViewRefStore,
      uiRenderViewStore: RenderViewWithFragmentsStore): ClientMessageBrokerFactory {
    var uiMessageBus = messageBuses.ui;
    var workerMessageBus = messageBuses.worker;

    // set up the worker side
    var webWorkerBrokerFactory =
        new ClientMessageBrokerFactory_(workerMessageBus, workerSerializer);

    // set up the ui side
    var uiMessageBrokerFactory = new ServiceMessageBrokerFactory_(uiMessageBus, uiSerializer);
    var renderer = new MessageBasedRenderer(uiMessageBrokerFactory, uiMessageBus, uiSerializer,
                                            uiRenderProtoViewStore, uiRenderViewStore, domRenderer);
    renderer.start();

    return webWorkerBrokerFactory;
  }

  function createWorkerRenderer(
      workerSerializer: Serializer, uiSerializer: Serializer, domRenderer: DomRenderer,
      uiRenderProtoViewStore: RenderProtoViewRefStore,
      uiRenderViewStore: RenderViewWithFragmentsStore,
      workerRenderProtoViewStore: RenderProtoViewRefStore,
      workerRenderViewStore: RenderViewWithFragmentsStore): WebWorkerRenderer {
    var messageBuses = createPairedMessageBuses();
    var brokerFactory =
        createWebWorkerBrokerFactory(messageBuses, workerSerializer, uiSerializer, domRenderer,
                                     uiRenderProtoViewStore, uiRenderViewStore);
    var workerEventDispatcher = new WebWorkerEventDispatcher(messageBuses.worker, workerSerializer);
    return new WebWorkerRenderer(brokerFactory, workerRenderProtoViewStore, workerRenderViewStore,
                                 workerEventDispatcher);
  }

  describe("Web Worker Renderer", () => {
    var uiInjector: Injector;
    var uiRenderViewStore: RenderViewWithFragmentsStore;

    beforeEachProviders(() => {
      var uiRenderProtoViewStore = new RenderProtoViewRefStore(false);
      uiRenderViewStore = new RenderViewWithFragmentsStore(false);
      uiInjector = createTestInjectorWithRuntimeCompiler([
        provide(RenderProtoViewRefStore, {useValue: uiRenderProtoViewStore}),
        provide(RenderViewWithFragmentsStore, {useValue: uiRenderViewStore}),
        provide(DomRenderer, {useClass: DomRenderer_}),
        provide(Renderer, {useExisting: DomRenderer})
      ]);
      var uiSerializer = uiInjector.get(Serializer);
      var domRenderer = uiInjector.get(DomRenderer);
      var workerRenderProtoViewStore = new RenderProtoViewRefStore(true);
      var workerRenderViewStore = new RenderViewWithFragmentsStore(true);
      return [
        provide(RenderProtoViewRefStore, {useValue: workerRenderProtoViewStore}),
        provide(RenderViewWithFragmentsStore, {useValue: workerRenderViewStore}),
        provide(Renderer,
                {
                  useFactory: (workerSerializer) => {
                    return createWorkerRenderer(workerSerializer, uiSerializer, domRenderer,
                                                uiRenderProtoViewStore, uiRenderViewStore,
                                                workerRenderProtoViewStore, workerRenderViewStore);
                  },
                  deps: [Serializer]
                })
      ];
    });

    function getRenderElement(elementRef: ElementRef) {
      var renderView = <DefaultRenderView<Node>>uiRenderViewStore.deserializeRenderViewRef(
          (<WebWorkerRenderViewRef>elementRef.renderView).refNumber);
      return renderView.boundElements[elementRef.boundElementIndex];
    }

    it('should update text nodes',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MyComp, new ViewMetadata({template: '<div>{{ctxProp}}</div>'}))
             .createAsync(MyComp)
             .then((fixture) => {
               var renderEl = getRenderElement(fixture.debugElement.elementRef);
               expect(renderEl).toHaveText('');

               fixture.debugElement.componentInstance.ctxProp = 'Hello World!';
               fixture.detectChanges();
               expect(renderEl).toHaveText('Hello World!');
               async.done();

             });
       }));

    it('should update any element property/attributes/class/style independent of the compilation on the root element and other elements',
       inject([TestComponentBuilder, Renderer, AsyncTestCompleter], (tcb: TestComponentBuilder,
                                                                     renderer: Renderer, async) => {
         tcb.overrideView(MyComp, new ViewMetadata(
                                      {template: '<input [title]="y" style="position:absolute">'}))
             .createAsync(MyComp)
             .then((fixture) => {
               var checkSetters = (elr) => {
                 var el = getRenderElement(elr);
                 renderer.setElementProperty(elr, 'tabIndex', 1);
                 expect((<HTMLInputElement>el).tabIndex).toEqual(1);

                 renderer.setElementClass(elr, 'a', true);
                 expect(DOM.hasClass(el, 'a')).toBe(true);
                 renderer.setElementClass(elr, 'a', false);
                 expect(DOM.hasClass(el, 'a')).toBe(false);

                 renderer.setElementStyle(elr, 'width', '10px');
                 expect(DOM.getStyle(el, 'width')).toEqual('10px');
                 renderer.setElementStyle(elr, 'width', null);
                 expect(DOM.getStyle(el, 'width')).toEqual('');

                 renderer.setElementAttribute(elr, 'someAttr', 'someValue');
                 expect(DOM.getAttribute(el, 'some-attr')).toEqual('someValue');
               };

               // root element
               checkSetters(fixture.debugElement.elementRef);
               // nested elements
               checkSetters(fixture.debugElement.componentViewChildren[0].elementRef);

               async.done();
             });
       }));

    it('should add and remove fragments',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MyComp, new ViewMetadata({
                            template: '<template [ng-if]="ctxBoolProp">hello</template>',
                            directives: [NgIf]
                          }))
             .createAsync(MyComp)
             .then((fixture) => {

               var rootEl = getRenderElement(fixture.debugElement.elementRef);
               expect(rootEl).toHaveText('');

               fixture.debugElement.componentInstance.ctxBoolProp = true;
               fixture.detectChanges();
               expect(rootEl).toHaveText('hello');

               fixture.debugElement.componentInstance.ctxBoolProp = false;
               fixture.detectChanges();
               expect(rootEl).toHaveText('');

               async.done();
             });
       }));

    if (DOM.supportsDOMEvents()) {
      it('should call actions on the element independent of the compilation',
         inject([TestComponentBuilder, Renderer, AsyncTestCompleter],
                (tcb: TestComponentBuilder, renderer: Renderer, async) => {
                  tcb.overrideView(MyComp, new ViewMetadata({template: '<input [title]="y">'}))
                      .createAsync(MyComp)
                      .then((fixture) => {
                        var elRef = fixture.debugElement.componentViewChildren[0].elementRef;
                        renderer.invokeElementMethod(elRef, 'setAttribute', ['a', 'b']);

                        expect(DOM.getAttribute(getRenderElement(elRef), 'a')).toEqual('b');
                        async.done();
                      });
                }));
    }
  });
}


@Component({selector: 'my-comp'})
@View({directives: []})
@Injectable()
class MyComp {
  ctxProp: string;
  ctxNumProp;
  ctxBoolProp;
  constructor() {
    this.ctxProp = 'initial value';
    this.ctxNumProp = 0;
    this.ctxBoolProp = false;
  }

  throwError() { throw 'boom'; }
}
