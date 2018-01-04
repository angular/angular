/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {take} from 'rxjs/operators/take';
import {startWith} from 'rxjs/operators/startWith';
import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  Inject,
  Input,
  Optional,
  QueryList,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {FloatLabelType, MAT_LABEL_GLOBAL_OPTIONS, LabelOptions} from '@angular/material/core';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {MatError} from './error';
import {MatFormFieldControl} from './form-field-control';
import {
  getMatFormFieldDuplicatedHintError,
  getMatFormFieldMissingControlError,
  getMatFormFieldPlaceholderConflictError,
} from './form-field-errors';
import {MatHint} from './hint';
import {MatPlaceholder} from './placeholder';
import {MatLabel} from './label';
import {MatPrefix} from './prefix';
import {MatSuffix} from './suffix';
import {matFormFieldAnimations} from './form-field-animations';


let nextUniqueId = 0;


/** Container for form controls that applies Material Design styling and behavior. */
@Component({
  moduleId: module.id,
  // TODO(mmalerba): the input-container selectors and classes are deprecated and will be removed.
  selector: 'mat-input-container, mat-form-field',
  exportAs: 'matFormField',
  templateUrl: 'form-field.html',
  // MatInput is a directive and can't have styles, so we need to include its styles here.
  // The MatInput styles are fairly minimal so it shouldn't be a big deal for people who
  // aren't using MatInput.
  styleUrls: ['form-field.css', '../input/input.css'],
  animations: [matFormFieldAnimations.transitionMessages],
  host: {
    'class': 'mat-input-container mat-form-field',
    '[class.mat-input-invalid]': '_control.errorState',
    '[class.mat-form-field-invalid]': '_control.errorState',
    '[class.mat-form-field-can-float]': '_canLabelFloat',
    '[class.mat-form-field-should-float]': '_shouldLabelFloat()',
    '[class.mat-form-field-hide-placeholder]': '_hideControlPlaceholder()',
    '[class.mat-form-field-disabled]': '_control.disabled',
    '[class.mat-focused]': '_control.focused',
    '[class.mat-primary]': 'color == "primary"',
    '[class.mat-accent]': 'color == "accent"',
    '[class.mat-warn]': 'color == "warn"',
    '[class.ng-untouched]': '_shouldForward("untouched")',
    '[class.ng-touched]': '_shouldForward("touched")',
    '[class.ng-pristine]': '_shouldForward("pristine")',
    '[class.ng-dirty]': '_shouldForward("dirty")',
    '[class.ng-valid]': '_shouldForward("valid")',
    '[class.ng-invalid]': '_shouldForward("invalid")',
    '[class.ng-pending]': '_shouldForward("pending")',
  },
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MatFormField implements AfterViewInit, AfterContentInit, AfterContentChecked {
  private _labelOptions: LabelOptions;

  /** Color of the form field underline, based on the theme. */
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

  /** @deprecated Use `color` instead. */
  @Input()
  get dividerColor(): 'primary' | 'accent' | 'warn' { return this.color; }
  set dividerColor(value) { this.color = value; }

  /** Whether the required marker should be hidden. */
  @Input()
  get hideRequiredMarker() { return this._hideRequiredMarker; }
  set hideRequiredMarker(value: any) {
    this._hideRequiredMarker = coerceBooleanProperty(value);
  }
  private _hideRequiredMarker: boolean;

  /** Override for the logic that disables the label animation in certain cases. */
  private _showAlwaysAnimate = false;

  /** Whether the floating label should always float or not. */
  get _shouldAlwaysFloat() {
    return this._floatLabel === 'always' && !this._showAlwaysAnimate;
  }

  /** Whether the label can float or not. */
  get _canLabelFloat() { return this._floatLabel !== 'never'; }

  /** State of the mat-hint and mat-error animations. */
  _subscriptAnimationState: string = '';

  /** Text for the form field hint. */
  @Input()
  get hintLabel() { return this._hintLabel; }
  set hintLabel(value: string) {
    this._hintLabel = value;
    this._processHints();
  }
  private _hintLabel = '';

  // Unique id for the hint label.
  _hintLabelId: string = `mat-hint-${nextUniqueId++}`;

  /**
   * Whether the placeholder should always float, never float or float as the user types.
   * @deprecated Use floatLabel instead.
   */
  @Input()
  get floatPlaceholder() { return this._floatLabel; }
  set floatPlaceholder(value: FloatLabelType) { this.floatLabel = value; }

  /** Whether the label should always float, never float or float as the user types. */
  @Input()
  get floatLabel() { return this._floatLabel; }
  set floatLabel(value: FloatLabelType) {
    if (value !== this._floatLabel) {
      this._floatLabel = value || this._labelOptions.float || 'auto';
      this._changeDetectorRef.markForCheck();
    }
  }
  private _floatLabel: FloatLabelType;

  /** Reference to the form field's underline element. */
  @ViewChild('underline') underlineRef: ElementRef;
  @ViewChild('connectionContainer') _connectionContainerRef: ElementRef;
  @ViewChild('inputContainer') _inputContainerRef: ElementRef;
  @ViewChild('label') private _label: ElementRef;
  @ContentChild(MatFormFieldControl) _control: MatFormFieldControl<any>;
  @ContentChild(MatPlaceholder) _placeholderChild: MatPlaceholder;
  @ContentChild(MatLabel) _labelChild: MatLabel;
  @ContentChildren(MatError) _errorChildren: QueryList<MatError>;
  @ContentChildren(MatHint) _hintChildren: QueryList<MatHint>;
  @ContentChildren(MatPrefix) _prefixChildren: QueryList<MatPrefix>;
  @ContentChildren(MatSuffix) _suffixChildren: QueryList<MatSuffix>;

  constructor(
      public _elementRef: ElementRef,
      private _changeDetectorRef: ChangeDetectorRef,
      @Optional() @Inject(MAT_LABEL_GLOBAL_OPTIONS) labelOptions: LabelOptions) {
    this._labelOptions = labelOptions ? labelOptions : {};
    this.floatLabel = this._labelOptions.float || 'auto';
  }

  ngAfterContentInit() {
    this._validateControlChild();
    if (this._control.controlType) {
      this._elementRef.nativeElement.classList
          .add(`mat-form-field-type-${this._control.controlType}`);
    }

    // Subscribe to changes in the child control state in order to update the form field UI.
    this._control.stateChanges.pipe(startWith(null!)).subscribe(() => {
      this._validatePlaceholders();
      this._syncDescribedByIds();
      this._changeDetectorRef.markForCheck();
    });

    let ngControl = this._control.ngControl;
    if (ngControl && ngControl.valueChanges) {
      ngControl.valueChanges.subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
    }

    // Re-validate when the number of hints changes.
    this._hintChildren.changes.pipe(startWith(null)).subscribe(() => {
      this._processHints();
      this._changeDetectorRef.markForCheck();
    });

    // Update the aria-described by when the number of errors changes.
    this._errorChildren.changes.pipe(startWith(null)).subscribe(() => {
      this._syncDescribedByIds();
      this._changeDetectorRef.markForCheck();
    });
  }

  ngAfterContentChecked() {
    this._validateControlChild();
  }

  ngAfterViewInit() {
    // Avoid animations on load.
    this._subscriptAnimationState = 'enter';
    this._changeDetectorRef.detectChanges();
  }

  /** Determines whether a class from the NgControl should be forwarded to the host element. */
  _shouldForward(prop: string): boolean {
    let ngControl = this._control ? this._control.ngControl : null;
    return ngControl && (ngControl as any)[prop];
  }

  _hasPlaceholder() {
    return !!(this._control.placeholder || this._placeholderChild);
  }

  _hasLabel() {
    return !!this._labelChild;
  }

  _shouldLabelFloat() {
    return this._canLabelFloat && (this._control.shouldLabelFloat ||
        this._control.shouldPlaceholderFloat || this._shouldAlwaysFloat);
  }

  _hideControlPlaceholder() {
    return !this._hasLabel() || !this._shouldLabelFloat();
  }

  _hasFloatingLabel() {
    return this._hasLabel() || this._hasPlaceholder();
  }

  /** Determines whether to display hints or errors. */
  _getDisplayedMessages(): 'error' | 'hint' {
    return (this._errorChildren && this._errorChildren.length > 0 &&
        this._control.errorState) ? 'error' : 'hint';
  }

  /** Animates the placeholder up and locks it in position. */
  _animateAndLockLabel(): void {
    if (this._hasFloatingLabel() && this._canLabelFloat) {
      this._showAlwaysAnimate = true;
      this._floatLabel = 'always';

      fromEvent(this._label.nativeElement, 'transitionend').pipe(take(1)).subscribe(() => {
        this._showAlwaysAnimate = false;
      });

      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Ensure that there is only one placeholder (either `placeholder` attribute on the child control
   * or child element with the `mat-placeholder` directive).
   */
  private _validatePlaceholders() {
    if (this._control.placeholder && this._placeholderChild) {
      throw getMatFormFieldPlaceholderConflictError();
    }
  }

  /** Does any extra processing that is required when handling the hints. */
  private _processHints() {
    this._validateHints();
    this._syncDescribedByIds();
  }

  /**
   * Ensure that there is a maximum of one of each `<mat-hint>` alignment specified, with the
   * attribute being considered as `align="start"`.
   */
  private _validateHints() {
    if (this._hintChildren) {
      let startHint: MatHint;
      let endHint: MatHint;
      this._hintChildren.forEach((hint: MatHint) => {
        if (hint.align == 'start') {
          if (startHint || this.hintLabel) {
            throw getMatFormFieldDuplicatedHintError('start');
          }
          startHint = hint;
        } else if (hint.align == 'end') {
          if (endHint) {
            throw getMatFormFieldDuplicatedHintError('end');
          }
          endHint = hint;
        }
      });
    }
  }

  /**
   * Sets the list of element IDs that describe the child control. This allows the control to update
   * its `aria-describedby` attribute accordingly.
   */
  private _syncDescribedByIds() {
    if (this._control) {
      let ids: string[] = [];

      if (this._getDisplayedMessages() === 'hint') {
        let startHint = this._hintChildren ?
            this._hintChildren.find(hint => hint.align === 'start') : null;
        let endHint = this._hintChildren ?
            this._hintChildren.find(hint => hint.align === 'end') : null;

        if (startHint) {
          ids.push(startHint.id);
        } else if (this._hintLabel) {
          ids.push(this._hintLabelId);
        }

        if (endHint) {
          ids.push(endHint.id);
        }
      } else if (this._errorChildren) {
        ids = this._errorChildren.map(error => error.id);
      }

      this._control.setDescribedByIds(ids);
    }
  }

  /** Throws an error if the form field's control is missing. */
  protected _validateControlChild() {
    if (!this._control) {
      throw getMatFormFieldMissingControlError();
    }
  }
}
