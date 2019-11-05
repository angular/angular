export declare class MatToolbar extends _MatToolbarMixinBase implements CanColor, AfterViewInit {
    _toolbarRows: QueryList<MatToolbarRow>;
    constructor(elementRef: ElementRef, _platform: Platform, document?: any);
    ngAfterViewInit(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatToolbar, "mat-toolbar", ["matToolbar"], { 'color': "color" }, {}, ["_toolbarRows"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatToolbar>;
}

export declare class MatToolbarModule {
    static ɵinj: i0.ɵɵInjectorDef<MatToolbarModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatToolbarModule, [typeof i1.MatToolbar, typeof i1.MatToolbarRow], [typeof i2.MatCommonModule], [typeof i1.MatToolbar, typeof i1.MatToolbarRow, typeof i2.MatCommonModule]>;
}

export declare class MatToolbarRow {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatToolbarRow, "mat-toolbar-row", ["matToolbarRow"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatToolbarRow>;
}

export declare function throwToolbarMixedModesError(): void;
