export declare class CdkObserveContent implements AfterContentInit, OnDestroy {
    get debounce(): number;
    set debounce(value: number);
    get disabled(): any;
    set disabled(value: any);
    event: EventEmitter<MutationRecord[]>;
    constructor(_contentObserver: ContentObserver, _elementRef: ElementRef<HTMLElement>, _ngZone: NgZone);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_debounce: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkObserveContent, "[cdkObserveContent]", ["cdkObserveContent"], { "disabled": "cdkObserveContentDisabled"; "debounce": "debounce"; }, { "event": "cdkObserveContent"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkObserveContent, never>;
}

export declare class ContentObserver implements OnDestroy {
    constructor(_mutationObserverFactory: MutationObserverFactory);
    ngOnDestroy(): void;
    observe(element: Element): Observable<MutationRecord[]>;
    observe(element: ElementRef<Element>): Observable<MutationRecord[]>;
    static ɵfac: i0.ɵɵFactoryDef<ContentObserver, never>;
    static ɵprov: i0.ɵɵInjectableDef<ContentObserver>;
}

export declare class MutationObserverFactory {
    create(callback: MutationCallback): MutationObserver | null;
    static ɵfac: i0.ɵɵFactoryDef<MutationObserverFactory, never>;
    static ɵprov: i0.ɵɵInjectableDef<MutationObserverFactory>;
}

export declare class ObserversModule {
    static ɵinj: i0.ɵɵInjectorDef<ObserversModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<ObserversModule, [typeof CdkObserveContent], never, [typeof CdkObserveContent]>;
}
