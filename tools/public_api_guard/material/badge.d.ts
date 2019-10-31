export declare class MatBadge extends _MatBadgeMixinBase implements OnDestroy, OnChanges, CanDisable {
    _hasContent: boolean;
    _id: number;
    color: ThemePalette;
    content: string;
    description: string;
    hidden: boolean;
    overlap: boolean;
    position: MatBadgePosition;
    size: MatBadgeSize;
    constructor(_ngZone: NgZone, _elementRef: ElementRef<HTMLElement>, _ariaDescriber: AriaDescriber, _renderer: Renderer2, _animationMode?: string | undefined);
    getBadgeElement(): HTMLElement | undefined;
    isAbove(): boolean;
    isAfter(): boolean;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disabled: boolean | string;
    static ngAcceptInputType_hidden: boolean | string;
    static ngAcceptInputType_overlap: boolean | string;
}

export declare class MatBadgeModule {
}

export declare type MatBadgePosition = 'above after' | 'above before' | 'below before' | 'below after' | 'before' | 'after' | 'above' | 'below';

export declare type MatBadgeSize = 'small' | 'medium' | 'large';
