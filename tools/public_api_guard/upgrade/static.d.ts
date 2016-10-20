/** @experimental */
export declare function downgradeComponent(info: ComponentInfo): angular.IInjectable;

/** @experimental */
export declare function downgradeInjectable(token: any): (string | ((i: Injector) => any))[];

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
    $injector: angular.IInjectorService;
    injector: Injector;
    ngZone: NgZone;
    constructor(injector: Injector, ngZone: NgZone);
    bootstrap(element: Element, modules?: string[], config?: angular.IAngularBootstrapConfig): void;
}
