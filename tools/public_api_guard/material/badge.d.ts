export declare class MatBadge extends _MatBadgeBase implements OnDestroy, OnChanges, CanDisable {
    _hasContent: boolean;
    _id: number;
    get color(): ThemePalette;
    set color(value: ThemePalette);
    content: string | number | undefined | null;
    get description(): string;
    set description(newDescription: string);
    get hidden(): boolean;
    set hidden(val: boolean);
    get overlap(): boolean;
    set overlap(val: boolean);
    position: MatBadgePosition;
    size: MatBadgeSize;
    constructor(_ngZone: NgZone, _elementRef: ElementRef<HTMLElement>, _ariaDescriber: AriaDescriber, _renderer: Renderer2, _animationMode?: string | undefined);
    getBadgeElement(): HTMLElement | undefined;
    isAbove(): boolean;
    isAfter(): boolean;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_hidden: BooleanInput;
    static ngAcceptInputType_overlap: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatBadge, "[matBadge]", never, { "disabled": "matBadgeDisabled"; "color": "matBadgeColor"; "overlap": "matBadgeOverlap"; "position": "matBadgePosition"; "content": "matBadge"; "description": "matBadgeDescription"; "size": "matBadgeSize"; "hidden": "matBadgeHidden"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatBadge, [null, null, null, null, { optional: true; }]>;
}

export declare class MatBadgeModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatBadgeModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatBadgeModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatBadgeModule, [typeof i1.MatBadge], [typeof i2.A11yModule, typeof i3.MatCommonModule], [typeof i1.MatBadge, typeof i3.MatCommonModule]>;
}

export declare type MatBadgePosition = 'above after' | 'above before' | 'below before' | 'below after' | 'before' | 'after' | 'above' | 'below';

export declare type MatBadgeSize = 'small' | 'medium' | 'large';
