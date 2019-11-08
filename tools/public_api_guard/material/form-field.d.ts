export declare function getMatFormFieldDuplicatedHintError(align: string): Error;

export declare function getMatFormFieldMissingControlError(): Error;

export declare function getMatFormFieldPlaceholderConflictError(): Error;

export declare const MAT_FORM_FIELD_DEFAULT_OPTIONS: InjectionToken<MatFormFieldDefaultOptions>;

export declare class MatError {
    id: string;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatError, "mat-error", never, { 'id': "id" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatError>;
}

export declare class MatFormField extends _MatFormFieldMixinBase implements AfterContentInit, AfterContentChecked, AfterViewInit, OnDestroy, CanColor {
    _animationsEnabled: boolean;
    _appearance: MatFormFieldAppearance;
    readonly _canLabelFloat: boolean;
    _connectionContainerRef: ElementRef;
    _control: MatFormFieldControl<any>;
    _controlNonStatic: MatFormFieldControl<any>;
    _controlStatic: MatFormFieldControl<any>;
    _elementRef: ElementRef;
    _errorChildren: QueryList<MatError>;
    _hintChildren: QueryList<MatHint>;
    _hintLabelId: string;
    _inputContainerRef: ElementRef;
    readonly _labelChild: MatLabel;
    _labelChildNonStatic: MatLabel;
    _labelChildStatic: MatLabel;
    _labelId: string;
    _placeholderChild: MatPlaceholder;
    _prefixChildren: QueryList<MatPrefix>;
    readonly _shouldAlwaysFloat: boolean;
    _subscriptAnimationState: string;
    _suffixChildren: QueryList<MatSuffix>;
    appearance: MatFormFieldAppearance;
    floatLabel: FloatLabelType;
    hideRequiredMarker: boolean;
    hintLabel: string;
    underlineRef: ElementRef;
    constructor(_elementRef: ElementRef, _changeDetectorRef: ChangeDetectorRef, labelOptions: LabelOptions, _dir: Directionality, _defaults: MatFormFieldDefaultOptions, _platform: Platform, _ngZone: NgZone, _animationMode: string);
    _animateAndLockLabel(): void;
    _getDisplayedMessages(): 'error' | 'hint';
    _hasFloatingLabel(): boolean;
    _hasLabel(): boolean;
    _hasPlaceholder(): boolean;
    _hideControlPlaceholder(): boolean;
    _shouldForward(prop: keyof NgControl): boolean;
    _shouldLabelFloat(): boolean;
    protected _validateControlChild(): void;
    getConnectedOverlayOrigin(): ElementRef;
    ngAfterContentChecked(): void;
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    updateOutlineGap(): void;
    static ngAcceptInputType_hideRequiredMarker: boolean | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatFormField, "mat-form-field", ["matFormField"], { 'color': "color", 'appearance': "appearance", 'hideRequiredMarker': "hideRequiredMarker", 'hintLabel': "hintLabel", 'floatLabel': "floatLabel" }, {}, ["_controlNonStatic", "_controlStatic", "_labelChildNonStatic", "_labelChildStatic", "_placeholderChild", "_errorChildren", "_hintChildren", "_prefixChildren", "_suffixChildren"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatFormField>;
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
    value: T | null;
    abstract onContainerClick(event: MouseEvent): void;
    abstract setDescribedByIds(ids: string[]): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatFormFieldControl<any>, never, never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatFormFieldControl<any>>;
}

export interface MatFormFieldDefaultOptions {
    appearance?: MatFormFieldAppearance;
    hideRequiredMarker?: boolean;
}

export declare class MatFormFieldModule {
    static ɵinj: i0.ɵɵInjectorDef<MatFormFieldModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatFormFieldModule, [typeof i1.MatError, typeof i2.MatFormField, typeof i3.MatHint, typeof i4.MatLabel, typeof i5.MatPlaceholder, typeof i6.MatPrefix, typeof i7.MatSuffix], [typeof i8.CommonModule, typeof i9.ObserversModule], [typeof i1.MatError, typeof i2.MatFormField, typeof i3.MatHint, typeof i4.MatLabel, typeof i5.MatPlaceholder, typeof i6.MatPrefix, typeof i7.MatSuffix]>;
}

export declare class MatHint {
    align: 'start' | 'end';
    id: string;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatHint, "mat-hint", never, { 'align': "align", 'id': "id" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatHint>;
}

export declare class MatLabel {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatLabel, "mat-label", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatLabel>;
}

export declare class MatPlaceholder {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatPlaceholder, "mat-placeholder", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatPlaceholder>;
}

export declare class MatPrefix {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatPrefix, "[matPrefix]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatPrefix>;
}

export declare class MatSuffix {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatSuffix, "[matSuffix]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatSuffix>;
}
