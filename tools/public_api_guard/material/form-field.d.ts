export declare const _MAT_HINT: InjectionToken<MatHint>;

export declare type FloatLabelType = 'always' | 'never' | 'auto';

export declare function getMatFormFieldDuplicatedHintError(align: string): Error;

export declare function getMatFormFieldMissingControlError(): Error;

export declare function getMatFormFieldPlaceholderConflictError(): Error;

export declare const MAT_ERROR: InjectionToken<MatError>;

export declare const MAT_FORM_FIELD: InjectionToken<MatFormField>;

export declare const MAT_FORM_FIELD_DEFAULT_OPTIONS: InjectionToken<MatFormFieldDefaultOptions>;

export declare const MAT_PREFIX: InjectionToken<MatPrefix>;

export declare const MAT_SUFFIX: InjectionToken<MatSuffix>;

export declare class MatError {
    id: string;
    constructor(ariaLive: string, elementRef: ElementRef);
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatError, "mat-error", never, { "id": "id"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatError, [{ attribute: "aria-live"; }, null]>;
}

export declare class MatFormField extends _MatFormFieldMixinBase implements AfterContentInit, AfterContentChecked, AfterViewInit, OnDestroy, CanColor {
    _animationsEnabled: boolean;
    _appearance: MatFormFieldAppearance;
    _connectionContainerRef: ElementRef;
    get _control(): MatFormFieldControl<any>;
    set _control(value: MatFormFieldControl<any>);
    _controlNonStatic: MatFormFieldControl<any>;
    _controlStatic: MatFormFieldControl<any>;
    _elementRef: ElementRef;
    _errorChildren: QueryList<MatError>;
    _hintChildren: QueryList<MatHint>;
    readonly _hintLabelId: string;
    _inputContainerRef: ElementRef;
    _labelChildNonStatic: MatLabel;
    _labelChildStatic: MatLabel;
    readonly _labelId: string;
    _placeholderChild: MatPlaceholder;
    _prefixChildren: QueryList<MatPrefix>;
    _subscriptAnimationState: string;
    _suffixChildren: QueryList<MatSuffix>;
    get appearance(): MatFormFieldAppearance;
    set appearance(value: MatFormFieldAppearance);
    get floatLabel(): FloatLabelType;
    set floatLabel(value: FloatLabelType);
    get hideRequiredMarker(): boolean;
    set hideRequiredMarker(value: boolean);
    get hintLabel(): string;
    set hintLabel(value: string);
    underlineRef: ElementRef;
    constructor(_elementRef: ElementRef, _changeDetectorRef: ChangeDetectorRef,
    _labelOptions: any, _dir: Directionality, _defaults: MatFormFieldDefaultOptions, _platform: Platform, _ngZone: NgZone, _animationMode: string);
    _animateAndLockLabel(): void;
    _canLabelFloat(): boolean;
    _getDisplayedMessages(): 'error' | 'hint';
    _hasFloatingLabel(): boolean;
    _hasLabel(): boolean;
    _hasPlaceholder(): boolean;
    _hideControlPlaceholder(): boolean;
    _shouldAlwaysFloat(): boolean;
    _shouldForward(prop: keyof NgControl): boolean;
    _shouldLabelFloat(): boolean;
    protected _validateControlChild(): void;
    getConnectedOverlayOrigin(): ElementRef;
    getLabelId(): string | null;
    ngAfterContentChecked(): void;
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    updateOutlineGap(): void;
    static ngAcceptInputType_hideRequiredMarker: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatFormField, "mat-form-field", ["matFormField"], { "color": "color"; "appearance": "appearance"; "hideRequiredMarker": "hideRequiredMarker"; "hintLabel": "hintLabel"; "floatLabel": "floatLabel"; }, {}, ["_controlNonStatic", "_controlStatic", "_labelChildNonStatic", "_labelChildStatic", "_placeholderChild", "_errorChildren", "_hintChildren", "_prefixChildren", "_suffixChildren"], ["[matPrefix]", "*", "mat-placeholder", "mat-label", "[matSuffix]", "mat-error", "mat-hint:not([align='end'])", "mat-hint[align='end']"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatFormField, [null, null, null, { optional: true; }, { optional: true; }, null, null, { optional: true; }]>;
}

export declare const matFormFieldAnimations: {
    readonly transitionMessages: AnimationTriggerMetadata;
};

export declare type MatFormFieldAppearance = 'legacy' | 'standard' | 'fill' | 'outline';

export declare abstract class MatFormFieldControl<T> {
    readonly autofilled?: boolean;
    readonly controlType?: string;
    readonly disabled: boolean;
    readonly empty: boolean;
    readonly errorState: boolean;
    readonly focused: boolean;
    readonly id: string;
    readonly ngControl: NgControl | null;
    readonly placeholder: string;
    readonly required: boolean;
    readonly shouldLabelFloat: boolean;
    readonly stateChanges: Observable<void>;
    readonly userAriaDescribedBy?: string;
    value: T | null;
    abstract onContainerClick(event: MouseEvent): void;
    abstract setDescribedByIds(ids: string[]): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatFormFieldControl<any>, never, never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatFormFieldControl<any>, never>;
}

export interface MatFormFieldDefaultOptions {
    appearance?: MatFormFieldAppearance;
    floatLabel?: FloatLabelType;
    hideRequiredMarker?: boolean;
}

export declare class MatFormFieldModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatFormFieldModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatFormFieldModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatFormFieldModule, [typeof i1.MatError, typeof i2.MatFormField, typeof i3.MatHint, typeof i4.MatLabel, typeof i5.MatPlaceholder, typeof i6.MatPrefix, typeof i7.MatSuffix], [typeof i8.CommonModule, typeof i9.MatCommonModule, typeof i10.ObserversModule], [typeof i9.MatCommonModule, typeof i1.MatError, typeof i2.MatFormField, typeof i3.MatHint, typeof i4.MatLabel, typeof i5.MatPlaceholder, typeof i6.MatPrefix, typeof i7.MatSuffix]>;
}

export declare class MatHint {
    align: 'start' | 'end';
    id: string;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatHint, "mat-hint", never, { "align": "align"; "id": "id"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatHint, never>;
}

export declare class MatLabel {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatLabel, "mat-label", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatLabel, never>;
}

export declare class MatPlaceholder {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatPlaceholder, "mat-placeholder", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatPlaceholder, never>;
}

export declare class MatPrefix {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatPrefix, "[matPrefix]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatPrefix, never>;
}

export declare class MatSuffix {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatSuffix, "[matSuffix]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSuffix, never>;
}
