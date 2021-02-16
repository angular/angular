export declare function downgradeComponent(info: {
    component: Type<any>;
    downgradedModule?: string;
    propagateDigest?: boolean;
    /** @deprecated */ inputs?: string[];
    /** @deprecated */ outputs?: string[];
    /** @deprecated */ selectors?: string[];
}): any;

export declare function downgradeInjectable(token: any, downgradedModule?: string): Function;

export declare function downgradeModule<T>(moduleFactoryOrBootstrapFn: NgModuleFactory<T> | ((extraProviders: StaticProvider[]) => Promise<NgModuleRef<T>>)): string;

export declare function getAngularJSGlobal(): any;

/** @deprecated */
export declare function getAngularLib(): any;

export declare function setAngularJSGlobal(ng: any): void;

/** @deprecated */
export declare function setAngularLib(ng: any): void;

export declare class UpgradeComponent implements OnInit, OnChanges, DoCheck, OnDestroy {
    constructor(name: string, elementRef: ElementRef, injector: Injector);
    ngDoCheck(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare class UpgradeModule {
    $injector: any;
    injector: Injector;
    ngZone: NgZone;
    constructor(
    injector: Injector,
    ngZone: NgZone,
    platformRef: PlatformRef);
    bootstrap(element: Element, modules?: string[], config?: any): void;
}

export declare const VERSION: Version;
