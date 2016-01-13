import { XHR } from 'angular2/src/compiler/xhr';
import { WebWorkerXHRImpl } from 'angular2/src/web_workers/worker/xhr_impl';
import { WebWorkerRootRenderer } from 'angular2/src/web_workers/worker/renderer';
import { print, CONST_EXPR } from 'angular2/src/facade/lang';
import { RootRenderer } from 'angular2/src/core/render/api';
import { PLATFORM_DIRECTIVES, PLATFORM_PIPES, ExceptionHandler, APPLICATION_COMMON_PROVIDERS, PLATFORM_COMMON_PROVIDERS } from 'angular2/core';
import { COMMON_DIRECTIVES, COMMON_PIPES, FORM_PROVIDERS } from "angular2/common";
import { ClientMessageBrokerFactory, ClientMessageBrokerFactory_ } from 'angular2/src/web_workers/shared/client_message_broker';
import { ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_ } from 'angular2/src/web_workers/shared/service_message_broker';
import { Serializer } from "angular2/src/web_workers/shared/serializer";
import { ON_WEB_WORKER } from "angular2/src/web_workers/shared/api";
import { Provider } from 'angular2/src/core/di';
import { RenderStore } from 'angular2/src/web_workers/shared/render_store';
class PrintLogger {
    constructor() {
        this.log = print;
        this.logError = print;
        this.logGroup = print;
    }
    logGroupEnd() { }
}
export const WORKER_APP_PLATFORM = CONST_EXPR([PLATFORM_COMMON_PROVIDERS]);
export const WORKER_APP_APPLICATION_COMMON = CONST_EXPR([
    APPLICATION_COMMON_PROVIDERS,
    FORM_PROVIDERS,
    Serializer,
    new Provider(PLATFORM_PIPES, { useValue: COMMON_PIPES, multi: true }),
    new Provider(PLATFORM_DIRECTIVES, { useValue: COMMON_DIRECTIVES, multi: true }),
    new Provider(ClientMessageBrokerFactory, { useClass: ClientMessageBrokerFactory_ }),
    new Provider(ServiceMessageBrokerFactory, { useClass: ServiceMessageBrokerFactory_ }),
    WebWorkerRootRenderer,
    new Provider(RootRenderer, { useExisting: WebWorkerRootRenderer }),
    new Provider(ON_WEB_WORKER, { useValue: true }),
    RenderStore,
    new Provider(ExceptionHandler, { useFactory: _exceptionHandler, deps: [] }),
    WebWorkerXHRImpl,
    new Provider(XHR, { useExisting: WebWorkerXHRImpl })
]);
function _exceptionHandler() {
    return new ExceptionHandler(new PrintLogger());
}
