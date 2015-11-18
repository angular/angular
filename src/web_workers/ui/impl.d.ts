import { MessageBus } from "angular2/src/web_workers/shared/message_bus";
import { ClientMessageBrokerFactory, ClientMessageBroker } from 'angular2/src/web_workers/shared/client_message_broker';
import { ServiceMessageBrokerFactory, ServiceMessageBroker } from 'angular2/src/web_workers/shared/service_message_broker';
/**
 * Creates a zone, sets up the DI providers
 * And then creates a new WebWorkerMain object to handle messages from the worker
 */
export declare function bootstrapUICommon(bus: MessageBus): WebWorkerApplication;
export declare class WebWorkerApplication {
    private _clientMessageBrokerFactory;
    private _serviceMessageBrokerFactory;
    constructor(_clientMessageBrokerFactory: ClientMessageBrokerFactory, _serviceMessageBrokerFactory: ServiceMessageBrokerFactory);
    createClientMessageBroker(channel: string, runInZone?: boolean): ClientMessageBroker;
    createServiceMessageBroker(channel: string, runInZone?: boolean): ServiceMessageBroker;
}
