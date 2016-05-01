import { XHR } from 'angular2/src/compiler/xhr';
import { ServiceMessageBrokerFactory } from 'angular2/src/web_workers/shared/service_message_broker';
export declare class MessageBasedXHRImpl {
    private _brokerFactory;
    private _xhr;
    constructor(_brokerFactory: ServiceMessageBrokerFactory, _xhr: XHR);
    start(): void;
}
