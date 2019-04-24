export declare const _MatToolbarMixinBase: CanColorCtor & typeof MatToolbarBase;

export declare class MatToolbar extends _MatToolbarMixinBase implements CanColor, AfterViewInit {
    _toolbarRows: QueryList<MatToolbarRow>;
    constructor(elementRef: ElementRef, _platform: Platform, document?: any);
    ngAfterViewInit(): void;
}

export declare class MatToolbarBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}

export declare class MatToolbarModule {
}

export declare class MatToolbarRow {
}

export declare function throwToolbarMixedModesError(): void;
