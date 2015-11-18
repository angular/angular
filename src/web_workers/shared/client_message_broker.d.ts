import { MessageBus } from "angular2/src/web_workers/shared/message_bus";
import { Promise } from "angular2/src/facade/async";
import { Serializer } from "angular2/src/web_workers/shared/serializer";
import { Type } from "angular2/src/facade/lang";
export { Type } from "angular2/src/facade/lang";
export declare abstract class ClientMessageBrokerFactory {
    /**
     * Initializes the given channel and attaches a new {@link ClientMessageBroker} to it.
     */
    abstract createMessageBroker(channel: string, runInZone?: boolean): ClientMessageBroker;
}
export declare class ClientMessageBrokerFactory_ extends ClientMessageBrokerFactory {
    private _messageBus;
    constructor(_messageBus: MessageBus, _serializer: Serializer);
    /**
     * Initializes the given channel and attaches a new {@link ClientMessageBroker} to it.
     */
    createMessageBroker(channel: string, runInZone?: boolean): ClientMessageBroker;
}
export declare abstract class ClientMessageBroker {
    abstract runOnService(args: UiArguments, returnType: Type): Promise<any>;
}
export declare class ClientMessageBroker_ extends ClientMessageBroker {
    channel: any;
    private _pending;
    private _sink;
    constructor(messageBus: MessageBus, _serializer: Serializer, channel: any);
    private _generateMessageId(name);
    runOnService(args: UiArguments, returnType: Type): Promise<any>;
    private _handleMessage(message);
}
export declare class FnArg {
    value: any;
    type: Type;
    constructor(value: any, type: Type);
}
export declare class UiArguments {
    method: string;
    args: FnArg[];
    constructor(method: string, args?: FnArg[]);
}
