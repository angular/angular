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
    static ɵfac: i0.ɵɵFactoryDeclaration<AutofillMonitor, never>;
    static ɵprov: i0.ɵɵInjectableDef<AutofillMonitor>;
}

export declare class CdkAutofill implements OnDestroy, OnInit {
    cdkAutofill: EventEmitter<AutofillEvent>;
    constructor(_elementRef: ElementRef<HTMLElement>, _autofillMonitor: AutofillMonitor);
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkAutofill, "[cdkAutofill]", never, {}, { "cdkAutofill": "cdkAutofill"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkAutofill, never>;
}

export declare class CdkTextareaAutosize implements AfterViewInit, DoCheck, OnDestroy {
    protected _document?: Document;
    get enabled(): boolean;
    set enabled(value: boolean);
    get maxRows(): number;
    set maxRows(value: number);
    get minRows(): number;
    set minRows(value: number);
    get placeholder(): string;
    set placeholder(value: string);
    constructor(_elementRef: ElementRef<HTMLElement>, _platform: Platform, _ngZone: NgZone,
    document?: any);
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
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkTextareaAutosize, "textarea[cdkTextareaAutosize]", ["cdkTextareaAutosize"], { "minRows": "cdkAutosizeMinRows"; "maxRows": "cdkAutosizeMaxRows"; "enabled": "cdkTextareaAutosize"; "placeholder": "placeholder"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkTextareaAutosize, [null, null, null, { optional: true; }]>;
}

export declare class TextFieldModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<TextFieldModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<TextFieldModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<TextFieldModule, [typeof i1.CdkAutofill, typeof i2.CdkTextareaAutosize], [typeof i3.PlatformModule], [typeof i1.CdkAutofill, typeof i2.CdkTextareaAutosize]>;
}
