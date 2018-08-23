/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusableOption, FocusKeyManager} from '@angular/cdk/a11y';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {END, ENTER, HOME, SPACE} from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  EventEmitter,
  ElementRef,
  forwardRef,
  Inject,
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
import {DOCUMENT} from '@angular/common';
import {AbstractControl} from '@angular/forms';
import {CdkStepLabel} from './step-label';
import {Observable, Subject, of as obaservableOf} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';

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

@Component({
  moduleId: module.id,
  selector: 'cdk-step',
  exportAs: 'cdkStep',
  template: '<ng-template><ng-content></ng-content></ng-template>',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkStep implements OnChanges {
  /** Template for step label if it exists. */
  @ContentChild(CdkStepLabel) stepLabel: CdkStepLabel;

  /** Template for step content. */
  @ViewChild(TemplateRef) content: TemplateRef<any>;

  /** The top level abstract control of the step. */
  @Input() stepControl: AbstractControl;

  /** Whether user has seen the expanded step content or not. */
  interacted = false;

  /** Plain text label of the step. */
  @Input() label: string;

  /** Aria label for the tab. */
  @Input('aria-label') ariaLabel: string;

  /**
   * Reference to the element that the tab is labelled by.
   * Will be cleared if `aria-label` is set at the same time.
   */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** Whether the user can return to this step once it has been marked as complted. */
  @Input()
  get editable(): boolean { return this._editable; }
  set editable(value: boolean) {
    this._editable = coerceBooleanProperty(value);
  }
  private _editable = true;

  /** Whether the completion of step is optional. */
  @Input()
  get optional(): boolean { return this._optional; }
  set optional(value: boolean) {
    this._optional = coerceBooleanProperty(value);
  }
  private _optional = false;

  /** Whether step is marked as completed. */
  @Input()
  get completed(): boolean {
    return this._customCompleted == null ? this._defaultCompleted() : this._customCompleted;
  }
  set completed(value: boolean) {
    this._customCompleted = coerceBooleanProperty(value);
  }
  private _customCompleted: boolean | null = null;

  private _defaultCompleted() {
    return this.stepControl ? this.stepControl.valid && this.interacted : this.interacted;
  }

  constructor(@Inject(forwardRef(() => CdkStepper)) private _stepper: CdkStepper) { }

  /** Selects this step component. */
  select(): void {
    this._stepper.selected = this;
  }

  /** Resets the step to its initial state. Note that this includes resetting form data. */
  reset(): void {
    this.interacted = false;

    if (this._customCompleted != null) {
      this._customCompleted = false;
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
  private _document: Document | undefined;

  /** The list of step components that the stepper is holding. */
  @ContentChildren(CdkStep) _steps: QueryList<CdkStep>;

  /** The list of step headers of the steps in the stepper. */
  _stepHeader: QueryList<FocusableOption>;

  /** Whether the validity of previous steps should be checked or not. */
  @Input()
  get linear(): boolean { return this._linear; }
  set linear(value: boolean) { this._linear = coerceBooleanProperty(value); }
  private _linear = false;

  /** The index of the selected step. */
  @Input()
  get selectedIndex() { return this._selectedIndex; }
  set selectedIndex(index: number) {
    if (this._steps) {
      // Ensure that the index can't be out of bounds.
      if (index < 0 || index > this._steps.length - 1) {
        throw Error('cdkStepper: Cannot assign out-of-bounds value to `selectedIndex`.');
      }

      if (this._selectedIndex != index &&
          !this._anyControlsInvalidOrPending(index) &&
          (index >= this._selectedIndex || this._steps.toArray()[index].editable)) {
        this._updateSelectedItemIndex(index);
      }
    } else {
      this._selectedIndex = index;
    }
  }
  private _selectedIndex = 0;

  /** The step that is selected. */
  @Input()
  get selected(): CdkStep {
    // @breaking-change 7.0.0 Change return type to `CdkStep | undefined`.
    return this._steps ? this._steps.toArray()[this.selectedIndex] : undefined!;
  }
  set selected(step: CdkStep) {
    this.selectedIndex = this._steps ? this._steps.toArray().indexOf(step) : -1;
  }

  /** Event emitted when the selected step has changed. */
  @Output() selectionChange: EventEmitter<StepperSelectionEvent>
      = new EventEmitter<StepperSelectionEvent>();

  /** Used to track unique ID for each stepper component. */
  _groupId: number;

  protected _orientation: StepperOrientation = 'horizontal';

  constructor(
    @Optional() private _dir: Directionality,
    private _changeDetectorRef: ChangeDetectorRef,
    // @breaking-change 8.0.0 `_elementRef` and `_document` parameters to become required.
    private _elementRef?: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) _document?: any) {
    this._groupId = nextId++;
    this._document = _document;
  }

  ngAfterViewInit() {
    this._keyManager = new FocusKeyManager(this._stepHeader)
      .withWrap()
      .withVerticalOrientation(this._orientation === 'vertical');

    (this._dir ? this._dir.change as Observable<Direction> : obaservableOf())
      .pipe(startWith(this._layoutDirection()), takeUntil(this._destroyed))
      .subscribe(direction => this._keyManager.withHorizontalOrientation(direction));

    this._keyManager.updateActiveItemIndex(this._selectedIndex);

    this._steps.changes.pipe(takeUntil(this._destroyed)).subscribe(() => {
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
    this.selectedIndex = Math.min(this._selectedIndex + 1, this._steps.length - 1);
  }

  /** Selects and focuses the previous step in list. */
  previous(): void {
    this.selectedIndex = Math.max(this._selectedIndex - 1, 0);
  }

  /** Resets the stepper to its initial state. Note that this includes clearing form data. */
  reset(): void {
    this._updateSelectedItemIndex(0);
    this._steps.forEach(step => step.reset());
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
  _getIndicatorType(index: number): 'number' | 'edit' | 'done' {
    const step = this._steps.toArray()[index];
    if (!step.completed || this._selectedIndex == index) {
      return 'number';
    } else {
      return step.editable ? 'edit' : 'done';
    }
  }

  /** Returns the index of the currently-focused step header. */
  _getFocusIndex() {
    return this._keyManager ? this._keyManager.activeItemIndex : this._selectedIndex;
  }

  private _updateSelectedItemIndex(newIndex: number): void {
    const stepsArray = this._steps.toArray();
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
    const keyCode = event.keyCode;

    if (this._keyManager.activeItemIndex != null && (keyCode === SPACE || keyCode === ENTER)) {
      this.selectedIndex = this._keyManager.activeItemIndex;
      event.preventDefault();
    } else if (keyCode === HOME) {
      this._keyManager.setFirstItemActive();
      event.preventDefault();
    } else if (keyCode === END) {
      this._keyManager.setLastItemActive();
      event.preventDefault();
    } else {
      this._keyManager.onKeydown(event);
    }
  }

  private _anyControlsInvalidOrPending(index: number): boolean {
    const steps = this._steps.toArray();

    steps[this._selectedIndex].interacted = true;

    if (this._linear && index >= 0) {
      return steps.slice(0, index).some(step => {
        const control = step.stepControl;
        const isIncomplete = control ?
            (control.invalid || control.pending || !step.interacted) :
            !step.completed;
        return isIncomplete && !step.optional;
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
