import {
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
import {WebWorkerRootRenderer} from "angular2/src/web_workers/worker/renderer";
import {
  ClientMessageBrokerFactory,
  ClientMessageBrokerFactory_,
  UiArguments,
  FnArg
} from "angular2/src/web_workers/shared/client_message_broker";
import {Serializer} from "angular2/src/web_workers/shared/serializer";
import {RootRenderer} from "angular2/src/core/render/api";
import {DomRootRenderer, DomRootRenderer_} from 'angular2/src/platform/dom/dom_renderer';
import {DebugDomRootRenderer} from 'angular2/src/core/debug/debug_renderer';
import {RenderStore} from "angular2/src/web_workers/shared/render_store";
import {MessageBasedRenderer} from 'angular2/src/web_workers/ui/renderer';
import {createPairedMessageBuses, PairedMessageBuses} from '../shared/web_worker_test_util';
import {
  ServiceMessageBrokerFactory,
  ServiceMessageBrokerFactory_
} from 'angular2/src/web_workers/shared/service_message_broker';
import {ChangeDetectorGenConfig} from 'angular2/src/core/change_detection/change_detection';
import {ElementRef_} from 'angular2/src/core/linker/element_ref';
import {
  TEST_BROWSER_PLATFORM_PROVIDERS,
  TEST_BROWSER_APPLICATION_PROVIDERS
} from 'angular2/platform/testing/browser';

export function main() {
  function createWebWorkerBrokerFactory(
      messageBuses: PairedMessageBuses, workerSerializer: Serializer, uiSerializer: Serializer,
      domRootRenderer: DomRootRenderer, uiRenderStore: RenderStore): ClientMessageBrokerFactory {
    var uiMessageBus = messageBuses.ui;
    var workerMessageBus = messageBuses.worker;

    // set up the worker side
    var webWorkerBrokerFactory =
        new ClientMessageBrokerFactory_(workerMessageBus, workerSerializer);

    // set up the ui side
    var uiMessageBrokerFactory = new ServiceMessageBrokerFactory_(uiMessageBus, uiSerializer);
    var renderer = new MessageBasedRenderer(uiMessageBrokerFactory, uiMessageBus, uiSerializer,
                                            uiRenderStore, domRootRenderer);
    renderer.start();

    return webWorkerBrokerFactory;
  }

  function createWorkerRenderer(workerSerializer: Serializer, uiSerializer: Serializer,
                                domRootRenderer: DomRootRenderer, uiRenderStore: RenderStore,
                                workerRenderStore: RenderStore): RootRenderer {
    var messageBuses = createPairedMessageBuses();
    var brokerFactory = createWebWorkerBrokerFactory(messageBuses, workerSerializer, uiSerializer,
                                                     domRootRenderer, uiRenderStore);
    var workerRootRenderer = new WebWorkerRootRenderer(brokerFactory, messageBuses.worker,
                                                       workerSerializer, workerRenderStore);
    return new DebugDomRootRenderer(workerRootRenderer);
  }

  describe("Web Worker Renderer", () => {
    var uiInjector: Injector;
    var uiRenderStore: RenderStore;
    var workerRenderStore: RenderStore;

    beforeEachProviders(() => {
      uiRenderStore = new RenderStore();
      var testUiInjector = new TestInjector();
      testUiInjector.platformProviders = TEST_BROWSER_PLATFORM_PROVIDERS;
      testUiInjector.applicationProviders = TEST_BROWSER_APPLICATION_PROVIDERS;
      testUiInjector.addProviders([
        Serializer,
        provide(RenderStore, {useValue: uiRenderStore}),
        provide(DomRootRenderer, {useClass: DomRootRenderer_}),
        provide(RootRenderer, {useExisting: DomRootRenderer})
      ]);
      uiInjector = testUiInjector.createInjector();
      var uiSerializer = uiInjector.get(Serializer);
      var domRootRenderer = uiInjector.get(DomRootRenderer);
      workerRenderStore = new RenderStore();
      return [
        provide(ChangeDetectorGenConfig,
                {useValue: new ChangeDetectorGenConfig(true, true, false)}),
        provide(RenderStore, {useValue: workerRenderStore}),
        provide(RootRenderer,
                {
                  useFactory: (workerSerializer) => {
                    return createWorkerRenderer(workerSerializer, uiSerializer, domRootRenderer,
                                                uiRenderStore, workerRenderStore);
                  },
                  deps: [Serializer]
                })
      ];
    });

    function getRenderElement(elementRef: ElementRef) {
      var id = workerRenderStore.serialize(elementRef.nativeElement);
      return uiRenderStore.deserialize(id);
    }

    function getRenderer(elementRef: ElementRef) {
      return (<any>elementRef).internalElement.parentView.renderer;
    }

    it('should update text nodes',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MyComp, new ViewMetadata({template: '<div>{{ctxProp}}</div>'}))
             .createAsync(MyComp)
             .then((fixture) => {
               var renderEl = getRenderElement(fixture.elementRef);
               expect(renderEl).toHaveText('');

               fixture.debugElement.componentInstance.ctxProp = 'Hello World!';
               fixture.detectChanges();
               expect(renderEl).toHaveText('Hello World!');
               async.done();

             });
       }));

    it('should update any element property/attributes/class/style independent of the compilation on the root element and other elements',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MyComp, new ViewMetadata(
                                      {template: '<input [title]="y" style="position:absolute">'}))
             .createAsync(MyComp)
             .then((fixture) => {
               var checkSetters = (elr) => {
                 var renderer = getRenderer(elr);
                 var el = getRenderElement(elr);
                 renderer.setElementProperty(elr.nativeElement, 'tabIndex', 1);
                 expect((<HTMLInputElement>el).tabIndex).toEqual(1);

                 renderer.setElementClass(elr.nativeElement, 'a', true);
                 expect(DOM.hasClass(el, 'a')).toBe(true);
                 renderer.setElementClass(elr.nativeElement, 'a', false);
                 expect(DOM.hasClass(el, 'a')).toBe(false);

                 renderer.setElementStyle(elr.nativeElement, 'width', '10px');
                 expect(DOM.getStyle(el, 'width')).toEqual('10px');
                 renderer.setElementStyle(elr.nativeElement, 'width', null);
                 expect(DOM.getStyle(el, 'width')).toEqual('');

                 renderer.setElementAttribute(elr.nativeElement, 'someattr', 'someValue');
                 expect(DOM.getAttribute(el, 'someattr')).toEqual('someValue');
               };

               // root element
               checkSetters(fixture.elementRef);
               // nested elements
               checkSetters((<ElementRef_>fixture.elementRef)
                                .internalElement.componentView.appElements[0]
                                .ref);

               async.done();
             });
       }));

    it('should update any template comment property/attributes',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var tpl = '<template [ngIf]="ctxBoolProp"></template>';
         tcb.overrideView(MyComp, new ViewMetadata({template: tpl, directives: [NgIf]}))

             .createAsync(MyComp)
             .then((fixture) => {
               (<MyComp>fixture.debugElement.componentInstance).ctxBoolProp = true;
               fixture.detectChanges();
               var el = getRenderElement(fixture.elementRef);
               expect(DOM.getInnerHTML(el)).toContain('"ng-reflect-ng-if": "true"');
               async.done();
             });
       }));

    it('should add and remove fragments',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MyComp, new ViewMetadata({
                            template: '<template [ngIf]="ctxBoolProp">hello</template>',
                            directives: [NgIf]
                          }))
             .createAsync(MyComp)
             .then((fixture) => {

               var rootEl = getRenderElement(fixture.elementRef);
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
      it('should call actions on the element',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp, new ViewMetadata({template: '<input [title]="y">'}))
               .createAsync(MyComp)
               .then((fixture) => {
                 var elRef = (<ElementRef_>fixture.elementRef)
                                 .internalElement.componentView.appElements[0]
                                 .ref;
                 getRenderer(elRef)
                     .invokeElementMethod(elRef.nativeElement, 'setAttribute', ['a', 'b']);

                 expect(DOM.getAttribute(getRenderElement(elRef), 'a')).toEqual('b');
                 async.done();
               });
         }));

      it('should listen to events',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyComp,
                            new ViewMetadata({template: '<input (change)="ctxNumProp = 1">'}))
               .createAsync(MyComp)
               .then((fixture) => {
                 var elRef = (<ElementRef_>fixture.elementRef)
                                 .internalElement.componentView.appElements[0]
                                 .ref;
                 dispatchEvent(getRenderElement(elRef), 'change');
                 expect(fixture.componentInstance.ctxNumProp).toBe(1);

                 fixture.destroy();

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
  ctxBoolProp: boolean;
  constructor() {
    this.ctxProp = 'initial value';
    this.ctxNumProp = 0;
    this.ctxBoolProp = false;
  }

  throwError() { throw 'boom'; }
}
