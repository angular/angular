import {
  AsyncTestCompleter,
  inject,
  describe,
  it,
  expect,
  beforeEach,
  createTestInjector,
  beforeEachBindings
} from "angular2/test_lib";
import {DOM} from 'angular2/src/dom/dom_adapter';
import {DomTestbed, TestRootView, elRef} from '../../render/dom/dom_testbed';
import {bind} from 'angular2/di';
import {WorkerCompiler, WorkerRenderer} from "angular2/src/web-workers/worker/renderer";
import {MessageBroker, UiArguments, FnArg} from "angular2/src/web-workers/worker/broker";
import {Serializer} from "angular2/src/web-workers/shared/serializer";
import {isPresent, isBlank, BaseException, Type} from "angular2/src/facade/lang";
import {MapWrapper, ListWrapper} from "angular2/src/facade/collection";
import {
  DirectiveMetadata,
  ProtoViewDto,
  RenderProtoViewRef,
  RenderViewWithFragments,
  ViewDefinition,
  RenderProtoViewMergeMapping,
  RenderViewRef,
  RenderFragmentRef
} from "angular2/src/render/api";
import {
  RenderProtoViewRefStore,
  WebworkerRenderProtoViewRef
} from "angular2/src/web-workers/shared/render_proto_view_ref_store";
import {
  RenderViewWithFragmentsStore,
  WorkerRenderViewRef
} from 'angular2/src/web-workers/shared/render_view_with_fragments_store';
import {resolveInternalDomProtoView} from 'angular2/src/render/dom/view/proto_view';
import {someComponent} from '../../render/dom/dom_renderer_integration_spec';
import {WebWorkerMain} from 'angular2/src/web-workers/ui/impl';
import {AnchorBasedAppRootUrl} from 'angular2/src/services/anchor_based_app_root_url';
import {MockMessageBus, MockMessageBusSink, MockMessageBusSource} from './worker_test_util';

export function main() {
  function createBroker(workerSerializer: Serializer, uiSerializer: Serializer, tb: DomTestbed,
                        uiRenderViewStore: RenderViewWithFragmentsStore,
                        workerRenderViewStore: RenderViewWithFragmentsStore): MessageBroker {
    // set up the two message buses to pass messages to each other
    var uiMessageBus = new MockMessageBus(new MockMessageBusSink(), new MockMessageBusSource());
    var workerMessageBus = new MockMessageBus(new MockMessageBusSink(), new MockMessageBusSource());
    uiMessageBus.attachToBus(workerMessageBus);
    workerMessageBus.attachToBus(uiMessageBus);

    // set up the worker side
    var broker = new MessageBroker(workerMessageBus, workerSerializer, null);

    // set up the ui side
    var webWorkerMain = new WebWorkerMain(tb.compiler, tb.renderer, uiRenderViewStore, uiSerializer,
                                          new AnchorBasedAppRootUrl());
    webWorkerMain.attachToWorker(uiMessageBus);
    return broker;
  }

  function createWorkerRenderer(workerSerializer: Serializer, uiSerializer: Serializer,
                                tb: DomTestbed, uiRenderViewStore: RenderViewWithFragmentsStore,
                                workerRenderViewStore: RenderViewWithFragmentsStore):
      WorkerRenderer {
    var broker =
        createBroker(workerSerializer, uiSerializer, tb, uiRenderViewStore, workerRenderViewStore);
    return new WorkerRenderer(broker, workerRenderViewStore);
  }

  function createWorkerCompiler(workerSerializer: Serializer, uiSerializer: Serializer,
                                tb: DomTestbed): WorkerCompiler {
    var broker = createBroker(workerSerializer, uiSerializer, tb, null, null);
    return new WorkerCompiler(broker);
  }

  describe("Web Worker Compiler", function() {
    var workerSerializer: Serializer;
    var uiSerializer: Serializer;
    var workerRenderProtoViewRefStore: RenderProtoViewRefStore;
    var uiRenderProtoViewRefStore: RenderProtoViewRefStore;
    var tb: DomTestbed;

    beforeEach(() => {
      workerRenderProtoViewRefStore = new RenderProtoViewRefStore(true);
      uiRenderProtoViewRefStore = new RenderProtoViewRefStore(false);
      workerSerializer = createSerializer(workerRenderProtoViewRefStore, null);
      uiSerializer = createSerializer(uiRenderProtoViewRefStore, null);
      tb = createTestInjector([DomTestbed]).get(DomTestbed);
    });

    function resolveWebWorkerRef(ref: RenderProtoViewRef) {
      var refNumber = (<WebworkerRenderProtoViewRef>ref).refNumber;
      return resolveInternalDomProtoView(uiRenderProtoViewRefStore.deserialize(refNumber));
    }

    it('should build the proto view', inject([AsyncTestCompleter], (async) => {
         var compiler: WorkerCompiler = createWorkerCompiler(workerSerializer, uiSerializer, tb);

         var dirMetadata = DirectiveMetadata.create(
             {id: 'id', selector: 'custom', type: DirectiveMetadata.COMPONENT_TYPE});
         compiler.compileHost(dirMetadata)
             .then((protoView) => {
               expect(DOM.tagName(DOM.firstChild(DOM.content(
                                      resolveWebWorkerRef(protoView.render).rootElement)))
                          .toLowerCase())
                   .toEqual('custom');
               expect(protoView).not.toBeNull();
               async.done();
             });
       }));
  });

  describe("Web Worker Renderer", () => {
    var renderer: WorkerRenderer;
    var workerSerializer: Serializer;
    var workerRenderViewStore: RenderViewWithFragmentsStore;
    var uiRenderViewStore: RenderViewWithFragmentsStore;
    var uiSerializer: Serializer;
    var tb: DomTestbed;

    /**
     * Seriliazes the given obj with the uiSerializer and then returns the version that
     * the worker would deserialize
     */
    function serialize(obj: any, type: Type): any {
      var serialized = uiSerializer.serialize(obj, type);
      return workerSerializer.deserialize(serialized, type);
    }

    beforeEach(() => {
      workerRenderViewStore = new RenderViewWithFragmentsStore(true);
      tb = createTestInjector([DomTestbed]).get(DomTestbed);
      uiRenderViewStore = new RenderViewWithFragmentsStore(false);
      workerSerializer = createSerializer(new RenderProtoViewRefStore(true), workerRenderViewStore);
      uiSerializer = createSerializer(new RenderProtoViewRefStore(false), uiRenderViewStore);
      renderer = createWorkerRenderer(workerSerializer, uiSerializer, tb, uiRenderViewStore,
                                      workerRenderViewStore);
    });

    it('should create and destroy root host views while using the given elements in place',
       inject([AsyncTestCompleter], (async) => {
         tb.compiler.compileHost(someComponent)
             .then((hostProtoViewDto: any) => {
               hostProtoViewDto = serialize(hostProtoViewDto, ProtoViewDto);
               var viewWithFragments =
                   renderer.createRootHostView(hostProtoViewDto.render, 1, '#root');
               var view = new WorkerTestRootView(viewWithFragments, uiRenderViewStore);

               expect(tb.rootEl.parentNode).toBeTruthy();
               expect(view.hostElement).toBe(tb.rootEl);

               renderer.detachFragment(viewWithFragments.fragmentRefs[0]);
               renderer.destroyView(viewWithFragments.viewRef);
               expect(tb.rootEl.parentNode).toBeFalsy();

               async.done();
             });
       }));

    it('should update text nodes', inject([AsyncTestCompleter], (async) => {
         tb.compileAndMerge(
               someComponent,
               [
                 new ViewDefinition(
                     {componentId: 'someComponent', template: '{{a}}', directives: []})
               ])
             .then((protoViewMergeMappings) => {
               protoViewMergeMappings =
                   serialize(protoViewMergeMappings, RenderProtoViewMergeMapping);
               var rootView = renderer.createView(protoViewMergeMappings.mergedProtoViewRef, 1);
               renderer.hydrateView(rootView.viewRef);

               renderer.setText(rootView.viewRef, 0, 'hello');
               var view = new WorkerTestRootView(rootView, uiRenderViewStore);
               expect(view.hostElement).toHaveText('hello');
               async.done();
             });
       }));


    it('should update any element property/attributes/class/style independent of the compilation on the root element and other elements',
       inject([AsyncTestCompleter], (async) => {
         tb.compileAndMerge(someComponent,
                            [
                              new ViewDefinition({
                                componentId: 'someComponent',
                                template: '<input [title]="y" style="position:absolute">',
                                directives: []
                              })
                            ])
             .then((protoViewMergeMappings) => {
               protoViewMergeMappings =
                   serialize(protoViewMergeMappings, RenderProtoViewMergeMapping);

               var checkSetters = (elr, el) => {
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

               var rootViewWithFragments =
                   renderer.createView(protoViewMergeMappings.mergedProtoViewRef, 1);
               renderer.hydrateView(rootViewWithFragments.viewRef);

               var rootView = new WorkerTestRootView(rootViewWithFragments, uiRenderViewStore);
               // root element
               checkSetters(elRef(rootViewWithFragments.viewRef, 0), rootView.hostElement);
               // nested elements
               checkSetters(elRef(rootViewWithFragments.viewRef, 1),
                            DOM.firstChild(rootView.hostElement));

               async.done();
             });
       }));

    it('should add and remove empty fragments', inject([AsyncTestCompleter], (async) => {
         tb.compileAndMerge(someComponent,
                            [
                              new ViewDefinition({
                                componentId: 'someComponent',
                                template: '<template></template><template></template>',
                                directives: []
                              })
                            ])
             .then((protoViewMergeMappings) => {
               protoViewMergeMappings =
                   serialize(protoViewMergeMappings, RenderProtoViewMergeMapping);
               var rootViewWithFragments =
                   renderer.createView(protoViewMergeMappings.mergedProtoViewRef, 3);

               var elr = elRef(rootViewWithFragments.viewRef, 1);
               var rootView = new WorkerTestRootView(rootViewWithFragments, uiRenderViewStore);
               expect(rootView.hostElement).toHaveText('');
               var fragment = rootViewWithFragments.fragmentRefs[1];
               var fragment2 = rootViewWithFragments.fragmentRefs[2];
               renderer.attachFragmentAfterElement(elr, fragment);
               renderer.attachFragmentAfterFragment(fragment, fragment2);
               renderer.detachFragment(fragment);
               renderer.detachFragment(fragment2);
               expect(rootView.hostElement).toHaveText('');

               async.done();
             });
       }));

    if (DOM.supportsDOMEvents()) {
      it('should call actions on the element independent of the compilation',
         inject([AsyncTestCompleter], (async) => {
           tb.compileAndMerge(someComponent,
                              [
                                new ViewDefinition({
                                  componentId: 'someComponent',
                                  template: '<input [title]="y"></input>',
                                  directives: []
                                })
                              ])
               .then((protoViewMergeMappings) => {
                 protoViewMergeMappings =
                     serialize(protoViewMergeMappings, RenderProtoViewMergeMapping);
                 var rootViewWithFragments =
                     renderer.createView(protoViewMergeMappings.mergedProtoViewRef, 1);
                 var rootView = new WorkerTestRootView(rootViewWithFragments, uiRenderViewStore);

                 renderer.invokeElementMethod(elRef(rootViewWithFragments.viewRef, 1),
                                              'setAttribute', ['a', 'b']);

                 expect(DOM.getAttribute(DOM.childNodes(rootView.hostElement)[0], 'a'))
                     .toEqual('b');
                 async.done();
               });
         }));
    }
  });
}

class WorkerTestRootView extends TestRootView {
  constructor(workerViewWithFragments: RenderViewWithFragments, uiRenderViewStore) {
    super(new RenderViewWithFragments(
        uiRenderViewStore.retreive(
            (<WorkerRenderViewRef>workerViewWithFragments.viewRef).refNumber),
        ListWrapper.map(workerViewWithFragments.fragmentRefs,
                        (val) => { return uiRenderViewStore.retreive(val.refNumber); })));
  }
}

function createSerializer(protoViewRefStore: RenderProtoViewRefStore,
                          renderViewStore: RenderViewWithFragmentsStore): Serializer {
  var injector = createTestInjector([
    bind(RenderProtoViewRefStore)
        .toValue(protoViewRefStore),
    bind(RenderViewWithFragmentsStore).toValue(renderViewStore)
  ]);
  return injector.get(Serializer);
}
