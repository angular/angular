export declare const MAT_SLIDER_VALUE_ACCESSOR: any;

export declare class MatSlider extends _MatSliderBase implements ControlValueAccessor, OnDestroy, CanDisable, CanColor, AfterViewInit, HasTabIndex {
    _animationMode?: string | undefined;
    protected _document: Document;
    _isActive: boolean;
    _isSliding: 'keyboard' | 'pointer' | null;
    readonly change: EventEmitter<MatSliderChange>;
    get displayValue(): string | number;
    displayWith: (value: number) => string | number;
    readonly input: EventEmitter<MatSliderChange>;
    get invert(): boolean;
    set invert(value: boolean);
    get max(): number;
    set max(v: number);
    get min(): number;
    set min(v: number);
    onTouched: () => any;
    get percent(): number;
    get step(): number;
    set step(v: number);
    get thumbLabel(): boolean;
    set thumbLabel(value: boolean);
    get tickInterval(): 'auto' | number;
    set tickInterval(value: 'auto' | number);
    get value(): number;
    set value(v: number);
    readonly valueChange: EventEmitter<number | null>;
    valueText: string;
    get vertical(): boolean;
    set vertical(value: boolean);
    constructor(elementRef: ElementRef, _focusMonitor: FocusMonitor, _changeDetectorRef: ChangeDetectorRef, _dir: Directionality, tabIndex: string, _ngZone: NgZone, _document: any, _animationMode?: string | undefined);
    _getThumbContainerStyles(): {
        [key: string]: string;
    };
    _getThumbGap(): 7 | 10 | 0;
    _getTicksContainerStyles(): {
        [key: string]: string;
    };
    _getTicksStyles(): {
        [key: string]: string;
    };
    _getTrackBackgroundStyles(): {
        [key: string]: string;
    };
    _getTrackFillStyles(): {
        [key: string]: string;
    };
    _isMinValue(): boolean;
    _onBlur(): void;
    _onFocus(): void;
    _onKeydown(event: KeyboardEvent): void;
    _onKeyup(): void;
    _onMouseenter(): void;
    _shouldInvertAxis(): boolean;
    _shouldInvertMouseCoords(): boolean;
    blur(): void;
    focus(options?: FocusOptions): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_invert: BooleanInput;
    static ngAcceptInputType_max: NumberInput;
    static ngAcceptInputType_min: NumberInput;
    static ngAcceptInputType_step: NumberInput;
    static ngAcceptInputType_tabIndex: NumberInput;
    static ngAcceptInputType_thumbLabel: BooleanInput;
    static ngAcceptInputType_tickInterval: NumberInput;
    static ngAcceptInputType_value: NumberInput;
    static ngAcceptInputType_vertical: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatSlider, "mat-slider", ["matSlider"], { "disabled": "disabled"; "color": "color"; "tabIndex": "tabIndex"; "invert": "invert"; "max": "max"; "min": "min"; "step": "step"; "thumbLabel": "thumbLabel"; "tickInterval": "tickInterval"; "value": "value"; "displayWith": "displayWith"; "valueText": "valueText"; "vertical": "vertical"; }, { "change": "change"; "input": "input"; "valueChange": "valueChange"; }, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSlider, [null, null, null, { optional: true; }, { attribute: "tabindex"; }, null, null, { optional: true; }]>;
}

export declare class MatSliderChange {
    source: MatSlider;
    value: number | null;
}

export declare class MatSliderModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSliderModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatSliderModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatSliderModule, [typeof i1.MatSlider], [typeof i2.CommonModule, typeof i3.MatCommonModule], [typeof i1.MatSlider, typeof i3.MatCommonModule]>;
}
