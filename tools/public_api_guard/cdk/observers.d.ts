export declare class CdkObserveContent implements AfterContentInit, OnDestroy {
    get debounce(): number;
    set debounce(value: number);
    get disabled(): any;
    set disabled(value: any);
    readonly event: EventEmitter<MutationRecord[]>;
    constructor(_contentObserver: ContentObserver, _elementRef: ElementRef<HTMLElement>, _ngZone: NgZone);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_debounce: NumberInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkObserveContent, "[cdkObserveContent]", ["cdkObserveContent"], { "disabled": "cdkObserveContentDisabled"; "debounce": "debounce"; }, { "event": "cdkObserveContent"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkObserveContent, never>;
}

export declare class ContentObserver implements OnDestroy {
    constructor(_mutationObserverFactory: MutationObserverFactory);
    ngOnDestroy(): void;
    observe(element: Element): Observable<MutationRecord[]>;
    observe(element: ElementRef<Element>): Observable<MutationRecord[]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentObserver, never>;
    static ɵprov: i0.ɵɵInjectableDef<ContentObserver>;
}

export declare class MutationObserverFactory {
    create(callback: MutationCallback): MutationObserver | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<MutationObserverFactory, never>;
    static ɵprov: i0.ɵɵInjectableDef<MutationObserverFactory>;
}

export declare class ObserversModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<ObserversModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<ObserversModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ObserversModule, [typeof CdkObserveContent], never, [typeof CdkObserveContent]>;
}
