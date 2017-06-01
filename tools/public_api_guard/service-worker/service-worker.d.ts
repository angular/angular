/** @experimental */
export declare class NgPushRegistration {
    readonly url: string;
    constructor(ps: any);
    auth(): string;
    key(method?: string): string;
    toJSON(): Object;
    unsubscribe(): Observable<boolean>;
}

/** @experimental */
export declare class NgServiceWorker {
    push: Observable<any>;
    updates: Observable<UpdateEvent>;
    constructor(zone: NgZone);
    activateUpdate(version: string): Observable<boolean>;
    checkForUpdate(): Observable<boolean>;
    log(): Observable<string>;
    ping(): Observable<any>;
    registerForPush(pushOptions?: PushOptions): Observable<NgPushRegistration>;
}

/** @experimental */
export interface PushOptions {
    applicationServerKey?: string;
}

/** @experimental */
export declare class ServiceWorkerModule {
}

/** @experimental */
export interface UpdateEvent {
    type: 'pending' | 'activation';
    version?: string;
}
