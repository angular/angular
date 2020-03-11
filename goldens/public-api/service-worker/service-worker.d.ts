export declare class NgswCommChannel {
    readonly events: Observable<TypedEvent>;
    get isEnabled(): boolean;
    readonly registration: Observable<ServiceWorkerRegistration>;
    readonly worker: Observable<ServiceWorker>;
    constructor(serviceWorker: ServiceWorkerContainer | undefined);
    eventsOfType<T extends TypedEvent>(type: T['type']): Observable<T>;
    generateNonce(): number;
    nextEventOfType<T extends TypedEvent>(type: T['type']): Observable<T>;
    postMessage(action: string, payload: Object): Promise<void>;
    postMessageWithStatus(type: string, payload: Object, nonce: number): Promise<void>;
    waitForStatus(nonce: number): Promise<void>;
}

export declare class ServiceWorkerModule {
    static register(script: string, opts?: SwRegistrationOptions): ModuleWithProviders<ServiceWorkerModule>;
}

export declare class SwPush {
    get isEnabled(): boolean;
    readonly messages: Observable<object>;
    readonly notificationClicks: Observable<{
        action: string;
        notification: NotificationOptions & {
            title: string;
        };
    }>;
    readonly subscription: Observable<PushSubscription | null>;
    constructor(sw: NgswCommChannel);
    requestSubscription(options: {
        serverPublicKey: string;
    }): Promise<PushSubscription>;
    unsubscribe(): Promise<void>;
}

export declare abstract class SwRegistrationOptions {
    enabled?: boolean;
    registrationStrategy?: string | (() => Observable<unknown>);
    scope?: string;
}

export declare class SwUpdate {
    readonly activated: Observable<UpdateActivatedEvent>;
    readonly available: Observable<UpdateAvailableEvent>;
    get isEnabled(): boolean;
    constructor(sw: NgswCommChannel);
    activateUpdate(): Promise<void>;
    checkForUpdate(): Promise<void>;
}

export declare interface UpdateActivatedEvent {
    current: {
        hash: string;
        appData?: Object;
    };
    previous?: {
        hash: string;
        appData?: Object;
    };
    type: 'UPDATE_ACTIVATED';
}

export declare interface UpdateAvailableEvent {
    available: {
        hash: string;
        appData?: Object;
    };
    current: {
        hash: string;
        appData?: Object;
    };
    type: 'UPDATE_AVAILABLE';
}
