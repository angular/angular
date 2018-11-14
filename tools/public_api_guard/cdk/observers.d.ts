export declare class CdkObserveContent implements AfterContentInit, OnDestroy {
    debounce: number;
    disabled: any;
    event: EventEmitter<MutationRecord[]>;
    constructor(_contentObserver: ContentObserver, _elementRef: ElementRef<HTMLElement>, _ngZone: NgZone);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
}

export declare class ContentObserver implements OnDestroy {
    constructor(_mutationObserverFactory: MutationObserverFactory);
    ngOnDestroy(): void;
    observe(element: Element): Observable<MutationRecord[]>;
    observe(element: ElementRef<Element>): Observable<MutationRecord[]>;
}

export declare class MutationObserverFactory {
    create(callback: MutationCallback): MutationObserver | null;
}

export declare class ObserversModule {
}
