export declare class CdkStep implements OnChanges {
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
    stepControl: {
        valid: boolean;
        invalid: boolean;
        pending: boolean;
        reset: () => void;
    };
    stepLabel: CdkStepLabel;
    constructor(_stepper: CdkStepper, stepperOptions?: StepperOptions);
    ngOnChanges(): void;
    reset(): void;
    select(): void;
}

export declare class CdkStepHeader implements FocusableOption {
    protected _elementRef: ElementRef<HTMLElement>;
    constructor(_elementRef: ElementRef<HTMLElement>);
    focus(): void;
}

export declare class CdkStepLabel {
    template: TemplateRef<any>;
    constructor(/** @docs-private */ template: TemplateRef<any>);
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
}

export declare class CdkStepperModule {
}

export declare class CdkStepperNext {
    _stepper: CdkStepper;
    type: string;
    constructor(_stepper: CdkStepper);
    _handleClick(): void;
}

export declare class CdkStepperPrevious {
    _stepper: CdkStepper;
    type: string;
    constructor(_stepper: CdkStepper);
    _handleClick(): void;
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
