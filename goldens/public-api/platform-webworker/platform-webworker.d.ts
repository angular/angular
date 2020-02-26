/** @deprecated */
export declare function bootstrapWorkerUi(workerScriptUri: string, customProviders?: StaticProvider[]): Promise<PlatformRef>;

/** @deprecated */
export declare class ClientMessageBroker {
    runOnService(args: UiArguments, returnType: Type<any> | SerializerTypes | null): Promise<any> | null;
}

/** @deprecated */
export declare class ClientMessageBrokerFactory {
    createMessageBroker(channel: string, runInZone?: boolean): ClientMessageBroker;
}

/** @deprecated */
export declare class FnArg {
    type: Type<any> | SerializerTypes;
    value: any;
    constructor(value: any, type?: Type<any> | SerializerTypes);
}

/** @deprecated */
export declare abstract class MessageBus implements MessageBusSource, MessageBusSink {
    abstract attachToZone(zone: NgZone): void;
    abstract from(channel: string): EventEmitter<any>;
    abstract initChannel(channel: string, runInZone?: boolean): void;
    abstract to(channel: string): EventEmitter<any>;
}

/** @deprecated */
export declare interface MessageBusSink {
    attachToZone(zone: NgZone): void;
    initChannel(channel: string, runInZone: boolean): void;
    to(channel: string): EventEmitter<any>;
}

/** @deprecated */
export declare interface MessageBusSource {
    attachToZone(zone: NgZone): void;
    from(channel: string): EventEmitter<any>;
    initChannel(channel: string, runInZone: boolean): void;
}

/** @deprecated */
export declare const platformWorkerApp: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

/** @deprecated */
export declare const platformWorkerUi: (extraProviders?: StaticProvider[] | undefined) => import("@angular/core").PlatformRef;

/** @deprecated */
export declare interface ReceivedMessage {
    args: any[];
    id: string;
    method: string;
    type: string;
}

/** @deprecated */
export declare const enum SerializerTypes {
    RENDERER_TYPE_2 = 0,
    PRIMITIVE = 1,
    RENDER_STORE_OBJECT = 2
}

/** @deprecated */
export declare class ServiceMessageBroker {
    registerMethod(methodName: string, signature: Array<Type<any> | SerializerTypes> | null, method: (..._: any[]) => Promise<any> | void, returnType?: Type<any> | SerializerTypes): void;
}

/** @deprecated */
export declare class ServiceMessageBrokerFactory {
    createMessageBroker(channel: string, runInZone?: boolean): ServiceMessageBroker;
}

/** @deprecated */
export declare class UiArguments {
    args?: FnArg[] | undefined;
    method: string;
    constructor(method: string, args?: FnArg[] | undefined);
}

/** @deprecated */
export declare const VERSION: Version;

/** @deprecated */
export declare const WORKER_APP_LOCATION_PROVIDERS: StaticProvider[];

/** @deprecated */
export declare const WORKER_UI_LOCATION_PROVIDERS: StaticProvider[];

/** @deprecated */
export declare class WorkerAppModule {
}
