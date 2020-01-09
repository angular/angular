export declare class MatGridAvatarCssMatStyler {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatGridAvatarCssMatStyler, "[mat-grid-avatar], [matGridAvatar]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatGridAvatarCssMatStyler>;
}

export declare class MatGridList implements MatGridListBase, OnInit, AfterContentChecked {
    _tiles: QueryList<MatGridTile>;
    cols: number;
    gutterSize: string;
    rowHeight: string | number;
    constructor(_element: ElementRef<HTMLElement>, _dir: Directionality);
    _setListStyle(style: [string, string | null] | null): void;
    ngAfterContentChecked(): void;
    ngOnInit(): void;
    static ngAcceptInputType_cols: NumberInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatGridList, "mat-grid-list", ["matGridList"], { "cols": "cols"; "gutterSize": "gutterSize"; "rowHeight": "rowHeight"; }, {}, ["_tiles"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatGridList>;
}

export declare class MatGridListModule {
    static ɵinj: i0.ɵɵInjectorDef<MatGridListModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatGridListModule, [typeof i1.MatGridList, typeof i2.MatGridTile, typeof i2.MatGridTileText, typeof i2.MatGridTileHeaderCssMatStyler, typeof i2.MatGridTileFooterCssMatStyler, typeof i2.MatGridAvatarCssMatStyler], [typeof i3.MatLineModule, typeof i3.MatCommonModule], [typeof i1.MatGridList, typeof i2.MatGridTile, typeof i2.MatGridTileText, typeof i3.MatLineModule, typeof i3.MatCommonModule, typeof i2.MatGridTileHeaderCssMatStyler, typeof i2.MatGridTileFooterCssMatStyler, typeof i2.MatGridAvatarCssMatStyler]>;
}

export declare class MatGridTile {
    _colspan: number;
    _gridList?: MatGridListBase | undefined;
    _rowspan: number;
    colspan: number;
    rowspan: number;
    constructor(_element: ElementRef<HTMLElement>, _gridList?: MatGridListBase | undefined);
    _setStyle(property: string, value: any): void;
    static ngAcceptInputType_colspan: NumberInput;
    static ngAcceptInputType_rowspan: NumberInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatGridTile, "mat-grid-tile", ["matGridTile"], { "rowspan": "rowspan"; "colspan": "colspan"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatGridTile>;
}

export declare class MatGridTileFooterCssMatStyler {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatGridTileFooterCssMatStyler, "mat-grid-tile-footer", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatGridTileFooterCssMatStyler>;
}

export declare class MatGridTileHeaderCssMatStyler {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatGridTileHeaderCssMatStyler, "mat-grid-tile-header", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatGridTileHeaderCssMatStyler>;
}

export declare class MatGridTileText implements AfterContentInit {
    _lines: QueryList<MatLine>;
    constructor(_element: ElementRef<HTMLElement>);
    ngAfterContentInit(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatGridTileText, "mat-grid-tile-header, mat-grid-tile-footer", never, {}, {}, ["_lines"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatGridTileText>;
}
