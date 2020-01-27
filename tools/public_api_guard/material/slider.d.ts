export declare const MAT_SLIDER_VALUE_ACCESSOR: any;

export declare class MatSlider extends _MatSliderMixinBase implements ControlValueAccessor, OnDestroy, CanDisable, CanColor, OnInit, HasTabIndex {
    _animationMode?: string | undefined;
    protected _document?: Document;
    get _invertAxis(): boolean;
    _isActive: boolean;
    get _isMinValue(): boolean;
    _isSliding: boolean;
    get _thumbContainerStyles(): {
        [key: string]: string;
    };
    get _thumbGap(): 7 | 10 | 0;
    get _ticksContainerStyles(): {
        [key: string]: string;
    };
    get _ticksStyles(): {
        [key: string]: string;
    };
    get _trackBackgroundStyles(): {
        [key: string]: string;
    };
    get _trackFillStyles(): {
        [key: string]: string;
    };
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
    get value(): number | null;
    set value(v: number | null);
    readonly valueChange: EventEmitter<number | null>;
    get vertical(): boolean;
    set vertical(value: boolean);
    constructor(elementRef: ElementRef, _focusMonitor: FocusMonitor, _changeDetectorRef: ChangeDetectorRef, _dir: Directionality, tabIndex: string, _animationMode?: string | undefined, _ngZone?: NgZone | undefined,
    document?: any);
    _onBlur(): void;
    _onFocus(): void;
    _onKeydown(event: KeyboardEvent): void;
    _onKeyup(): void;
    _onMouseenter(): void;
    _shouldInvertMouseCoords(): boolean;
    blur(): void;
    focus(options?: FocusOptions): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_invert: BooleanInput;
    static ngAcceptInputType_max: NumberInput;
    static ngAcceptInputType_min: NumberInput;
    static ngAcceptInputType_step: NumberInput;
    static ngAcceptInputType_thumbLabel: BooleanInput;
    static ngAcceptInputType_tickInterval: NumberInput;
    static ngAcceptInputType_value: NumberInput;
    static ngAcceptInputType_vertical: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatSlider, "mat-slider", ["matSlider"], { "disabled": "disabled"; "color": "color"; "tabIndex": "tabIndex"; "invert": "invert"; "max": "max"; "min": "min"; "step": "step"; "thumbLabel": "thumbLabel"; "tickInterval": "tickInterval"; "value": "value"; "displayWith": "displayWith"; "vertical": "vertical"; }, { "change": "change"; "input": "input"; "valueChange": "valueChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatSlider>;
}

export declare class MatSliderChange {
    source: MatSlider;
    value: number | null;
}

export declare class MatSliderModule {
    static ɵinj: i0.ɵɵInjectorDef<MatSliderModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatSliderModule, [typeof i1.MatSlider], [typeof i2.CommonModule, typeof i3.MatCommonModule], [typeof i1.MatSlider, typeof i3.MatCommonModule]>;
}
