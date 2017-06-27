/** @experimental */
export interface NgswAppVersion {
    readonly appData: Object | null;
    readonly manifestHash: string;
}

/** @experimental */
export declare class NgswDebug {
    constructor(sw: NgswCommChannel);
    ping(): Promise<void>;
}

/** @experimental */
export declare class NgswModule {
    static register(script: string, opts?: RegistrationOptions): ModuleWithProviders;
}

/** @experimental */
export declare class NgswPush {
    readonly messages: Observable<object>;
    readonly subscription: Observable<PushSubscription | null>;
    constructor(sw: NgswCommChannel);
    requestSubscription(options: {
        serverPublicKey: string;
    }): Promise<PushSubscription>;
    unsubscribe(): Promise<void>;
}

/** @experimental */
export declare class NgswUpdate {
    readonly activated: Observable<NgswUpdateActivatedEvent>;
    readonly available: Observable<NgswUpdateAvailableEvent>;
    readonly version: Observable<NgswAppVersion | null>;
    constructor(sw: NgswCommChannel);
    activateUpdate(version: NgswAppVersion): Promise<void>;
    check(): Promise<void>;
}

/** @experimental */
export interface NgswUpdateActivatedEvent {
    readonly current: NgswAppVersion;
    readonly previous: NgswAppVersion | null;
}

/** @experimental */
export interface NgswUpdateAvailableEvent {
    readonly current: NgswAppVersion;
    readonly next: NgswAppVersion;
}
