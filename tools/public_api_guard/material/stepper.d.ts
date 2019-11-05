export declare const MAT_STEPPER_INTL_PROVIDER: {
    provide: typeof MatStepperIntl;
    deps: Optional[][];
    useFactory: typeof MAT_STEPPER_INTL_PROVIDER_FACTORY;
};

export declare function MAT_STEPPER_INTL_PROVIDER_FACTORY(parentIntl: MatStepperIntl): MatStepperIntl;

export declare class MatHorizontalStepper extends MatStepper {
    labelPosition: 'bottom' | 'end';
    static ngAcceptInputType_completed: boolean | string;
    static ngAcceptInputType_editable: boolean | string;
    static ngAcceptInputType_hasError: boolean | string;
    static ngAcceptInputType_linear: boolean | string;
    static ngAcceptInputType_optional: boolean | string;
    static ngAcceptInputType_selectedIndex: number | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatHorizontalStepper, "mat-horizontal-stepper", ["matHorizontalStepper"], { 'selectedIndex': "selectedIndex", 'labelPosition': "labelPosition" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatHorizontalStepper>;
}

export declare class MatStep extends CdkStep implements ErrorStateMatcher {
    stepLabel: MatStepLabel;
    constructor(stepper: MatStepper, _errorStateMatcher: ErrorStateMatcher, stepperOptions?: StepperOptions);
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean;
    static ngAcceptInputType_completed: boolean | string;
    static ngAcceptInputType_editable: boolean | string;
    static ngAcceptInputType_hasError: boolean | string;
    static ngAcceptInputType_optional: boolean | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatStep, "mat-step", ["matStep"], {}, {}, ["stepLabel"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatStep>;
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
    focus(): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatStepHeader, "mat-step-header", never, { 'state': "state", 'label': "label", 'errorMessage': "errorMessage", 'iconOverrides': "iconOverrides", 'index': "index", 'selected': "selected", 'active': "active", 'optional': "optional", 'disableRipple': "disableRipple" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatStepHeader>;
}

export declare class MatStepLabel extends CdkStepLabel {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatStepLabel, "[matStepLabel]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatStepLabel>;
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
    static ngAcceptInputType_completed: boolean | string;
    static ngAcceptInputType_editable: boolean | string;
    static ngAcceptInputType_hasError: boolean | string;
    static ngAcceptInputType_linear: boolean | string;
    static ngAcceptInputType_optional: boolean | string;
    static ngAcceptInputType_selectedIndex: number | string;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatStepper, "[matStepper]", never, { 'disableRipple': "disableRipple" }, { 'animationDone': "animationDone" }, ["_steps", "_icons"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatStepper>;
}

export declare const matStepperAnimations: {
    readonly horizontalStepTransition: AnimationTriggerMetadata;
    readonly verticalStepTransition: AnimationTriggerMetadata;
};

export declare class MatStepperIcon {
    name: StepState;
    templateRef: TemplateRef<MatStepperIconContext>;
    constructor(templateRef: TemplateRef<MatStepperIconContext>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatStepperIcon, "ng-template[matStepperIcon]", never, { 'name': "matStepperIcon" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatStepperIcon>;
}

export interface MatStepperIconContext {
    active: boolean;
    index: number;
    optional: boolean;
}

export declare class MatStepperIntl {
    readonly changes: Subject<void>;
    optionalLabel: string;
    static ɵfac: i0.ɵɵFactoryDef<MatStepperIntl>;
    static ɵprov: i0.ɵɵInjectableDef<MatStepperIntl>;
}

export declare class MatStepperModule {
    static ɵinj: i0.ɵɵInjectorDef<MatStepperModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatStepperModule, [typeof i1.MatHorizontalStepper, typeof i1.MatVerticalStepper, typeof i1.MatStep, typeof i2.MatStepLabel, typeof i1.MatStepper, typeof i3.MatStepperNext, typeof i3.MatStepperPrevious, typeof i4.MatStepHeader, typeof i5.MatStepperIcon], [typeof i6.MatCommonModule, typeof i7.CommonModule, typeof i8.PortalModule, typeof i9.MatButtonModule, typeof i10.CdkStepperModule, typeof i11.MatIconModule, typeof i6.MatRippleModule], [typeof i6.MatCommonModule, typeof i1.MatHorizontalStepper, typeof i1.MatVerticalStepper, typeof i1.MatStep, typeof i2.MatStepLabel, typeof i1.MatStepper, typeof i3.MatStepperNext, typeof i3.MatStepperPrevious, typeof i4.MatStepHeader, typeof i5.MatStepperIcon]>;
}

export declare class MatStepperNext extends CdkStepperNext {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatStepperNext, "button[matStepperNext]", never, { 'type': "type" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatStepperNext>;
}

export declare class MatStepperPrevious extends CdkStepperPrevious {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatStepperPrevious, "button[matStepperPrevious]", never, { 'type': "type" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatStepperPrevious>;
}

export declare class MatVerticalStepper extends MatStepper {
    constructor(dir: Directionality, changeDetectorRef: ChangeDetectorRef, elementRef?: ElementRef<HTMLElement>, _document?: any);
    static ngAcceptInputType_completed: boolean | string;
    static ngAcceptInputType_editable: boolean | string;
    static ngAcceptInputType_hasError: boolean | string;
    static ngAcceptInputType_linear: boolean | string;
    static ngAcceptInputType_optional: boolean | string;
    static ngAcceptInputType_selectedIndex: number | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatVerticalStepper, "mat-vertical-stepper", ["matVerticalStepper"], { 'selectedIndex': "selectedIndex" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatVerticalStepper>;
}
