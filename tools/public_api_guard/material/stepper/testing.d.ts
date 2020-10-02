export declare class MatStepHarness extends ContentContainerComponentHarness<string> {
    getAriaLabel(): Promise<string | null>;
    getAriaLabelledby(): Promise<string | null>;
    getLabel(): Promise<string>;
    protected getRootHarnessLoader(): Promise<HarnessLoader>;
    hasErrors(): Promise<boolean>;
    isCompleted(): Promise<boolean>;
    isOptional(): Promise<boolean>;
    isSelected(): Promise<boolean>;
    select(): Promise<void>;
    static hostSelector: string;
    static with(options?: StepHarnessFilters): HarnessPredicate<MatStepHarness>;
}

export declare class MatStepperHarness extends ComponentHarness {
    getOrientation(): Promise<StepperOrientation>;
    getSteps(filter?: StepHarnessFilters): Promise<MatStepHarness[]>;
    selectStep(filter?: StepHarnessFilters): Promise<void>;
    static hostSelector: string;
    static with(options?: StepperHarnessFilters): HarnessPredicate<MatStepperHarness>;
}

export declare class MatStepperNextHarness extends StepperButtonHarness {
    static hostSelector: string;
    static with(options?: StepperButtonHarnessFilters): HarnessPredicate<MatStepperNextHarness>;
}

export declare class MatStepperPreviousHarness extends StepperButtonHarness {
    static hostSelector: string;
    static with(options?: StepperButtonHarnessFilters): HarnessPredicate<MatStepperPreviousHarness>;
}

export interface StepHarnessFilters extends BaseHarnessFilters {
    completed?: boolean;
    invalid?: boolean;
    label?: string | RegExp;
    selected?: boolean;
}

export interface StepperButtonHarnessFilters extends BaseHarnessFilters {
    text?: string | RegExp;
}

export interface StepperHarnessFilters extends BaseHarnessFilters {
    orientation?: StepperOrientation;
}

export declare const enum StepperOrientation {
    HORIZONTAL = 0,
    VERTICAL = 1
}
