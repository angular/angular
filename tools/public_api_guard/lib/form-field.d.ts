export declare const _MatFormFieldMixinBase: CanColorCtor & typeof MatFormFieldBase;

export declare function getMatFormFieldDuplicatedHintError(align: string): Error;

export declare function getMatFormFieldMissingControlError(): Error;

export declare function getMatFormFieldPlaceholderConflictError(): Error;

export declare const MAT_FORM_FIELD_DEFAULT_OPTIONS: InjectionToken<MatFormFieldDefaultOptions>;

export declare class MatError {
    id: string;
}

export declare class MatFormField extends _MatFormFieldMixinBase implements AfterContentInit, AfterContentChecked, AfterViewInit, OnDestroy, CanColor {
    _animationsEnabled: boolean;
    _appearance: MatFormFieldAppearance;
    readonly _canLabelFloat: boolean;
    _connectionContainerRef: ElementRef;
    _control: MatFormFieldControl<any>;
    _elementRef: ElementRef;
    _errorChildren: QueryList<MatError>;
    _hintChildren: QueryList<MatHint>;
    _hintLabelId: string;
    _inputContainerRef: ElementRef;
    _labelChild: MatLabel;
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
    constructor(_elementRef: ElementRef, _changeDetectorRef: ChangeDetectorRef, labelOptions: LabelOptions, _dir: Directionality, _defaults: MatFormFieldDefaultOptions, _platform?: Platform | undefined, _ngZone?: NgZone | undefined, _animationMode?: string);
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
}

export declare const matFormFieldAnimations: {
    readonly transitionMessages: AnimationTriggerMetadata;
};

export declare type MatFormFieldAppearance = 'legacy' | 'standard' | 'fill' | 'outline';

export declare class MatFormFieldBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}

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
}

export interface MatFormFieldDefaultOptions {
    appearance?: MatFormFieldAppearance;
}

export declare class MatFormFieldModule {
}

export declare class MatHint {
    align: 'start' | 'end';
    id: string;
}

export declare class MatLabel {
}

export declare class MatPlaceholder {
}

export declare class MatPrefix {
}

export declare class MatSuffix {
}
