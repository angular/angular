export declare function bootstrapWorkerUi(workerScriptUri: string, customProviders?: StaticProvider[]): Promise<PlatformRef>;

export declare class ClientMessageBroker {
    runOnService(args: UiArguments, returnType: Type<any> | SerializerTypes | null): Promise<any> | null;
}

export declare class ClientMessageBrokerFactory {
    createMessageBroker(channel: string, runInZone?: boolean): ClientMessageBroker;
}

export declare class FnArg {
    type: Type<any> | SerializerTypes;
    value: any;
    constructor(value: any, type?: Type<any> | SerializerTypes);
}

export declare abstract class MessageBus implements MessageBusSource, MessageBusSink {
    abstract attachToZone(zone: NgZone): void;
    abstract from(channel: string): EventEmitter<any>;
    abstract initChannel(channel: string, runInZone?: boolean): void;
    abstract to(channel: string): EventEmitter<any>;
}

export interface MessageBusSink {
    attachToZone(zone: NgZone): void;
    initChannel(channel: string, runInZone: boolean): void;
    to(channel: string): EventEmitter<any>;
}

export interface MessageBusSource {
    attachToZone(zone: NgZone): void;
    from(channel: string): EventEmitter<any>;
    initChannel(channel: string, runInZone: boolean): void;
}

export declare const platformWorkerApp: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

export declare const platformWorkerUi: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

export interface ReceivedMessage {
    args: any[];
    id: string;
    method: string;
    type: string;
}

export declare const enum SerializerTypes {
    RENDERER_TYPE_2 = 0,
    PRIMITIVE = 1,
    RENDER_STORE_OBJECT = 2
}

export declare class ServiceMessageBroker {
    registerMethod(methodName: string, signature: Array<Type<any> | SerializerTypes> | null, method: (..._: any[]) => Promise<any> | void, returnType?: Type<any> | SerializerTypes): void;
}

export declare class ServiceMessageBrokerFactory {
    createMessageBroker(channel: string, runInZone?: boolean): ServiceMessageBroker;
}

export declare class UiArguments {
    args?: FnArg[] | undefined;
    method: string;
    constructor(method: string, args?: FnArg[] | undefined);
}

export declare const VERSION: Version;

export declare const WORKER_APP_LOCATION_PROVIDERS: ({
    provide: typeof PlatformLocation;
    useClass: typeof WebWorkerPlatformLocation;
    useFactory?: undefined;
    multi?: undefined;
    deps?: undefined;
} | {
    provide: InjectionToken<(() => void)[]>;
    useFactory: typeof appInitFnFactory;
    multi: boolean;
    deps: (typeof NgZone | typeof PlatformLocation)[];
    useClass?: undefined;
} | {
    provide: InjectionToken<Promise<any>>;
    useFactory: typeof locationInitialized;
    deps: (typeof PlatformLocation)[];
    useClass?: undefined;
    multi?: undefined;
})[];

export declare const WORKER_UI_LOCATION_PROVIDERS: StaticProvider[];

export declare class WorkerAppModule {
}
