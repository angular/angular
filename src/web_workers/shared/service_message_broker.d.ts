import { Serializer } from "angular2/src/web_workers/shared/serializer";
import { Type } from "angular2/src/facade/lang";
import { MessageBus } from "angular2/src/web_workers/shared/message_bus";
export declare abstract class ServiceMessageBrokerFactory {
    /**
     * Initializes the given channel and attaches a new {@link ServiceMessageBroker} to it.
     */
    abstract createMessageBroker(channel: string, runInZone?: boolean): ServiceMessageBroker;
}
export declare class ServiceMessageBrokerFactory_ extends ServiceMessageBrokerFactory {
    private _messageBus;
    constructor(_messageBus: MessageBus, _serializer: Serializer);
    createMessageBroker(channel: string, runInZone?: boolean): ServiceMessageBroker;
}
export declare abstract class ServiceMessageBroker {
    abstract registerMethod(methodName: string, signature: Type[], method: Function, returnType?: Type): void;
}
/**
 * Helper class for UIComponents that allows components to register methods.
 * If a registered method message is received from the broker on the worker,
 * the UIMessageBroker deserializes its arguments and calls the registered method.
 * If that method returns a promise, the UIMessageBroker returns the result to the worker.
 */
export declare class ServiceMessageBroker_ extends ServiceMessageBroker {
    private _serializer;
    channel: any;
    private _sink;
    private _methods;
    constructor(messageBus: MessageBus, _serializer: Serializer, channel: any);
    registerMethod(methodName: string, signature: Type[], method: Function, returnType?: Type): void;
    private _handleMessage(map);
    private _wrapWebWorkerPromise(id, promise, type);
}
export declare class ReceivedMessage {
    method: string;
    args: any[];
    id: string;
    type: string;
    constructor(data: {
        [key: string]: any;
    });
}
