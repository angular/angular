library angular2.test.web_workers.worker.renderer_integration_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        inject,
        ddescribe,
        describe,
        it,
        iit,
        expect,
        beforeEach,
        createTestInjector,
        beforeEachBindings,
        TestComponentBuilder;
import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;
import "package:angular2/core.dart"
    show
        bind,
        provide,
        Provider,
        Injector,
        ViewMetadata,
        Component,
        View,
        Injectable,
        ElementRef,
        NgIf;
import "package:angular2/src/web_workers/worker/renderer.dart"
    show WebWorkerRenderer;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show
        ClientMessageBrokerFactory,
        ClientMessageBrokerFactory_,
        UiArguments,
        FnArg;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer;
import "package:angular2/src/core/render/api.dart"
    show
        RenderProtoViewRef,
        RenderViewWithFragments,
        RenderViewRef,
        RenderFragmentRef,
        Renderer;
import "package:angular2/src/core/render/dom/dom_renderer.dart"
    show DomRenderer, DomRenderer_;
import "package:angular2/src/core/render/view.dart" show DefaultRenderView;
import "package:angular2/src/web_workers/shared/render_proto_view_ref_store.dart"
    show RenderProtoViewRefStore, WebWorkerRenderProtoViewRef;
import "package:angular2/src/web_workers/shared/render_view_with_fragments_store.dart"
    show RenderViewWithFragmentsStore, WebWorkerRenderViewRef;
import "package:angular2/src/web_workers/ui/impl.dart"
    show WebWorkerApplication;
import "package:angular2/src/web_workers/ui/renderer.dart"
    show MessageBasedRenderer;
import "../shared/web_worker_test_util.dart"
    show createPairedMessageBuses, PairedMessageBuses;
import "package:angular2/src/web_workers/shared/service_message_broker.dart"
    show ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_;
import "package:angular2/src/web_workers/worker/event_dispatcher.dart"
    show WebWorkerEventDispatcher;

main() {
  ClientMessageBrokerFactory createWebWorkerBrokerFactory(
      PairedMessageBuses messageBuses,
      Serializer workerSerializer,
      Serializer uiSerializer,
      DomRenderer domRenderer,
      RenderProtoViewRefStore uiRenderProtoViewStore,
      RenderViewWithFragmentsStore uiRenderViewStore) {
    var uiMessageBus = messageBuses.ui;
    var workerMessageBus = messageBuses.worker;
    // set up the worker side
    var webWorkerBrokerFactory =
        new ClientMessageBrokerFactory_(workerMessageBus, workerSerializer);
    // set up the ui side
    var uiMessageBrokerFactory =
        new ServiceMessageBrokerFactory_(uiMessageBus, uiSerializer);
    var renderer = new MessageBasedRenderer(
        uiMessageBrokerFactory,
        uiMessageBus,
        uiSerializer,
        uiRenderProtoViewStore,
        uiRenderViewStore,
        domRenderer);
    renderer.start();
    new WebWorkerApplication(null, null);
    return webWorkerBrokerFactory;
  }
  WebWorkerRenderer createWorkerRenderer(
      Serializer workerSerializer,
      Serializer uiSerializer,
      DomRenderer domRenderer,
      RenderProtoViewRefStore uiRenderProtoViewStore,
      RenderViewWithFragmentsStore uiRenderViewStore,
      RenderProtoViewRefStore workerRenderProtoViewStore,
      RenderViewWithFragmentsStore workerRenderViewStore) {
    var messageBuses = createPairedMessageBuses();
    var brokerFactory = createWebWorkerBrokerFactory(
        messageBuses,
        workerSerializer,
        uiSerializer,
        domRenderer,
        uiRenderProtoViewStore,
        uiRenderViewStore);
    var workerEventDispatcher =
        new WebWorkerEventDispatcher(messageBuses.worker, workerSerializer);
    return new WebWorkerRenderer(brokerFactory, workerRenderProtoViewStore,
        workerRenderViewStore, workerEventDispatcher);
  }
  describe("Web Worker Renderer", () {
    Injector uiInjector;
    RenderViewWithFragmentsStore uiRenderViewStore;
    beforeEachBindings(() {
      var uiRenderProtoViewStore = new RenderProtoViewRefStore(false);
      uiRenderViewStore = new RenderViewWithFragmentsStore(false);
      uiInjector = createTestInjector([
        provide(RenderProtoViewRefStore, useValue: uiRenderProtoViewStore),
        provide(RenderViewWithFragmentsStore, useValue: uiRenderViewStore),
        provide(DomRenderer, useClass: DomRenderer_),
        provide(Renderer, useExisting: DomRenderer)
      ]);
      var uiSerializer = uiInjector.get(Serializer);
      var domRenderer = uiInjector.get(DomRenderer);
      var workerRenderProtoViewStore = new RenderProtoViewRefStore(true);
      var workerRenderViewStore = new RenderViewWithFragmentsStore(true);
      return [
        provide(RenderProtoViewRefStore, useValue: workerRenderProtoViewStore),
        provide(RenderViewWithFragmentsStore, useValue: workerRenderViewStore),
        provide(Renderer, useFactory: (workerSerializer) {
          return createWorkerRenderer(
              workerSerializer,
              uiSerializer,
              domRenderer,
              uiRenderProtoViewStore,
              uiRenderViewStore,
              workerRenderProtoViewStore,
              workerRenderViewStore);
        }, deps: [Serializer])
      ];
    });
    getRenderElement(ElementRef elementRef) {
      var renderView = (uiRenderViewStore.deserializeRenderViewRef(
              ((elementRef.renderView as WebWorkerRenderViewRef)).refNumber)
          as DefaultRenderView<dynamic>);
      return renderView.boundElements[elementRef.boundElementIndex];
    }
    it(
        "should update text nodes",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideView(
                  MyComp, new ViewMetadata(template: "<div>{{ctxProp}}</div>"))
              .createAsync(MyComp)
              .then((fixture) {
            var renderEl = getRenderElement(fixture.debugElement.elementRef);
            expect(renderEl).toHaveText("");
            fixture.debugElement.componentInstance.ctxProp = "Hello World!";
            fixture.detectChanges();
            expect(renderEl).toHaveText("Hello World!");
            async.done();
          });
        }));
    it(
        "should update any element property/attributes/class/style independent of the compilation on the root element and other elements",
        inject([TestComponentBuilder, Renderer, AsyncTestCompleter],
            (TestComponentBuilder tcb, Renderer renderer, async) {
          tcb
              .overrideView(
                  MyComp,
                  new ViewMetadata(
                      template:
                          "<input [title]=\"y\" style=\"position:absolute\">"))
              .createAsync(MyComp)
              .then((fixture) {
            var checkSetters = (elr) {
              var el = getRenderElement(elr);
              renderer.setElementProperty(elr, "tabIndex", 1);
              expect(((el as dynamic)).tabIndex).toEqual(1);
              renderer.setElementClass(elr, "a", true);
              expect(DOM.hasClass(el, "a")).toBe(true);
              renderer.setElementClass(elr, "a", false);
              expect(DOM.hasClass(el, "a")).toBe(false);
              renderer.setElementStyle(elr, "width", "10px");
              expect(DOM.getStyle(el, "width")).toEqual("10px");
              renderer.setElementStyle(elr, "width", null);
              expect(DOM.getStyle(el, "width")).toEqual("");
              renderer.setElementAttribute(elr, "someAttr", "someValue");
              expect(DOM.getAttribute(el, "some-attr")).toEqual("someValue");
            };
            // root element
            checkSetters(fixture.debugElement.elementRef);
            // nested elements
            checkSetters(
                fixture.debugElement.componentViewChildren[0].elementRef);
            async.done();
          });
        }));
    it(
        "should add and remove fragments",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideView(
                  MyComp,
                  new ViewMetadata(
                      template:
                          "<template [ng-if]=\"ctxBoolProp\">hello</template>",
                      directives: [NgIf]))
              .createAsync(MyComp)
              .then((fixture) {
            var rootEl = getRenderElement(fixture.debugElement.elementRef);
            expect(rootEl).toHaveText("");
            fixture.debugElement.componentInstance.ctxBoolProp = true;
            fixture.detectChanges();
            expect(rootEl).toHaveText("hello");
            fixture.debugElement.componentInstance.ctxBoolProp = false;
            fixture.detectChanges();
            expect(rootEl).toHaveText("");
            async.done();
          });
        }));
    if (DOM.supportsDOMEvents()) {
      it(
          "should call actions on the element independent of the compilation",
          inject([TestComponentBuilder, Renderer, AsyncTestCompleter],
              (TestComponentBuilder tcb, Renderer renderer, async) {
            tcb
                .overrideView(MyComp,
                    new ViewMetadata(template: "<input [title]=\"y\"></input>"))
                .createAsync(MyComp)
                .then((fixture) {
              var elRef =
                  fixture.debugElement.componentViewChildren[0].elementRef;
              renderer.invokeElementMethod(elRef, "setAttribute", ["a", "b"]);
              expect(DOM.getAttribute(getRenderElement(elRef), "a"))
                  .toEqual("b");
              async.done();
            });
          }));
    }
  });
}

@Component(selector: "my-comp")
@View(directives: const [])
@Injectable()
class MyComp {
  String ctxProp;
  var ctxNumProp;
  var ctxBoolProp;
  MyComp() {
    this.ctxProp = "initial value";
    this.ctxNumProp = 0;
    this.ctxBoolProp = false;
  }
  throwError() {
    throw "boom";
  }
}
