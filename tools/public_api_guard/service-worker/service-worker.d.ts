/** @experimental */
export declare class ServiceWorkerModule {
    static register(script: string, opts?: RegistrationOptions): ModuleWithProviders;
}

/** @experimental */
export declare class SwPush {
    readonly messages: Observable<object>;
    readonly subscription: Observable<PushSubscription | null>;
    constructor(sw: NgswCommChannel);
    requestSubscription(options: {
        serverPublicKey: string;
    }): Promise<PushSubscription>;
    unsubscribe(): Promise<void>;
}

/** @experimental */
export declare class SwUpdate {
    readonly activated: Observable<UpdateActivatedEvent>;
    readonly available: Observable<UpdateAvailableEvent>;
    constructor(sw: NgswCommChannel);
    activateUpdate(): Promise<void>;
    checkForUpdate(): Promise<void>;
}
