/** @experimental */
export declare function downgradeComponent(info: {
    component: Type<any>;
    /** @deprecated */ inputs?: string[];
    /** @deprecated */ outputs?: string[];
    /** @deprecated */ selectors?: string[];
}): any;

/** @experimental */
export declare function downgradeInjectable(token: any): Function;

/** @stable */
export declare function getAngularLib(): any;

/** @stable */
export declare function setAngularLib(ng: any): void;

/** @experimental */
export declare class UpgradeComponent implements OnInit, OnChanges, DoCheck, OnDestroy {
    constructor(name: string, elementRef: ElementRef, injector: Injector);
    ngDoCheck(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

/** @experimental */
export declare class UpgradeModule {
    $injector: any;
    injector: Injector;
    ngZone: NgZone;
    constructor(
        injector: Injector,
        ngZone: NgZone);
    bootstrap(element: Element, modules?: string[], config?: any): void;
}

/** @stable */
export declare const VERSION: Version;
