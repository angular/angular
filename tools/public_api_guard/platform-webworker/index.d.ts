/** @experimental */
export declare function bootstrapWorkerUi(workerScriptUri: string, customProviders?: Provider[]): Promise<PlatformRef>;

/** @experimental */
export declare abstract class ClientMessageBroker {
    abstract runOnService(args: UiArguments, returnType: Type<any>): Promise<any>;
}

/** @experimental */
export declare abstract class ClientMessageBrokerFactory {
    abstract createMessageBroker(channel: string, runInZone?: boolean): ClientMessageBroker;
}

/** @experimental */
export declare class FnArg {
    type: Type<any>;
    value: any;
    constructor(value: any, type: Type<any>);
}

/** @experimental */
export declare abstract class MessageBus implements MessageBusSource, MessageBusSink {
    abstract attachToZone(zone: NgZone): void;
    abstract from(channel: string): EventEmitter<any>;
    abstract initChannel(channel: string, runInZone?: boolean): void;
    abstract to(channel: string): EventEmitter<any>;
}

/** @experimental */
export interface MessageBusSink {
    attachToZone(zone: NgZone): void;
    initChannel(channel: string, runInZone: boolean): void;
    to(channel: string): EventEmitter<any>;
}

/** @experimental */
export interface MessageBusSource {
    attachToZone(zone: NgZone): void;
    from(channel: string): EventEmitter<any>;
    initChannel(channel: string, runInZone: boolean): void;
}

/** @experimental */
export declare const platformWorkerApp: (extraProviders?: Provider[]) => PlatformRef;

/** @experimental */
export declare const platformWorkerUi: (extraProviders?: Provider[]) => PlatformRef;

/** @experimental */
export declare const PRIMITIVE: Type<any>;

/** @experimental */
export declare class ReceivedMessage {
    args: any[];
    id: string;
    method: string;
    type: string;
    constructor(data: {
        [key: string]: any;
    });
}

/** @experimental */
export declare abstract class ServiceMessageBroker {
    abstract registerMethod(methodName: string, signature: Type<any>[], method: Function, returnType?: Type<any>): void;
}

/** @experimental */
export declare abstract class ServiceMessageBrokerFactory {
    abstract createMessageBroker(channel: string, runInZone?: boolean): ServiceMessageBroker;
}

/** @experimental */
export declare class UiArguments {
    args: FnArg[];
    method: string;
    constructor(method: string, args?: FnArg[]);
}

/** @experimental */
export declare const WORKER_APP_LOCATION_PROVIDERS: ({
    provide: typeof PlatformLocation;
    useClass: typeof WebWorkerPlatformLocation;
} | {
    provide: any;
    useFactory: (platformLocation: WebWorkerPlatformLocation, zone: NgZone) => () => Promise<boolean>;
    multi: boolean;
    deps: (typeof NgZone | typeof PlatformLocation)[];
})[];

/** @experimental */
export declare const WORKER_UI_LOCATION_PROVIDERS: Provider[];

/** @experimental */
export declare class WorkerAppModule {
}
