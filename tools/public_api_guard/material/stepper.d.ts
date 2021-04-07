export declare const MAT_STEPPER_INTL_PROVIDER: {
    provide: typeof MatStepperIntl;
    deps: Optional[][];
    useFactory: typeof MAT_STEPPER_INTL_PROVIDER_FACTORY;
};

export declare function MAT_STEPPER_INTL_PROVIDER_FACTORY(parentIntl: MatStepperIntl): MatStepperIntl;

export declare class MatHorizontalStepper extends _MatProxyStepperBase {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatHorizontalStepper, "mat-horizontal-stepper", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatHorizontalStepper, never>;
}

export declare class MatStep extends CdkStep implements ErrorStateMatcher, AfterContentInit, OnDestroy {
    _lazyContent: MatStepContent;
    _portal: TemplatePortal;
    color: ThemePalette;
    stepLabel: MatStepLabel;
    constructor(stepper: MatStepper, _errorStateMatcher: ErrorStateMatcher, _viewContainerRef: ViewContainerRef, stepperOptions?: StepperOptions);
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatStep, "mat-step", ["matStep"], { "color": "color"; }, {}, ["stepLabel", "_lazyContent"], ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatStep, [null, { skipSelf: true; }, null, { optional: true; }]>;
}

export declare class MatStepContent {
    _template: TemplateRef<any>;
    constructor(_template: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatStepContent, "ng-template[matStepContent]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatStepContent, never>;
}

export declare class MatStepHeader extends _MatStepHeaderMixinBase implements AfterViewInit, OnDestroy, CanColor {
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
    focus(origin?: FocusOrigin, options?: FocusOptions): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatStepHeader, "mat-step-header", never, { "color": "color"; "state": "state"; "label": "label"; "errorMessage": "errorMessage"; "iconOverrides": "iconOverrides"; "index": "index"; "selected": "selected"; "active": "active"; "optional": "optional"; "disableRipple": "disableRipple"; }, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatStepHeader, never>;
}

export declare class MatStepLabel extends CdkStepLabel {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatStepLabel, "[matStepLabel]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatStepLabel, never>;
}

export declare class MatStepper extends CdkStepper implements AfterContentInit {
    _animationDone: Subject<AnimationEvent>;
    _iconOverrides: Record<string, TemplateRef<MatStepperIconContext>>;
    _icons: QueryList<MatStepperIcon>;
    _stepHeader: QueryList<MatStepHeader>;
    _steps: QueryList<MatStep>;
    readonly animationDone: EventEmitter<void>;
    color: ThemePalette;
    disableRipple: boolean;
    labelPosition: 'bottom' | 'end';
    readonly steps: QueryList<MatStep>;
    constructor(dir: Directionality, changeDetectorRef: ChangeDetectorRef, elementRef: ElementRef<HTMLElement>, _document: any);
    ngAfterContentInit(): void;
    static ngAcceptInputType_completed: BooleanInput;
    static ngAcceptInputType_editable: BooleanInput;
    static ngAcceptInputType_hasError: BooleanInput;
    static ngAcceptInputType_optional: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatStepper, "mat-stepper, mat-vertical-stepper, mat-horizontal-stepper, [matStepper]", ["matStepper", "matVerticalStepper", "matHorizontalStepper"], { "selectedIndex": "selectedIndex"; "disableRipple": "disableRipple"; "color": "color"; "labelPosition": "labelPosition"; }, { "animationDone": "animationDone"; }, ["_steps", "_icons"], never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatStepper, [{ optional: true; }, null, null, null]>;
}

export declare const matStepperAnimations: {
    readonly horizontalStepTransition: AnimationTriggerMetadata;
    readonly verticalStepTransition: AnimationTriggerMetadata;
};

export declare class MatStepperIcon {
    name: StepState;
    templateRef: TemplateRef<MatStepperIconContext>;
    constructor(templateRef: TemplateRef<MatStepperIconContext>);
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatStepperIcon, "ng-template[matStepperIcon]", never, { "name": "matStepperIcon"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatStepperIcon, never>;
}

export interface MatStepperIconContext {
    active: boolean;
    index: number;
    optional: boolean;
}

export declare class MatStepperIntl {
    readonly changes: Subject<void>;
    optionalLabel: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatStepperIntl, never>;
    static ɵprov: i0.ɵɵInjectableDef<MatStepperIntl>;
}

export declare class MatStepperModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatStepperModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatStepperModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatStepperModule, [typeof i1.MatHorizontalStepper, typeof i1.MatVerticalStepper, typeof i1.MatStep, typeof i2.MatStepLabel, typeof i1.MatStepper, typeof i3.MatStepperNext, typeof i3.MatStepperPrevious, typeof i4.MatStepHeader, typeof i5.MatStepperIcon, typeof i6.MatStepContent], [typeof i7.MatCommonModule, typeof i8.CommonModule, typeof i9.PortalModule, typeof i10.MatButtonModule, typeof i11.CdkStepperModule, typeof i12.MatIconModule, typeof i7.MatRippleModule], [typeof i7.MatCommonModule, typeof i1.MatStep, typeof i2.MatStepLabel, typeof i1.MatStepper, typeof i3.MatStepperNext, typeof i3.MatStepperPrevious, typeof i4.MatStepHeader, typeof i5.MatStepperIcon, typeof i6.MatStepContent]>;
}

export declare class MatStepperNext extends CdkStepperNext {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatStepperNext, "button[matStepperNext]", never, { "type": "type"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatStepperNext, never>;
}

export declare class MatStepperPrevious extends CdkStepperPrevious {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatStepperPrevious, "button[matStepperPrevious]", never, { "type": "type"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatStepperPrevious, never>;
}

export declare class MatVerticalStepper extends _MatProxyStepperBase {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatVerticalStepper, "mat-vertical-stepper", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatVerticalStepper, never>;
}
