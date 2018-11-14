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
}

export declare class CdkAutofill implements OnDestroy, OnInit {
    cdkAutofill: EventEmitter<AutofillEvent>;
    constructor(_elementRef: ElementRef<HTMLElement>, _autofillMonitor: AutofillMonitor);
    ngOnDestroy(): void;
    ngOnInit(): void;
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
}

export declare class TextFieldModule {
}
