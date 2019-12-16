export declare type AutofillEvent = {
    target: Element;
    isAutofilled: boolean;
};

export declare class AutofillMonitor implements OnDestroy {
    constructor(_platform: Platform, _ngZone: NgZone);
    monitor(element: Element): Observable<AutofillEvent>;
    monitor(element: ElementRef<Element>): Observable<AutofillEvent>;
    ngOnDestroy(): void;
    stopMonitoring(element: Element): void;
    stopMonitoring(element: ElementRef<Element>): void;
    static ɵfac: i0.ɵɵFactoryDef<AutofillMonitor>;
    static ɵprov: i0.ɵɵInjectableDef<AutofillMonitor>;
}

export declare class CdkAutofill implements OnDestroy, OnInit {
    cdkAutofill: EventEmitter<AutofillEvent>;
    constructor(_elementRef: ElementRef<HTMLElement>, _autofillMonitor: AutofillMonitor);
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkAutofill, "[cdkAutofill]", never, {}, { 'cdkAutofill': "cdkAutofill" }, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkAutofill>;
}

export declare class CdkTextareaAutosize implements AfterViewInit, DoCheck, OnDestroy {
    enabled: boolean;
    maxRows: number;
    minRows: number;
    constructor(_elementRef: ElementRef<HTMLElement>, _platform: Platform, _ngZone: NgZone);
    _noopInputHandler(): void;
    _setMaxHeight(): void;
    _setMinHeight(): void;
    ngAfterViewInit(): void;
    ngDoCheck(): void;
    ngOnDestroy(): void;
    reset(): void;
    resizeToFitContent(force?: boolean): void;
    static ngAcceptInputType_enabled: BooleanInput;
    static ngAcceptInputType_maxRows: NumberInput;
    static ngAcceptInputType_minRows: NumberInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkTextareaAutosize, "textarea[cdkTextareaAutosize]", ["cdkTextareaAutosize"], { 'minRows': "cdkAutosizeMinRows", 'maxRows': "cdkAutosizeMaxRows", 'enabled': "cdkTextareaAutosize" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkTextareaAutosize>;
}

export declare class TextFieldModule {
    static ɵinj: i0.ɵɵInjectorDef<TextFieldModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<TextFieldModule, [typeof i1.CdkAutofill, typeof i2.CdkTextareaAutosize], [typeof i3.PlatformModule], [typeof i1.CdkAutofill, typeof i2.CdkTextareaAutosize]>;
}
