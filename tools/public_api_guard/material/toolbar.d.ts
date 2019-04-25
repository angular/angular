export declare class MatToolbar extends _MatToolbarMixinBase implements CanColor, AfterViewInit {
    _toolbarRows: QueryList<MatToolbarRow>;
    constructor(elementRef: ElementRef, _platform: Platform, document?: any);
    ngAfterViewInit(): void;
}

export declare class MatToolbarModule {
}

export declare class MatToolbarRow {
}

export declare function throwToolbarMixedModesError(): void;
