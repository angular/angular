import { XHR } from 'angular2/src/compiler/xhr';
import { WebWorkerXHRImpl } from 'angular2/src/web_workers/worker/xhr_impl';
import { ListWrapper } from 'angular2/src/facade/collection';
import { AppRootUrl } from 'angular2/src/compiler/app_root_url';
import { WebWorkerRenderer } from 'angular2/src/web_workers/worker/renderer';
import { print, CONST_EXPR } from 'angular2/src/facade/lang';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { Renderer } from 'angular2/src/core/render/api';
import { PLATFORM_DIRECTIVES, PLATFORM_PIPES, ExceptionHandler, APPLICATION_COMMON_PROVIDERS, PLATFORM_COMMON_PROVIDERS } from 'angular2/core';
import { COMMON_DIRECTIVES, COMMON_PIPES, FORM_PROVIDERS } from "angular2/common";
import { ClientMessageBrokerFactory, ClientMessageBrokerFactory_ } from 'angular2/src/web_workers/shared/client_message_broker';
import { ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_ } from 'angular2/src/web_workers/shared/service_message_broker';
import { COMPILER_PROVIDERS } from 'angular2/src/compiler/compiler';
import { Serializer } from "angular2/src/web_workers/shared/serializer";
import { ON_WEB_WORKER } from "angular2/src/web_workers/shared/api";
import { Provider } from 'angular2/src/core/di';
import { RenderProtoViewRefStore } from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import { RenderViewWithFragmentsStore } from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import { WebWorkerEventDispatcher } from 'angular2/src/web_workers/worker/event_dispatcher';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { SETUP_CHANNEL } from 'angular2/src/web_workers/shared/messaging_api';
import { ObservableWrapper } from 'angular2/src/facade/async';
class PrintLogger {
    constructor() {
        this.log = print;
        this.logError = print;
        this.logGroup = print;
    }
    logGroupEnd() { }
}
export const WORKER_APP_PLATFORM = CONST_EXPR([PLATFORM_COMMON_PROVIDERS]);
export const WORKER_APP_COMMON_PROVIDERS = CONST_EXPR([
    APPLICATION_COMMON_PROVIDERS,
    COMPILER_PROVIDERS,
    FORM_PROVIDERS,
    Serializer,
    new Provider(PLATFORM_PIPES, { useValue: COMMON_PIPES, multi: true }),
    new Provider(PLATFORM_DIRECTIVES, { useValue: COMMON_DIRECTIVES, multi: true }),
    new Provider(ClientMessageBrokerFactory, { useClass: ClientMessageBrokerFactory_ }),
    new Provider(ServiceMessageBrokerFactory, { useClass: ServiceMessageBrokerFactory_ }),
    WebWorkerRenderer,
    new Provider(Renderer, { useExisting: WebWorkerRenderer }),
    new Provider(ON_WEB_WORKER, { useValue: true }),
    RenderViewWithFragmentsStore,
    RenderProtoViewRefStore,
    new Provider(ExceptionHandler, { useFactory: _exceptionHandler, deps: [] }),
    WebWorkerXHRImpl,
    new Provider(XHR, { useExisting: WebWorkerXHRImpl }),
    WebWorkerEventDispatcher
]);
function _exceptionHandler() {
    return new ExceptionHandler(new PrintLogger());
}
/**
 * Asynchronously returns a list of providers that can be used to initialize the
 * Application injector.
 * Also takes care of attaching the {@link MessageBus} to the given {@link NgZone}.
 */
export function genericWorkerAppProviders(bus, zone) {
    var bootstrapProcess = PromiseWrapper.completer();
    bus.attachToZone(zone);
    bus.initChannel(SETUP_CHANNEL, false);
    var subscription;
    var emitter = bus.from(SETUP_CHANNEL);
    subscription = ObservableWrapper.subscribe(emitter, (initData) => {
        var bindings = ListWrapper.concat(WORKER_APP_COMMON_PROVIDERS, [
            new Provider(MessageBus, { useValue: bus }),
            new Provider(AppRootUrl, { useValue: new AppRootUrl(initData['rootUrl']) }),
        ]);
        bootstrapProcess.resolve(bindings);
        ObservableWrapper.dispose(subscription);
    });
    ObservableWrapper.callNext(bus.to(SETUP_CHANNEL), "ready");
    return bootstrapProcess.promise;
}
