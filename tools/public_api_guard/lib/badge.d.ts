export declare const _MatBadgeMixinBase: CanDisableCtor & typeof MatBadgeBase;

export declare class MatBadge extends _MatBadgeMixinBase implements OnDestroy, CanDisable {
    _hasContent: boolean;
    _id: number;
    color: ThemePalette;
    content: string;
    description: string;
    hidden: boolean;
    overlap: boolean;
    position: MatBadgePosition;
    size: MatBadgeSize;
    constructor(_document: any, _ngZone: NgZone, _elementRef: ElementRef<HTMLElement>, _ariaDescriber: AriaDescriber,
    _renderer?: Renderer2 | undefined, _animationMode?: string | undefined);
    isAbove(): boolean;
    isAfter(): boolean;
    ngOnDestroy(): void;
}

export declare class MatBadgeBase {
}

export declare class MatBadgeModule {
}

export declare type MatBadgePosition = 'above after' | 'above before' | 'below before' | 'below after';

export declare type MatBadgeSize = 'small' | 'medium' | 'large';
