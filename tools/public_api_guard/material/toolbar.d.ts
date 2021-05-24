export declare class MatToolbar extends _MatToolbarBase implements CanColor, AfterViewInit {
    _toolbarRows: QueryList<MatToolbarRow>;
    constructor(elementRef: ElementRef, _platform: Platform, document?: any);
    ngAfterViewInit(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatToolbar, "mat-toolbar", ["matToolbar"], { "color": "color"; }, {}, ["_toolbarRows"], ["*", "mat-toolbar-row"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatToolbar, never>;
}

export declare class MatToolbarModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatToolbarModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatToolbarModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatToolbarModule, [typeof i1.MatToolbar, typeof i1.MatToolbarRow], [typeof i2.MatCommonModule], [typeof i1.MatToolbar, typeof i1.MatToolbarRow, typeof i2.MatCommonModule]>;
}

export declare class MatToolbarRow {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatToolbarRow, "mat-toolbar-row", ["matToolbarRow"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatToolbarRow, never>;
}

export declare function throwToolbarMixedModesError(): void;
