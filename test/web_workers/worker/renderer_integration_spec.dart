library angular2.test.web_workers.worker.renderer_integration_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        inject,
        ddescribe,
        describe,
        dispatchEvent,
        it,
        iit,
        expect,
        beforeEach,
        beforeEachProviders,
        TestInjector,
        TestComponentBuilder;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
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
        ElementRef;
import "package:angular2/src/core/linker/view_listener.dart"
    show AppViewListener;
import "package:angular2/common.dart" show NgIf;
import "package:angular2/src/web_workers/worker/renderer.dart"
    show WebWorkerRootRenderer;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show
        ClientMessageBrokerFactory,
        ClientMessageBrokerFactory_,
        UiArguments,
        FnArg;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer;
import "package:angular2/src/core/render/api.dart" show RootRenderer;
import "package:angular2/src/platform/dom/dom_renderer.dart"
    show DomRootRenderer, DomRootRenderer_;
import "package:angular2/src/web_workers/shared/render_store.dart"
    show RenderStore;
import "package:angular2/src/web_workers/ui/renderer.dart"
    show MessageBasedRenderer;
import "../shared/web_worker_test_util.dart"
    show createPairedMessageBuses, PairedMessageBuses;
import "package:angular2/src/web_workers/shared/service_message_broker.dart"
    show ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show ChangeDetectorGenConfig;
import "package:angular2/platform/testing/browser.dart"
    show TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS;

main() {
  ClientMessageBrokerFactory createWebWorkerBrokerFactory(
      PairedMessageBuses messageBuses,
      Serializer workerSerializer,
      Serializer uiSerializer,
      DomRootRenderer domRootRenderer,
      RenderStore uiRenderStore) {
    var uiMessageBus = messageBuses.ui;
    var workerMessageBus = messageBuses.worker;
    // set up the worker side
    var webWorkerBrokerFactory =
        new ClientMessageBrokerFactory_(workerMessageBus, workerSerializer);
    // set up the ui side
    var uiMessageBrokerFactory =
        new ServiceMessageBrokerFactory_(uiMessageBus, uiSerializer);
    var renderer = new MessageBasedRenderer(uiMessageBrokerFactory,
        uiMessageBus, uiSerializer, uiRenderStore, domRootRenderer);
    renderer.start();
    return webWorkerBrokerFactory;
  }
  WebWorkerRootRenderer createWorkerRenderer(
      Serializer workerSerializer,
      Serializer uiSerializer,
      DomRootRenderer domRootRenderer,
      RenderStore uiRenderStore,
      RenderStore workerRenderStore) {
    var messageBuses = createPairedMessageBuses();
    var brokerFactory = createWebWorkerBrokerFactory(messageBuses,
        workerSerializer, uiSerializer, domRootRenderer, uiRenderStore);
    return new WebWorkerRootRenderer(brokerFactory, messageBuses.worker,
        workerSerializer, workerRenderStore);
  }
  describe("Web Worker Renderer", () {
    Injector uiInjector;
    RenderStore uiRenderStore;
    RenderStore workerRenderStore;
    beforeEachProviders(() {
      uiRenderStore = new RenderStore();
      var testUiInjector = new TestInjector();
      testUiInjector.platformProviders = TEST_BROWSER_PLATFORM_PROVIDERS;
      testUiInjector.applicationProviders = TEST_BROWSER_APPLICATION_PROVIDERS;
      testUiInjector.addProviders([
        Serializer,
        provide(RenderStore, useValue: uiRenderStore),
        provide(DomRootRenderer, useClass: DomRootRenderer_),
        provide(RootRenderer, useExisting: DomRootRenderer)
      ]);
      uiInjector = testUiInjector.createInjector();
      var uiSerializer = uiInjector.get(Serializer);
      var domRootRenderer = uiInjector.get(DomRootRenderer);
      workerRenderStore = new RenderStore();
      return [
        provide(ChangeDetectorGenConfig,
            useValue: new ChangeDetectorGenConfig(true, true, false)),
        provide(RenderStore, useValue: workerRenderStore),
        provide(RootRenderer, useFactory: (workerSerializer) {
          return createWorkerRenderer(workerSerializer, uiSerializer,
              domRootRenderer, uiRenderStore, workerRenderStore);
        }, deps: [Serializer]),
        provide(AppViewListener, useClass: AppViewListener)
      ];
    });
    getRenderElement(ElementRef elementRef) {
      var id = workerRenderStore.serialize(elementRef.nativeElement);
      return uiRenderStore.deserialize(id);
    }
    getRenderer(ElementRef elementRef) {
      return ((elementRef as dynamic)).internalElement.parentView.renderer;
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
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideView(
                  MyComp,
                  new ViewMetadata(
                      template:
                          "<input [title]=\"y\" style=\"position:absolute\">"))
              .createAsync(MyComp)
              .then((fixture) {
            var checkSetters = (elr) {
              var renderer = getRenderer(elr);
              var el = getRenderElement(elr);
              renderer.setElementProperty(elr.nativeElement, "tabIndex", 1);
              expect(((el as dynamic)).tabIndex).toEqual(1);
              renderer.setElementClass(elr.nativeElement, "a", true);
              expect(DOM.hasClass(el, "a")).toBe(true);
              renderer.setElementClass(elr.nativeElement, "a", false);
              expect(DOM.hasClass(el, "a")).toBe(false);
              renderer.setElementStyle(elr.nativeElement, "width", "10px");
              expect(DOM.getStyle(el, "width")).toEqual("10px");
              renderer.setElementStyle(elr.nativeElement, "width", null);
              expect(DOM.getStyle(el, "width")).toEqual("");
              renderer.setElementAttribute(
                  elr.nativeElement, "someattr", "someValue");
              expect(DOM.getAttribute(el, "someattr")).toEqual("someValue");
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
        "should update any template comment property/attributes",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var tpl = "<template [ngIf]=\"ctxBoolProp\"></template>";
          tcb
              .overrideView(
                  MyComp, new ViewMetadata(template: tpl, directives: [NgIf]))
              .createAsync(MyComp)
              .then((fixture) {
            ((fixture.debugElement.componentInstance as MyComp)).ctxBoolProp =
                true;
            fixture.detectChanges();
            var el = getRenderElement(fixture.debugElement.elementRef);
            expect(DOM.getInnerHTML(el))
                .toContain("\"ng-reflect-ng-if\": \"true\"");
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
                          "<template [ngIf]=\"ctxBoolProp\">hello</template>",
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
          "should call actions on the element",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp, new ViewMetadata(template: "<input [title]=\"y\">"))
                .createAsync(MyComp)
                .then((fixture) {
              var elRef =
                  fixture.debugElement.componentViewChildren[0].elementRef;
              getRenderer(elRef).invokeElementMethod(
                  elRef.nativeElement, "setAttribute", ["a", "b"]);
              expect(DOM.getAttribute(getRenderElement(elRef), "a"))
                  .toEqual("b");
              async.done();
            });
          }));
      it(
          "should listen to events",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb
                .overrideView(
                    MyComp,
                    new ViewMetadata(
                        template: "<input (change)=\"ctxNumProp = 1\">"))
                .createAsync(MyComp)
                .then((fixture) {
              var elRef =
                  fixture.debugElement.componentViewChildren[0].elementRef;
              dispatchEvent(getRenderElement(elRef), "change");
              expect(fixture.componentInstance.ctxNumProp).toBe(1);
              fixture.destroy();
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
  bool ctxBoolProp;
  MyComp() {
    this.ctxProp = "initial value";
    this.ctxNumProp = 0;
    this.ctxBoolProp = false;
  }
  throwError() {
    throw "boom";
  }
}
