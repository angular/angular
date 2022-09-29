/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusableOption, FocusKeyManager} from '@angular/cdk/a11y';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {
  BooleanInput,
  coerceBooleanProperty,
  coerceNumberProperty,
  NumberInput,
} from '@angular/cdk/coercion';
import {ENTER, hasModifierKey, SPACE} from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  AfterContentInit,
} from '@angular/core';
import {_getFocusedElementPierceShadowDom} from '@angular/cdk/platform';
import {Observable, of as observableOf, Subject} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';

import {CdkStepHeader} from './step-header';
import {CdkStepLabel} from './step-label';

/** Used to generate unique ID for each stepper component. */
let nextId = 0;

/**
 * Position state of the content of each step in stepper that is used for transitioning
 * the content into correct position upon step selection change.
 */
export type StepContentPositionState = 'previous' | 'current' | 'next';

/** Possible orientation of a stepper. */
export type StepperOrientation = 'horizontal' | 'vertical';

/** Change event emitted on selection changes. */
export class StepperSelectionEvent {
  /** Index of the step now selected. */
  selectedIndex: number;

  /** Index of the step previously selected. */
  previouslySelectedIndex: number;

  /** The step instance now selected. */
  selectedStep: CdkStep;

  /** The step instance previously selected. */
  previouslySelectedStep: CdkStep;
}

/** The state of each step. */
export type StepState = 'number' | 'edit' | 'done' | 'error' | string;

/** Enum to represent the different states of the steps. */
export const STEP_STATE = {
  NUMBER: 'number',
  EDIT: 'edit',
  DONE: 'done',
  ERROR: 'error',
};

/** InjectionToken that can be used to specify the global stepper options. */
export const STEPPER_GLOBAL_OPTIONS = new InjectionToken<StepperOptions>('STEPPER_GLOBAL_OPTIONS');

/** Configurable options for stepper. */
export interface StepperOptions {
  /**
   * Whether the stepper should display an error state or not.
   * Default behavior is assumed to be false.
   */
  showError?: boolean;

  /**
   * Whether the stepper should display the default indicator type
   * or not.
   * Default behavior is assumed to be true.
   */
  displayDefaultIndicatorType?: boolean;
}

@Component({
  selector: 'cdk-step',
  exportAs: 'cdkStep',
  template: '<ng-template><ng-content></ng-content></ng-template>',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkStep implements OnChanges {
  private _stepperOptions: StepperOptions;
  _displayDefaultIndicatorType: boolean;

  /** Template for step label if it exists. */
  @ContentChild(CdkStepLabel) stepLabel: CdkStepLabel;

  /** Template for step content. */
  @ViewChild(TemplateRef, {static: true}) content: TemplateRef<any>;

  /** The top level abstract control of the step. */
  @Input() stepControl: AbstractControlLike;

  /** Whether user has attempted to move away from the step. */
  interacted = false;

  /** Emits when the user has attempted to move away from the step. */
  @Output('interacted')
  readonly interactedStream: EventEmitter<CdkStep> = new EventEmitter<CdkStep>();

  /** Plain text label of the step. */
  @Input() label: string;

  /** Error message to display when there's an error. */
  @Input() errorMessage: string;

  /** Aria label for the tab. */
  @Input('aria-label') ariaLabel: string;

  /**
   * Reference to the element that the tab is labelled by.
   * Will be cleared if `aria-label` is set at the same time.
   */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** State of the step. */
  @Input() state: StepState;

  /** Whether the user can return to this step once it has been marked as completed. */
  @Input()
  get editable(): boolean {
    return this._editable;
  }
  set editable(value: BooleanInput) {
    this._editable = coerceBooleanProperty(value);
  }
  private _editable = true;

  /** Whether the completion of step is optional. */
  @Input()
  get optional(): boolean {
    return this._optional;
  }
  set optional(value: BooleanInput) {
    this._optional = coerceBooleanProperty(value);
  }
  private _optional = false;

  /** Whether step is marked as completed. */
  @Input()
  get completed(): boolean {
    return this._completedOverride == null ? this._getDefaultCompleted() : this._completedOverride;
  }
  set completed(value: BooleanInput) {
    this._completedOverride = coerceBooleanProperty(value);
  }
  _completedOverride: boolean | null = null;

  private _getDefaultCompleted() {
    return this.stepControl ? this.stepControl.valid && this.interacted : this.interacted;
  }

  /** Whether step has an error. */
  @Input()
  get hasError(): boolean {
    return this._customError == null ? this._getDefaultError() : this._customError;
  }
  set hasError(value: BooleanInput) {
    this._customError = coerceBooleanProperty(value);
  }
  private _customError: boolean | null = null;

  private _getDefaultError() {
    return this.stepControl && this.stepControl.invalid && this.interacted;
  }

  constructor(
    @Inject(forwardRef(() => CdkStepper)) public _stepper: CdkStepper,
    @Optional() @Inject(STEPPER_GLOBAL_OPTIONS) stepperOptions?: StepperOptions,
  ) {
    this._stepperOptions = stepperOptions ? stepperOptions : {};
    this._displayDefaultIndicatorType = this._stepperOptions.displayDefaultIndicatorType !== false;
  }

  /** Selects this step component. */
  select(): void {
    this._stepper.selected = this;
  }

  /** Resets the step to its initial state. Note that this includes resetting form data. */
  reset(): void {
    this.interacted = false;

    if (this._completedOverride != null) {
      this._completedOverride = false;
    }

    if (this._customError != null) {
      this._customError = false;
    }

    if (this.stepControl) {
      this.stepControl.reset();
    }
  }

  ngOnChanges() {
    // Since basically all inputs of the MatStep get proxied through the view down to the
    // underlying MatStepHeader, we have to make sure that change detection runs correctly.
    this._stepper._stateChanged();
  }

  _markAsInteracted() {
    if (!this.interacted) {
      this.interacted = true;
      this.interactedStream.emit(this);
    }
  }

  /** Determines whether the error state can be shown. */
  _showError(): boolean {
    // We want to show the error state either if the user opted into/out of it using the
    // global options, or if they've explicitly set it through the `hasError` input.
    return this._stepperOptions.showError ?? this._customError != null;
  }
}

@Directive({
  selector: '[cdkStepper]',
  exportAs: 'cdkStepper',
})
export class CdkStepper implements AfterContentInit, AfterViewInit, OnDestroy {
  /** Emits when the component is destroyed. */
  protected readonly _destroyed = new Subject<void>();

  /** Used for managing keyboard focus. */
  private _keyManager: FocusKeyManager<FocusableOption>;

  /** Full list of steps inside the stepper, including inside nested steppers. */
  @ContentChildren(CdkStep, {descendants: true}) _steps: QueryList<CdkStep>;

  /** Steps that belong to the current stepper, excluding ones from nested steppers. */
  readonly steps: QueryList<CdkStep> = new QueryList<CdkStep>();

  /** The list of step headers of the steps in the stepper. */
  @ContentChildren(CdkStepHeader, {descendants: true}) _stepHeader: QueryList<CdkStepHeader>;

  /** List of step headers sorted based on their DOM order. */
  private _sortedHeaders = new QueryList<CdkStepHeader>();

  /** Whether the validity of previous steps should be checked or not. */
  @Input()
  get linear(): boolean {
    return this._linear;
  }
  set linear(value: BooleanInput) {
    this._linear = coerceBooleanProperty(value);
  }
  private _linear = false;

  /** The index of the selected step. */
  @Input()
  get selectedIndex(): number {
    return this._selectedIndex;
  }
  set selectedIndex(index: NumberInput) {
    const newIndex = coerceNumberProperty(index);

    if (this.steps && this._steps) {
      // Ensure that the index can't be out of bounds.
      if (!this._isValidIndex(newIndex) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throw Error('cdkStepper: Cannot assign out-of-bounds value to `selectedIndex`.');
      }

      this.selected?._markAsInteracted();

      if (
        this._selectedIndex !== newIndex &&
        !this._anyControlsInvalidOrPending(newIndex) &&
        (newIndex >= this._selectedIndex || this.steps.toArray()[newIndex].editable)
      ) {
        this._updateSelectedItemIndex(newIndex);
      }
    } else {
      this._selectedIndex = newIndex;
    }
  }
  private _selectedIndex = 0;

  /** The step that is selected. */
  @Input()
  get selected(): CdkStep | undefined {
    return this.steps ? this.steps.toArray()[this.selectedIndex] : undefined;
  }
  set selected(step: CdkStep | undefined) {
    this.selectedIndex = step && this.steps ? this.steps.toArray().indexOf(step) : -1;
  }

  /** Event emitted when the selected step has changed. */
  @Output() readonly selectionChange = new EventEmitter<StepperSelectionEvent>();

  /** Used to track unique ID for each stepper component. */
  _groupId: number;

  /** Orientation of the stepper. */
  @Input()
  get orientation(): StepperOrientation {
    return this._orientation;
  }
  set orientation(value: StepperOrientation) {
    // This is a protected method so that `MatStepper` can hook into it.
    this._orientation = value;

    if (this._keyManager) {
      this._keyManager.withVerticalOrientation(value === 'vertical');
    }
  }
  private _orientation: StepperOrientation = 'horizontal';

  constructor(
    @Optional() private _dir: Directionality,
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef<HTMLElement>,
  ) {
    this._groupId = nextId++;
  }

  ngAfterContentInit() {
    this._steps.changes
      .pipe(startWith(this._steps), takeUntil(this._destroyed))
      .subscribe((steps: QueryList<CdkStep>) => {
        this.steps.reset(steps.filter(step => step._stepper === this));
        this.steps.notifyOnChanges();
      });
  }

  ngAfterViewInit() {
    // If the step headers are defined outside of the `ngFor` that renders the steps, like in the
    // Material stepper, they won't appear in the `QueryList` in the same order as they're
    // rendered in the DOM which will lead to incorrect keyboard navigation. We need to sort
    // them manually to ensure that they're correct. Alternatively, we can change the Material
    // template to inline the headers in the `ngFor`, but that'll result in a lot of
    // code duplication. See #23539.
    this._stepHeader.changes
      .pipe(startWith(this._stepHeader), takeUntil(this._destroyed))
      .subscribe((headers: QueryList<CdkStepHeader>) => {
        this._sortedHeaders.reset(
          headers.toArray().sort((a, b) => {
            const documentPosition = a._elementRef.nativeElement.compareDocumentPosition(
              b._elementRef.nativeElement,
            );

            // `compareDocumentPosition` returns a bitmask so we have to use a bitwise operator.
            // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
            // tslint:disable-next-line:no-bitwise
            return documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
          }),
        );
        this._sortedHeaders.notifyOnChanges();
      });

    // Note that while the step headers are content children by default, any components that
    // extend this one might have them as view children. We initialize the keyboard handling in
    // AfterViewInit so we're guaranteed for both view and content children to be defined.
    this._keyManager = new FocusKeyManager<FocusableOption>(this._sortedHeaders)
      .withWrap()
      .withHomeAndEnd()
      .withVerticalOrientation(this._orientation === 'vertical');

    (this._dir ? (this._dir.change as Observable<Direction>) : observableOf<Direction>())
      .pipe(startWith(this._layoutDirection()), takeUntil(this._destroyed))
      .subscribe(direction => this._keyManager.withHorizontalOrientation(direction));

    this._keyManager.updateActiveItem(this._selectedIndex);

    // No need to `takeUntil` here, because we're the ones destroying `steps`.
    this.steps.changes.subscribe(() => {
      if (!this.selected) {
        this._selectedIndex = Math.max(this._selectedIndex - 1, 0);
      }
    });

    // The logic which asserts that the selected index is within bounds doesn't run before the
    // steps are initialized, because we don't how many steps there are yet so we may have an
    // invalid index on init. If that's the case, auto-correct to the default so we don't throw.
    if (!this._isValidIndex(this._selectedIndex)) {
      this._selectedIndex = 0;
    }
  }

  ngOnDestroy() {
    this._keyManager?.destroy();
    this.steps.destroy();
    this._sortedHeaders.destroy();
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Selects and focuses the next step in list. */
  next(): void {
    this.selectedIndex = Math.min(this._selectedIndex + 1, this.steps.length - 1);
  }

  /** Selects and focuses the previous step in list. */
  previous(): void {
    this.selectedIndex = Math.max(this._selectedIndex - 1, 0);
  }

  /** Resets the stepper to its initial state. Note that this includes clearing form data. */
  reset(): void {
    this._updateSelectedItemIndex(0);
    this.steps.forEach(step => step.reset());
    this._stateChanged();
  }

  /** Returns a unique id for each step label element. */
  _getStepLabelId(i: number): string {
    return `cdk-step-label-${this._groupId}-${i}`;
  }

  /** Returns unique id for each step content element. */
  _getStepContentId(i: number): string {
    return `cdk-step-content-${this._groupId}-${i}`;
  }

  /** Marks the component to be change detected. */
  _stateChanged() {
    this._changeDetectorRef.markForCheck();
  }

  /** Returns position state of the step with the given index. */
  _getAnimationDirection(index: number): StepContentPositionState {
    const position = index - this._selectedIndex;
    if (position < 0) {
      return this._layoutDirection() === 'rtl' ? 'next' : 'previous';
    } else if (position > 0) {
      return this._layoutDirection() === 'rtl' ? 'previous' : 'next';
    }
    return 'current';
  }

  /** Returns the type of icon to be displayed. */
  _getIndicatorType(index: number, state: StepState = STEP_STATE.NUMBER): StepState {
    const step = this.steps.toArray()[index];
    const isCurrentStep = this._isCurrentStep(index);

    return step._displayDefaultIndicatorType
      ? this._getDefaultIndicatorLogic(step, isCurrentStep)
      : this._getGuidelineLogic(step, isCurrentStep, state);
  }

  private _getDefaultIndicatorLogic(step: CdkStep, isCurrentStep: boolean): StepState {
    if (step._showError() && step.hasError && !isCurrentStep) {
      return STEP_STATE.ERROR;
    } else if (!step.completed || isCurrentStep) {
      return STEP_STATE.NUMBER;
    } else {
      return step.editable ? STEP_STATE.EDIT : STEP_STATE.DONE;
    }
  }

  private _getGuidelineLogic(
    step: CdkStep,
    isCurrentStep: boolean,
    state: StepState = STEP_STATE.NUMBER,
  ): StepState {
    if (step._showError() && step.hasError && !isCurrentStep) {
      return STEP_STATE.ERROR;
    } else if (step.completed && !isCurrentStep) {
      return STEP_STATE.DONE;
    } else if (step.completed && isCurrentStep) {
      return state;
    } else if (step.editable && isCurrentStep) {
      return STEP_STATE.EDIT;
    } else {
      return state;
    }
  }

  private _isCurrentStep(index: number) {
    return this._selectedIndex === index;
  }

  /** Returns the index of the currently-focused step header. */
  _getFocusIndex() {
    return this._keyManager ? this._keyManager.activeItemIndex : this._selectedIndex;
  }

  private _updateSelectedItemIndex(newIndex: number): void {
    const stepsArray = this.steps.toArray();
    this.selectionChange.emit({
      selectedIndex: newIndex,
      previouslySelectedIndex: this._selectedIndex,
      selectedStep: stepsArray[newIndex],
      previouslySelectedStep: stepsArray[this._selectedIndex],
    });

    // If focus is inside the stepper, move it to the next header, otherwise it may become
    // lost when the active step content is hidden. We can't be more granular with the check
    // (e.g. checking whether focus is inside the active step), because we don't have a
    // reference to the elements that are rendering out the content.
    this._containsFocus()
      ? this._keyManager.setActiveItem(newIndex)
      : this._keyManager.updateActiveItem(newIndex);

    this._selectedIndex = newIndex;
    this._stateChanged();
  }

  _onKeydown(event: KeyboardEvent) {
    const hasModifier = hasModifierKey(event);
    const keyCode = event.keyCode;
    const manager = this._keyManager;

    if (
      manager.activeItemIndex != null &&
      !hasModifier &&
      (keyCode === SPACE || keyCode === ENTER)
    ) {
      this.selectedIndex = manager.activeItemIndex;
      event.preventDefault();
    } else {
      manager.onKeydown(event);
    }
  }

  private _anyControlsInvalidOrPending(index: number): boolean {
    if (this._linear && index >= 0) {
      return this.steps
        .toArray()
        .slice(0, index)
        .some(step => {
          const control = step.stepControl;
          const isIncomplete = control
            ? control.invalid || control.pending || !step.interacted
            : !step.completed;
          return isIncomplete && !step.optional && !step._completedOverride;
        });
    }

    return false;
  }

  private _layoutDirection(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Checks whether the stepper contains the focused element. */
  private _containsFocus(): boolean {
    const stepperElement = this._elementRef.nativeElement;
    const focusedElement = _getFocusedElementPierceShadowDom();
    return stepperElement === focusedElement || stepperElement.contains(focusedElement);
  }

  /** Checks whether the passed-in index is a valid step index. */
  private _isValidIndex(index: number): boolean {
    return index > -1 && (!this.steps || index < this.steps.length);
  }
}

/**
 * Simplified representation of an "AbstractControl" from @angular/forms.
 * Used to avoid having to bring in @angular/forms for a single optional interface.
 * @docs-private
 */
interface AbstractControlLike {
  asyncValidator: ((control: any) => any) | null;
  dirty: boolean;
  disabled: boolean;
  enabled: boolean;
  errors: {[key: string]: any} | null;
  invalid: boolean;
  parent: any;
  pending: boolean;
  pristine: boolean;
  root: AbstractControlLike;
  status: string;
  readonly statusChanges: Observable<any>;
  touched: boolean;
  untouched: boolean;
  updateOn: any;
  valid: boolean;
  validator: ((control: any) => any) | null;
  value: any;
  readonly valueChanges: Observable<any>;
  clearAsyncValidators(): void;
  clearValidators(): void;
  disable(opts?: any): void;
  enable(opts?: any): void;
  get(path: (string | number)[] | string): AbstractControlLike | null;
  getError(errorCode: string, path?: (string | number)[] | string): any;
  hasError(errorCode: string, path?: (string | number)[] | string): boolean;
  markAllAsTouched(): void;
  markAsDirty(opts?: any): void;
  markAsPending(opts?: any): void;
  markAsPristine(opts?: any): void;
  markAsTouched(opts?: any): void;
  markAsUntouched(opts?: any): void;
  patchValue(value: any, options?: Object): void;
  reset(value?: any, options?: Object): void;
  setAsyncValidators(newValidator: (control: any) => any | ((control: any) => any)[] | null): void;
  setErrors(errors: {[key: string]: any} | null, opts?: any): void;
  setParent(parent: any): void;
  setValidators(newValidator: (control: any) => any | ((control: any) => any)[] | null): void;
  setValue(value: any, options?: Object): void;
  updateValueAndValidity(opts?: any): void;
  patchValue(value: any, options?: any): void;
  reset(formState?: any, options?: any): void;
  setValue(value: any, options?: any): void;
}
