/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusableOption, FocusKeyManager} from '@angular/cdk/a11y';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';
import {END, ENTER, hasModifierKey, HOME, SPACE} from '@angular/cdk/keycodes';
import {DOCUMENT} from '@angular/common';
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
} from '@angular/core';
import {Observable, of as obaservableOf, Subject} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';

import {CdkStepHeader} from './step-header';
import {CdkStepLabel} from './step-label';

/** Used to generate unique ID for each stepper component. */
let nextId = 0;

/**
 * Position state of the content of each step in stepper that is used for transitioning
 * the content into correct position upon step selection change.
 */
export type StepContentPositionState = 'previous'|'current'|'next';

/** Possible orientation of a stepper. */
export type StepperOrientation = 'horizontal'|'vertical';

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
export type StepState = 'number'|'edit'|'done'|'error'|string;

/** Enum to represent the different states of the steps. */
export const STEP_STATE = {
  NUMBER: 'number',
  EDIT: 'edit',
  DONE: 'done',
  ERROR: 'error'
};

/** InjectionToken that can be used to specify the global stepper options. */
export const STEPPER_GLOBAL_OPTIONS = new InjectionToken<StepperOptions>('STEPPER_GLOBAL_OPTIONS');

/**
 * InjectionToken that can be used to specify the global stepper options.
 * @deprecated Use `STEPPER_GLOBAL_OPTIONS` instead.
 * @breaking-change 8.0.0.
 */
export const MAT_STEPPER_GLOBAL_OPTIONS = STEPPER_GLOBAL_OPTIONS;

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
  moduleId: module.id,
  selector: 'cdk-step',
  exportAs: 'cdkStep',
  template: '<ng-template><ng-content></ng-content></ng-template>',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkStep implements OnChanges {
  private _stepperOptions: StepperOptions;
  _showError: boolean;
  _displayDefaultIndicatorType: boolean;

  /** Template for step label if it exists. */
  @ContentChild(CdkStepLabel, {static: false}) stepLabel: CdkStepLabel;

  /** Template for step content. */
  @ViewChild(TemplateRef, {static: true}) content: TemplateRef<any>;

  /** The top level abstract control of the step. */
  @Input() stepControl: FormControlLike;

  /** Whether user has seen the expanded step content or not. */
  interacted = false;

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
  set editable(value: boolean) {
    this._editable = coerceBooleanProperty(value);
  }
  private _editable = true;

  /** Whether the completion of step is optional. */
  @Input()
  get optional(): boolean {
    return this._optional;
  }
  set optional(value: boolean) {
    this._optional = coerceBooleanProperty(value);
  }
  private _optional = false;

  /** Whether step is marked as completed. */
  @Input()
  get completed(): boolean {
    return this._completedOverride == null ? this._getDefaultCompleted() : this._completedOverride;
  }
  set completed(value: boolean) {
    this._completedOverride = coerceBooleanProperty(value);
  }
  _completedOverride: boolean|null = null;

  private _getDefaultCompleted() {
    return this.stepControl ? this.stepControl.valid && this.interacted : this.interacted;
  }

  /** Whether step has an error. */
  @Input()
  get hasError(): boolean {
    return this._customError == null ? this._getDefaultError() : this._customError;
  }
  set hasError(value: boolean) {
    this._customError = coerceBooleanProperty(value);
  }
  private _customError: boolean|null = null;

  private _getDefaultError() {
    return this.stepControl && this.stepControl.invalid && this.interacted;
  }

  /** @breaking-change 8.0.0 remove the `?` after `stepperOptions` */
  constructor(
      @Inject(forwardRef(() => CdkStepper)) private _stepper: CdkStepper,
      @Optional() @Inject(STEPPER_GLOBAL_OPTIONS) stepperOptions?: StepperOptions) {
    this._stepperOptions = stepperOptions ? stepperOptions : {};
    this._displayDefaultIndicatorType = this._stepperOptions.displayDefaultIndicatorType !== false;
    this._showError = !!this._stepperOptions.showError;
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
}

@Directive({
  selector: '[cdkStepper]',
  exportAs: 'cdkStepper',
})
export class CdkStepper implements AfterViewInit, OnDestroy {
  /** Emits when the component is destroyed. */
  protected _destroyed = new Subject<void>();

  /** Used for managing keyboard focus. */
  private _keyManager: FocusKeyManager<FocusableOption>;

  /**
   * @breaking-change 8.0.0 Remove `| undefined` once the `_document`
   * constructor param is required.
   */
  private _document: Document|undefined;

  /**
   * The list of step components that the stepper is holding.
   * @deprecated use `steps` instead
   * @breaking-change 9.0.0 remove this property
   */
  @ContentChildren(CdkStep) _steps: QueryList<CdkStep>;

  /** The list of step components that the stepper is holding. */
  get steps(): QueryList<CdkStep> {
    return this._steps;
  }

  /**
   * The list of step headers of the steps in the stepper.
   * @deprecated Type to be changed to `QueryList<CdkStepHeader>`.
   * @breaking-change 8.0.0
   */
  @ContentChildren(CdkStepHeader) _stepHeader: QueryList<FocusableOption>;

  /** Whether the validity of previous steps should be checked or not. */
  @Input()
  get linear(): boolean {
    return this._linear;
  }
  set linear(value: boolean) {
    this._linear = coerceBooleanProperty(value);
  }
  private _linear = false;

  /** The index of the selected step. */
  @Input()
  get selectedIndex() {
    return this._selectedIndex;
  }
  set selectedIndex(index: number) {
    const newIndex = coerceNumberProperty(index);

    if (this.steps) {
      // Ensure that the index can't be out of bounds.
      if (newIndex < 0 || newIndex > this.steps.length - 1) {
        throw Error('cdkStepper: Cannot assign out-of-bounds value to `selectedIndex`.');
      }

      if (this._selectedIndex != newIndex && !this._anyControlsInvalidOrPending(newIndex) &&
          (newIndex >= this._selectedIndex || this.steps.toArray()[newIndex].editable)) {
        this._updateSelectedItemIndex(index);
      }
    } else {
      this._selectedIndex = newIndex;
    }
  }
  private _selectedIndex = 0;

  /** The step that is selected. */
  @Input()
  get selected(): CdkStep {
    // @breaking-change 8.0.0 Change return type to `CdkStep | undefined`.
    return this.steps ? this.steps.toArray()[this.selectedIndex] : undefined!;
  }
  set selected(step: CdkStep) {
    this.selectedIndex = this.steps ? this.steps.toArray().indexOf(step) : -1;
  }

  /** Event emitted when the selected step has changed. */
  @Output()
  selectionChange: EventEmitter<StepperSelectionEvent> = new EventEmitter<StepperSelectionEvent>();

  /** Used to track unique ID for each stepper component. */
  _groupId: number;

  protected _orientation: StepperOrientation = 'horizontal';

  constructor(
      @Optional() private _dir: Directionality, private _changeDetectorRef: ChangeDetectorRef,
      // @breaking-change 8.0.0 `_elementRef` and `_document` parameters to become required.
      private _elementRef?: ElementRef<HTMLElement>, @Inject(DOCUMENT) _document?: any) {
    this._groupId = nextId++;
    this._document = _document;
  }

  ngAfterViewInit() {
    // Note that while the step headers are content children by default, any components that
    // extend this one might have them as view chidren. We initialize the keyboard handling in
    // AfterViewInit so we're guaranteed for both view and content children to be defined.
    this._keyManager = new FocusKeyManager<FocusableOption>(this._stepHeader)
                           .withWrap()
                           .withVerticalOrientation(this._orientation === 'vertical');

    (this._dir ? (this._dir.change as Observable<Direction>) : obaservableOf<Direction>())
        .pipe(startWith(this._layoutDirection()), takeUntil(this._destroyed))
        .subscribe(direction => this._keyManager.withHorizontalOrientation(direction));

    this._keyManager.updateActiveItemIndex(this._selectedIndex);

    this.steps.changes.pipe(takeUntil(this._destroyed)).subscribe(() => {
      if (!this.selected) {
        this._selectedIndex = Math.max(this._selectedIndex - 1, 0);
      }
    });
  }

  ngOnDestroy() {
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

    return step._displayDefaultIndicatorType ? this._getDefaultIndicatorLogic(step, isCurrentStep) :
                                               this._getGuidelineLogic(step, isCurrentStep, state);
  }

  private _getDefaultIndicatorLogic(step: CdkStep, isCurrentStep: boolean): StepState {
    if (step._showError && step.hasError && !isCurrentStep) {
      return STEP_STATE.ERROR;
    } else if (!step.completed || isCurrentStep) {
      return STEP_STATE.NUMBER;
    } else {
      return step.editable ? STEP_STATE.EDIT : STEP_STATE.DONE;
    }
  }

  private _getGuidelineLogic(
      step: CdkStep, isCurrentStep: boolean, state: StepState = STEP_STATE.NUMBER): StepState {
    if (step._showError && step.hasError && !isCurrentStep) {
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
    this._containsFocus() ? this._keyManager.setActiveItem(newIndex) :
                            this._keyManager.updateActiveItemIndex(newIndex);

    this._selectedIndex = newIndex;
    this._stateChanged();
  }

  _onKeydown(event: KeyboardEvent) {
    const hasModifier = hasModifierKey(event);
    const keyCode = event.keyCode;
    const manager = this._keyManager;

    if (manager.activeItemIndex != null && !hasModifier &&
        (keyCode === SPACE || keyCode === ENTER)) {
      this.selectedIndex = manager.activeItemIndex;
      event.preventDefault();
    } else if (keyCode === HOME) {
      manager.setFirstItemActive();
      event.preventDefault();
    } else if (keyCode === END) {
      manager.setLastItemActive();
      event.preventDefault();
    } else {
      manager.onKeydown(event);
    }
  }

  private _anyControlsInvalidOrPending(index: number): boolean {
    const steps = this.steps.toArray();

    steps[this._selectedIndex].interacted = true;

    if (this._linear && index >= 0) {
      return steps.slice(0, index).some(step => {
        const control = step.stepControl;
        const isIncomplete =
            control ? (control.invalid || control.pending || !step.interacted) : !step.completed;
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
    if (!this._document || !this._elementRef) {
      return false;
    }

    const stepperElement = this._elementRef.nativeElement;
    const focusedElement = this._document.activeElement;
    return stepperElement === focusedElement || stepperElement.contains(focusedElement);
  }
}


/**
 * Simplified representation of a FormControl from @angular/forms.
 * Used to avoid having to bring in @angular/forms for a single optional interface.
 * @docs-private
 */
interface FormControlLike {
  asyncValidator: () => any | null;
  dirty: boolean;
  disabled: boolean;
  enabled: boolean;
  errors: {[key: string]: any} | null;
  invalid: boolean;
  parent: any;
  pending: boolean;
  pristine: boolean;
  root: FormControlLike;
  status: string;
  statusChanges: Observable<any>;
  touched: boolean;
  untouched: boolean;
  updateOn: any;
  valid: boolean;
  validator: () => any | null;
  value: any;
  valueChanges: Observable<any>;
  clearAsyncValidators(): void;
  clearValidators(): void;
  disable(opts?: any): void;
  enable(opts?: any): void;
  get(path: (string | number)[] | string): FormControlLike | null;
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
  setAsyncValidators(newValidator: () => any | (() => any)[] | null): void;
  setErrors(errors: {[key: string]: any} | null, opts?: any): void;
  setParent(parent: any): void;
  setValidators(newValidator: () => any | (() => any)[] | null): void;
  setValue(value: any, options?: Object): void;
  updateValueAndValidity(opts?: any): void;
  patchValue(value: any, options?: any): void;
  registerOnChange(fn: Function): void;
  registerOnDisabledChange(fn: (isDisabled: boolean) => void): void;
  reset(formState?: any, options?: any): void;
  setValue(value: any, options?: any): void;
}
