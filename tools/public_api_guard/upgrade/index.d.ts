/** @experimental */
export declare function downgradeComponent(info: ComponentInfo): angular.IInjectable;

/** @experimental */
export declare function downgradeInjectable(token: any): (string | ((i: Injector) => any))[];

/** @stable */
export declare class UpgradeAdapter {
    constructor(ng2AppModule: Type<any>, compilerOptions?: CompilerOptions);
    bootstrap(element: Element, modules?: any[], config?: angular.IAngularBootstrapConfig): UpgradeAdapterRef;
    downgradeNg2Component(type: Type<any>): Function;
    downgradeNg2Provider(token: any): Function;
    upgradeNg1Component(name: string): Type<any>;
    upgradeNg1Provider(name: string, options?: {
        asToken: any;
    }): void;
}

/** @stable */
export declare class UpgradeAdapterRef {
    ng1Injector: angular.IInjectorService;
    ng1RootScope: angular.IRootScopeService;
    ng2Injector: Injector;
    ng2ModuleRef: NgModuleRef<any>;
    dispose(): void;
    ready(fn: (upgradeAdapterRef?: UpgradeAdapterRef) => void): void;
}

/** @experimental */
export declare class UpgradeComponent implements OnInit, OnChanges, DoCheck {
    constructor(name: string, elementRef: ElementRef, injector: Injector);
    ngDoCheck(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
}

/** @experimental */
export declare class UpgradeModule {
    $injector: angular.IInjectorService;
    injector: Injector;
    ngZone: NgZone;
    constructor(injector: Injector, ngZone: NgZone);
    bootstrap(element: Element, modules?: string[], config?: angular.IAngularBootstrapConfig): void;
}
