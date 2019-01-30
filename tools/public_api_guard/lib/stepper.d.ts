export declare const MAT_STEPPER_INTL_PROVIDER: {
    provide: typeof MatStepperIntl;
    deps: Optional[][];
    useFactory: typeof MAT_STEPPER_INTL_PROVIDER_FACTORY;
};

export declare function MAT_STEPPER_INTL_PROVIDER_FACTORY(parentIntl: MatStepperIntl): MatStepperIntl;

export declare class MatHorizontalStepper extends MatStepper {
    labelPosition: 'bottom' | 'end';
}

export declare class MatStep extends CdkStep implements ErrorStateMatcher {
    stepLabel: MatStepLabel;
    constructor(stepper: MatStepper, _errorStateMatcher: ErrorStateMatcher, stepperOptions?: StepperOptions);
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean;
}

export declare class MatStepHeader extends CdkStepHeader implements OnDestroy {
    _intl: MatStepperIntl;
    active: boolean;
    disableRipple: boolean;
    errorMessage: string;
    iconOverrides: {
        [key: string]: TemplateRef<MatStepperIconContext>;
    };
    index: number;
    label: MatStepLabel | string;
    optional: boolean;
    selected: boolean;
    state: StepState;
    constructor(_intl: MatStepperIntl, _focusMonitor: FocusMonitor, _elementRef: ElementRef<HTMLElement>, changeDetectorRef: ChangeDetectorRef);
    _getDefaultTextForState(state: StepState): string;
    _getHostElement(): HTMLElement;
    _getIconContext(): MatStepperIconContext;
    _stringLabel(): string | null;
    _templateLabel(): MatStepLabel | null;
    ngOnDestroy(): void;
}

export declare class MatStepLabel extends CdkStepLabel {
}

export declare class MatStepper extends CdkStepper implements AfterContentInit {
    _animationDone: Subject<AnimationEvent>;
    _iconOverrides: {
        [key: string]: TemplateRef<MatStepperIconContext>;
    };
    _icons: QueryList<MatStepperIcon>;
    _stepHeader: QueryList<MatStepHeader>;
    _steps: QueryList<MatStep>;
    readonly animationDone: EventEmitter<void>;
    disableRipple: boolean;
    ngAfterContentInit(): void;
}

export declare const matStepperAnimations: {
    readonly horizontalStepTransition: AnimationTriggerMetadata;
    readonly verticalStepTransition: AnimationTriggerMetadata;
};

export declare class MatStepperIcon {
    name: StepState;
    templateRef: TemplateRef<MatStepperIconContext>;
    constructor(templateRef: TemplateRef<MatStepperIconContext>);
}

export interface MatStepperIconContext {
    active: boolean;
    index: number;
    optional: boolean;
}

export declare class MatStepperIntl {
    readonly changes: Subject<void>;
    optionalLabel: string;
}

export declare class MatStepperModule {
}

export declare class MatStepperNext extends CdkStepperNext {
}

export declare class MatStepperPrevious extends CdkStepperPrevious {
}

export declare class MatVerticalStepper extends MatStepper {
    constructor(dir: Directionality, changeDetectorRef: ChangeDetectorRef, elementRef?: ElementRef<HTMLElement>, _document?: any);
}
