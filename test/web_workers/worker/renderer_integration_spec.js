var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var testing_internal_1 = require("angular2/testing_internal");
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var core_1 = require('angular2/core');
var renderer_1 = require("angular2/src/web_workers/worker/renderer");
var client_message_broker_1 = require("angular2/src/web_workers/shared/client_message_broker");
var serializer_1 = require("angular2/src/web_workers/shared/serializer");
var api_1 = require("angular2/src/core/render/api");
var dom_renderer_1 = require('angular2/src/platform/dom/dom_renderer');
var render_proto_view_ref_store_1 = require("angular2/src/web_workers/shared/render_proto_view_ref_store");
var render_view_with_fragments_store_1 = require('angular2/src/web_workers/shared/render_view_with_fragments_store');
var impl_1 = require('angular2/src/web_workers/ui/impl');
var renderer_2 = require('angular2/src/web_workers/ui/renderer');
var web_worker_test_util_1 = require('../shared/web_worker_test_util');
var service_message_broker_1 = require('angular2/src/web_workers/shared/service_message_broker');
var event_dispatcher_1 = require('angular2/src/web_workers/worker/event_dispatcher');
function main() {
    function createWebWorkerBrokerFactory(messageBuses, workerSerializer, uiSerializer, domRenderer, uiRenderProtoViewStore, uiRenderViewStore) {
        var uiMessageBus = messageBuses.ui;
        var workerMessageBus = messageBuses.worker;
        // set up the worker side
        var webWorkerBrokerFactory = new client_message_broker_1.ClientMessageBrokerFactory_(workerMessageBus, workerSerializer);
        // set up the ui side
        var uiMessageBrokerFactory = new service_message_broker_1.ServiceMessageBrokerFactory_(uiMessageBus, uiSerializer);
        var renderer = new renderer_2.MessageBasedRenderer(uiMessageBrokerFactory, uiMessageBus, uiSerializer, uiRenderProtoViewStore, uiRenderViewStore, domRenderer);
        renderer.start();
        new impl_1.WebWorkerApplication(null, null);
        return webWorkerBrokerFactory;
    }
    function createWorkerRenderer(workerSerializer, uiSerializer, domRenderer, uiRenderProtoViewStore, uiRenderViewStore, workerRenderProtoViewStore, workerRenderViewStore) {
        var messageBuses = web_worker_test_util_1.createPairedMessageBuses();
        var brokerFactory = createWebWorkerBrokerFactory(messageBuses, workerSerializer, uiSerializer, domRenderer, uiRenderProtoViewStore, uiRenderViewStore);
        var workerEventDispatcher = new event_dispatcher_1.WebWorkerEventDispatcher(messageBuses.worker, workerSerializer);
        return new renderer_1.WebWorkerRenderer(brokerFactory, workerRenderProtoViewStore, workerRenderViewStore, workerEventDispatcher);
    }
    testing_internal_1.describe("Web Worker Renderer", function () {
        var uiInjector;
        var uiRenderViewStore;
        testing_internal_1.beforeEachBindings(function () {
            var uiRenderProtoViewStore = new render_proto_view_ref_store_1.RenderProtoViewRefStore(false);
            uiRenderViewStore = new render_view_with_fragments_store_1.RenderViewWithFragmentsStore(false);
            uiInjector = testing_internal_1.createTestInjector([
                core_1.provide(render_proto_view_ref_store_1.RenderProtoViewRefStore, { useValue: uiRenderProtoViewStore }),
                core_1.provide(render_view_with_fragments_store_1.RenderViewWithFragmentsStore, { useValue: uiRenderViewStore }),
                core_1.provide(dom_renderer_1.DomRenderer, { useClass: dom_renderer_1.DomRenderer_ }),
                core_1.provide(api_1.Renderer, { useExisting: dom_renderer_1.DomRenderer })
            ]);
            var uiSerializer = uiInjector.get(serializer_1.Serializer);
            var domRenderer = uiInjector.get(dom_renderer_1.DomRenderer);
            var workerRenderProtoViewStore = new render_proto_view_ref_store_1.RenderProtoViewRefStore(true);
            var workerRenderViewStore = new render_view_with_fragments_store_1.RenderViewWithFragmentsStore(true);
            return [
                core_1.provide(render_proto_view_ref_store_1.RenderProtoViewRefStore, { useValue: workerRenderProtoViewStore }),
                core_1.provide(render_view_with_fragments_store_1.RenderViewWithFragmentsStore, { useValue: workerRenderViewStore }),
                core_1.provide(api_1.Renderer, {
                    useFactory: function (workerSerializer) {
                        return createWorkerRenderer(workerSerializer, uiSerializer, domRenderer, uiRenderProtoViewStore, uiRenderViewStore, workerRenderProtoViewStore, workerRenderViewStore);
                    },
                    deps: [serializer_1.Serializer]
                })
            ];
        });
        function getRenderElement(elementRef) {
            var renderView = uiRenderViewStore.deserializeRenderViewRef(elementRef.renderView.refNumber);
            return renderView.boundElements[elementRef.boundElementIndex];
        }
        testing_internal_1.it('should update text nodes', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MyComp, new core_1.ViewMetadata({ template: '<div>{{ctxProp}}</div>' }))
                .createAsync(MyComp)
                .then(function (fixture) {
                var renderEl = getRenderElement(fixture.debugElement.elementRef);
                testing_internal_1.expect(renderEl).toHaveText('');
                fixture.debugElement.componentInstance.ctxProp = 'Hello World!';
                fixture.detectChanges();
                testing_internal_1.expect(renderEl).toHaveText('Hello World!');
                async.done();
            });
        }));
        testing_internal_1.it('should update any element property/attributes/class/style independent of the compilation on the root element and other elements', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, api_1.Renderer, testing_internal_1.AsyncTestCompleter], function (tcb, renderer, async) {
            tcb.overrideView(MyComp, new core_1.ViewMetadata({ template: '<input [title]="y" style="position:absolute">' }))
                .createAsync(MyComp)
                .then(function (fixture) {
                var checkSetters = function (elr) {
                    var el = getRenderElement(elr);
                    renderer.setElementProperty(elr, 'tabIndex', 1);
                    testing_internal_1.expect(el.tabIndex).toEqual(1);
                    renderer.setElementClass(elr, 'a', true);
                    testing_internal_1.expect(dom_adapter_1.DOM.hasClass(el, 'a')).toBe(true);
                    renderer.setElementClass(elr, 'a', false);
                    testing_internal_1.expect(dom_adapter_1.DOM.hasClass(el, 'a')).toBe(false);
                    renderer.setElementStyle(elr, 'width', '10px');
                    testing_internal_1.expect(dom_adapter_1.DOM.getStyle(el, 'width')).toEqual('10px');
                    renderer.setElementStyle(elr, 'width', null);
                    testing_internal_1.expect(dom_adapter_1.DOM.getStyle(el, 'width')).toEqual('');
                    renderer.setElementAttribute(elr, 'someAttr', 'someValue');
                    testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(el, 'some-attr')).toEqual('someValue');
                };
                // root element
                checkSetters(fixture.debugElement.elementRef);
                // nested elements
                checkSetters(fixture.debugElement.componentViewChildren[0].elementRef);
                async.done();
            });
        }));
        testing_internal_1.it('should add and remove fragments', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(MyComp, new core_1.ViewMetadata({
                template: '<template [ng-if]="ctxBoolProp">hello</template>',
                directives: [core_1.NgIf]
            }))
                .createAsync(MyComp)
                .then(function (fixture) {
                var rootEl = getRenderElement(fixture.debugElement.elementRef);
                testing_internal_1.expect(rootEl).toHaveText('');
                fixture.debugElement.componentInstance.ctxBoolProp = true;
                fixture.detectChanges();
                testing_internal_1.expect(rootEl).toHaveText('hello');
                fixture.debugElement.componentInstance.ctxBoolProp = false;
                fixture.detectChanges();
                testing_internal_1.expect(rootEl).toHaveText('');
                async.done();
            });
        }));
        if (dom_adapter_1.DOM.supportsDOMEvents()) {
            testing_internal_1.it('should call actions on the element independent of the compilation', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, api_1.Renderer, testing_internal_1.AsyncTestCompleter], function (tcb, renderer, async) {
                tcb.overrideView(MyComp, new core_1.ViewMetadata({ template: '<input [title]="y"></input>' }))
                    .createAsync(MyComp)
                    .then(function (fixture) {
                    var elRef = fixture.debugElement.componentViewChildren[0].elementRef;
                    renderer.invokeElementMethod(elRef, 'setAttribute', ['a', 'b']);
                    testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(getRenderElement(elRef), 'a')).toEqual('b');
                    async.done();
                });
            }));
        }
    });
}
exports.main = main;
var MyComp = (function () {
    function MyComp() {
        this.ctxProp = 'initial value';
        this.ctxNumProp = 0;
        this.ctxBoolProp = false;
    }
    MyComp.prototype.throwError = function () { throw 'boom'; };
    MyComp = __decorate([
        core_1.Component({ selector: 'my-comp' }),
        core_1.View({ directives: [] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MyComp);
    return MyComp;
})();
//# sourceMappingURL=renderer_integration_spec.js.map