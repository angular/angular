export declare class MatGridAvatarCssMatStyler {
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
}

export declare class MatGridListModule {
}

export declare class MatGridTile {
    _colspan: number;
    _gridList?: MatGridListBase | undefined;
    _rowspan: number;
    colspan: number;
    rowspan: number;
    constructor(_element: ElementRef<HTMLElement>, _gridList?: MatGridListBase | undefined);
    _setStyle(property: string, value: any): void;
}

export declare class MatGridTileFooterCssMatStyler {
}

export declare class MatGridTileHeaderCssMatStyler {
}

export declare class MatGridTileText implements AfterContentInit {
    _lines: QueryList<MatLine>;
    constructor(_element: ElementRef<HTMLElement>);
    ngAfterContentInit(): void;
}
