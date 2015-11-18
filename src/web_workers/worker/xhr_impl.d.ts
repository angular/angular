import { Promise } from 'angular2/src/facade/async';
import { XHR } from 'angular2/src/compiler/xhr';
import { ClientMessageBrokerFactory } from 'angular2/src/web_workers/shared/client_message_broker';
/**
 * Implementation of compiler/xhr that relays XHR requests to the UI side where they are sent
 * and the result is proxied back to the worker
 */
export declare class WebWorkerXHRImpl extends XHR {
    private _messageBroker;
    constructor(messageBrokerFactory: ClientMessageBrokerFactory);
    get(url: string): Promise<string>;
}
