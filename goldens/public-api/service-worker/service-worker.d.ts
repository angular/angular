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
    constructor(sw: ɵangular_packages_service_worker_service_worker_a);
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
    readonly unrecoverable: Observable<UnrecoverableStateEvent>;
    constructor(sw: ɵangular_packages_service_worker_service_worker_a);
    activateUpdate(): Promise<void>;
    checkForUpdate(): Promise<void>;
}

export declare interface UnrecoverableStateEvent {
    reason: string;
    type: 'UNRECOVERABLE_STATE';
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
