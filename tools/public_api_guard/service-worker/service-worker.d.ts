export declare class ServiceWorkerModule {
    static register(script: string, opts?: {
        scope?: string;
        enabled?: boolean;
    }): ModuleWithProviders<ServiceWorkerModule>;
}

export declare class SwPush {
    readonly isEnabled: boolean;
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

export declare class SwUpdate {
    readonly activated: Observable<UpdateActivatedEvent>;
    readonly available: Observable<UpdateAvailableEvent>;
    readonly isEnabled: boolean;
    constructor(sw: NgswCommChannel);
    activateUpdate(): Promise<void>;
    checkForUpdate(): Promise<void>;
}

export interface UpdateActivatedEvent {
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

export interface UpdateAvailableEvent {
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
