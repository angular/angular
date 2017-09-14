/** @experimental */
export declare function bootstrapWorkerUi(workerScriptUri: string, customProviders?: StaticProvider[]): Promise<PlatformRef>;

/** @experimental */
export declare class ClientMessageBroker {
    runOnService(args: UiArguments, returnType: Type<any> | SerializerTypes | null): Promise<any> | null;
}

/** @experimental */
export declare class ClientMessageBrokerFactory {
    createMessageBroker(channel: string, runInZone?: boolean): ClientMessageBroker;
}

/** @experimental */
export declare class FnArg {
    type: Type<any> | SerializerTypes;
    value: any;
    constructor(value: any, type?: Type<any> | SerializerTypes);
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
export declare const platformWorkerApp: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

/** @experimental */
export declare const platformWorkerUi: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

/** @experimental */
export interface ReceivedMessage {
    args: any[];
    id: string;
    method: string;
    type: string;
}

/** @experimental */
export declare const enum SerializerTypes {
    RENDERER_TYPE_2 = 0,
    PRIMITIVE = 1,
    RENDER_STORE_OBJECT = 2,
}

/** @experimental */
export declare class ServiceMessageBroker {
    registerMethod(methodName: string, signature: Array<Type<any> | SerializerTypes> | null, method: (..._: any[]) => Promise<any> | void, returnType?: Type<any> | SerializerTypes): void;
}

/** @experimental */
export declare class ServiceMessageBrokerFactory {
    createMessageBroker(channel: string, runInZone?: boolean): ServiceMessageBroker;
}

/** @experimental */
export declare class UiArguments {
    args: FnArg[] | undefined;
    method: string;
    constructor(method: string, args?: FnArg[] | undefined);
}

/** @stable */
export declare const VERSION: Version;

/** @experimental */
export declare const WORKER_APP_LOCATION_PROVIDERS: ({
    provide: typeof PlatformLocation;
    useClass: typeof WebWorkerPlatformLocation;
} | {
    provide: InjectionToken<(() => void)[]>;
    useFactory: (platformLocation: WebWorkerPlatformLocation, zone: NgZone) => () => Promise<boolean>;
    multi: boolean;
    deps: (typeof NgZone | typeof PlatformLocation)[];
} | {
    provide: InjectionToken<Promise<any>>;
    useFactory: (platformLocation: WebWorkerPlatformLocation) => Promise<any>;
    deps: typeof PlatformLocation[];
})[];

/** @experimental */
export declare const WORKER_UI_LOCATION_PROVIDERS: StaticProvider[];

/** @experimental */
export declare class WorkerAppModule {
}
