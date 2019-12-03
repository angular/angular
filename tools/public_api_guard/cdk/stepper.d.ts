export declare class CdkStep implements OnChanges {
    _completedOverride: boolean | null;
    _displayDefaultIndicatorType: boolean;
    _showError: boolean;
    ariaLabel: string;
    ariaLabelledby: string;
    completed: boolean;
    content: TemplateRef<any>;
    editable: boolean;
    errorMessage: string;
    hasError: boolean;
    interacted: boolean;
    label: string;
    optional: boolean;
    state: StepState;
    stepControl: AbstractControlLike;
    stepLabel: CdkStepLabel;
    constructor(_stepper: CdkStepper, stepperOptions?: StepperOptions);
    ngOnChanges(): void;
    reset(): void;
    select(): void;
    static ngAcceptInputType_completed: boolean | string | null | undefined;
    static ngAcceptInputType_editable: boolean | string | null | undefined;
    static ngAcceptInputType_hasError: boolean | string | null | undefined;
    static ngAcceptInputType_optional: boolean | string | null | undefined;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<CdkStep, "cdk-step", ["cdkStep"], { 'stepControl': "stepControl", 'label': "label", 'errorMessage': "errorMessage", 'ariaLabel': "aria-label", 'ariaLabelledby': "aria-labelledby", 'state': "state", 'editable': "editable", 'optional': "optional", 'completed': "completed", 'hasError': "hasError" }, {}, ["stepLabel"]>;
    static ɵfac: i0.ɵɵFactoryDef<CdkStep>;
}

export declare class CdkStepHeader implements FocusableOption {
    protected _elementRef: ElementRef<HTMLElement>;
    constructor(_elementRef: ElementRef<HTMLElement>);
    focus(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkStepHeader, "[cdkStepHeader]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkStepHeader>;
}

export declare class CdkStepLabel {
    template: TemplateRef<any>;
    constructor(/** @docs-private */ template: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkStepLabel, "[cdkStepLabel]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkStepLabel>;
}

export declare class CdkStepper implements AfterViewInit, OnDestroy {
    protected _destroyed: Subject<void>;
    _groupId: number;
    protected _orientation: StepperOrientation;
    _stepHeader: QueryList<FocusableOption>;
    _steps: QueryList<CdkStep>;
    linear: boolean;
    selected: CdkStep;
    selectedIndex: number;
    selectionChange: EventEmitter<StepperSelectionEvent>;
    readonly steps: QueryList<CdkStep>;
    constructor(_dir: Directionality, _changeDetectorRef: ChangeDetectorRef, _elementRef?: ElementRef<HTMLElement> | undefined, _document?: any);
    _getAnimationDirection(index: number): StepContentPositionState;
    _getFocusIndex(): number | null;
    _getIndicatorType(index: number, state?: StepState): StepState;
    _getStepContentId(i: number): string;
    _getStepLabelId(i: number): string;
    _onKeydown(event: KeyboardEvent): void;
    _stateChanged(): void;
    next(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    previous(): void;
    reset(): void;
    static ngAcceptInputType_completed: boolean | string | null | undefined;
    static ngAcceptInputType_editable: boolean | string | null | undefined;
    static ngAcceptInputType_hasError: boolean | string | null | undefined;
    static ngAcceptInputType_linear: boolean | string | null | undefined;
    static ngAcceptInputType_optional: boolean | string | null | undefined;
    static ngAcceptInputType_selectedIndex: number | string | null | undefined;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkStepper, "[cdkStepper]", ["cdkStepper"], { 'linear': "linear", 'selectedIndex': "selectedIndex", 'selected': "selected" }, { 'selectionChange': "selectionChange" }, ["_steps", "_stepHeader"]>;
    static ɵfac: i0.ɵɵFactoryDef<CdkStepper>;
}

export declare class CdkStepperModule {
    static ɵinj: i0.ɵɵInjectorDef<CdkStepperModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<CdkStepperModule, [typeof i1.CdkStep, typeof i1.CdkStepper, typeof i2.CdkStepHeader, typeof i3.CdkStepLabel, typeof i4.CdkStepperNext, typeof i4.CdkStepperPrevious], [typeof i5.BidiModule, typeof i6.CommonModule], [typeof i1.CdkStep, typeof i1.CdkStepper, typeof i2.CdkStepHeader, typeof i3.CdkStepLabel, typeof i4.CdkStepperNext, typeof i4.CdkStepperPrevious]>;
}

export declare class CdkStepperNext {
    _stepper: CdkStepper;
    type: string;
    constructor(_stepper: CdkStepper);
    _handleClick(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkStepperNext, "button[cdkStepperNext]", never, { 'type': "type" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkStepperNext>;
}

export declare class CdkStepperPrevious {
    _stepper: CdkStepper;
    type: string;
    constructor(_stepper: CdkStepper);
    _handleClick(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkStepperPrevious, "button[cdkStepperPrevious]", never, { 'type': "type" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkStepperPrevious>;
}

export declare const MAT_STEPPER_GLOBAL_OPTIONS: InjectionToken<StepperOptions>;

export declare const STEP_STATE: {
    NUMBER: string;
    EDIT: string;
    DONE: string;
    ERROR: string;
};

export declare type StepContentPositionState = 'previous' | 'current' | 'next';

export declare const STEPPER_GLOBAL_OPTIONS: InjectionToken<StepperOptions>;

export interface StepperOptions {
    displayDefaultIndicatorType?: boolean;
    showError?: boolean;
}

export declare type StepperOrientation = 'horizontal' | 'vertical';

export declare class StepperSelectionEvent {
    previouslySelectedIndex: number;
    previouslySelectedStep: CdkStep;
    selectedIndex: number;
    selectedStep: CdkStep;
}

export declare type StepState = 'number' | 'edit' | 'done' | 'error' | string;
