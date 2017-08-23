/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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
import {animate, state, style, transition, trigger} from '@angular/animations';
import {coerceBooleanProperty} from '../core';
import {
  getMdFormFieldDuplicatedHintError,
  getMdFormFieldMissingControlError,
  getMdFormFieldPlaceholderConflictError,
} from './form-field-errors';
import {
  FloatPlaceholderType,
  MD_PLACEHOLDER_GLOBAL_OPTIONS,
  PlaceholderOptions
} from '../core/placeholder/placeholder-options';
import {startWith, first} from '@angular/cdk/rxjs';
import {MdError} from './error';
import {MdFormFieldControl} from './form-field-control';
import {MdHint} from './hint';
import {MdPlaceholder} from './placeholder';
import {MdPrefix} from './prefix';
import {MdSuffix} from './suffix';
import {fromEvent} from 'rxjs/observable/fromEvent';


let nextUniqueId = 0;


/** Container for form controls that applies Material Design styling and behavior. */
@Component({
  moduleId: module.id,
  // TODO(mmalerba): the input-container selectors and classes are deprecated and will be removed.
  selector: 'md-input-container, mat-input-container, md-form-field, mat-form-field',
  templateUrl: 'form-field.html',
  // MdInput is a directive and can't have styles, so we need to include its styles here.
  // The MdInput styles are fairly minimal so it shouldn't be a big deal for people who aren't using
  // MdInput.
  styleUrls: ['form-field.css', '../input/input.css'],
  animations: [
    // TODO(mmalerba): Use angular animations for placeholder animation as well.
    trigger('transitionMessages', [
      state('enter', style({ opacity: 1, transform: 'translateY(0%)' })),
      transition('void => enter', [
        style({ opacity: 0, transform: 'translateY(-100%)' }),
        animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)'),
      ]),
    ]),
  ],
  host: {
    'class': 'mat-input-container mat-form-field',
    '[class.mat-input-invalid]': '_control.errorState',
    '[class.mat-form-field-invalid]': '_control.errorState',
    '[class.mat-focused]': '_control.focused',
    '[class.ng-untouched]': '_shouldForward("untouched")',
    '[class.ng-touched]': '_shouldForward("touched")',
    '[class.ng-pristine]': '_shouldForward("pristine")',
    '[class.ng-dirty]': '_shouldForward("dirty")',
    '[class.ng-valid]': '_shouldForward("valid")',
    '[class.ng-invalid]': '_shouldForward("invalid")',
    '[class.ng-pending]': '_shouldForward("pending")',
    '(click)': '_control.focus()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MdFormField implements AfterViewInit, AfterContentInit, AfterContentChecked {
  private _placeholderOptions: PlaceholderOptions;

  /** Color of the form field underline, based on the theme. */
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

  /** @deprecated Use `color` instead. */
  @Input()
  get dividerColor() { return this.color; }
  set dividerColor(value) { this.color = value; }

  /** Whether the required marker should be hidden. */
  @Input()
  get hideRequiredMarker() { return this._hideRequiredMarker; }
  set hideRequiredMarker(value: any) {
    this._hideRequiredMarker = coerceBooleanProperty(value);
  }
  private _hideRequiredMarker: boolean;

  /** Override for the logic that disables the placeholder animation in certain cases. */
  private _showAlwaysAnimate = false;

  /** Whether the floating label should always float or not. */
  get _shouldAlwaysFloat() {
    return this._floatPlaceholder === 'always' && !this._showAlwaysAnimate;
  }

  /** Whether the placeholder can float or not. */
  get _canPlaceholderFloat() { return this._floatPlaceholder !== 'never'; }

  /** State of the md-hint and md-error animations. */
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
  _hintLabelId: string = `md-hint-${nextUniqueId++}`;

  /** Whether the placeholder should always float, never float or float as the user types. */
  @Input()
  get floatPlaceholder() { return this._floatPlaceholder; }
  set floatPlaceholder(value: FloatPlaceholderType) {
    if (value !== this._floatPlaceholder) {
      this._floatPlaceholder = value || this._placeholderOptions.float || 'auto';
      this._changeDetectorRef.markForCheck();
    }
  }
  private _floatPlaceholder: FloatPlaceholderType;

  /** Reference to the form field's underline element. */
  @ViewChild('underline') underlineRef: ElementRef;
  @ViewChild('connectionContainer') _connectionContainerRef: ElementRef;
  @ViewChild('placeholder') private _placeholder: ElementRef;
  @ContentChild(MdFormFieldControl) _control: MdFormFieldControl<any>;
  @ContentChild(MdPlaceholder) _placeholderChild: MdPlaceholder;
  @ContentChildren(MdError) _errorChildren: QueryList<MdError>;
  @ContentChildren(MdHint) _hintChildren: QueryList<MdHint>;
  @ContentChildren(MdPrefix) _prefixChildren: QueryList<MdPrefix>;
  @ContentChildren(MdSuffix) _suffixChildren: QueryList<MdSuffix>;

  constructor(
      public _elementRef: ElementRef, private _changeDetectorRef: ChangeDetectorRef,
      @Optional() @Inject(MD_PLACEHOLDER_GLOBAL_OPTIONS) placeholderOptions: PlaceholderOptions) {
    this._placeholderOptions = placeholderOptions ? placeholderOptions : {};
    this.floatPlaceholder = this._placeholderOptions.float || 'auto';
  }

  ngAfterContentInit() {
    this._validateControlChild();

    // Subscribe to changes in the child control state in order to update the form field UI.
    startWith.call(this._control.stateChanges, null).subscribe(() => {
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
    startWith.call(this._hintChildren.changes, null).subscribe(() => {
      this._processHints();
      this._changeDetectorRef.markForCheck();
    });

    // Update the aria-described by when the number of errors changes.
    startWith.call(this._errorChildren.changes, null).subscribe(() => {
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

  /** Whether the form field has a placeholder. */
  _hasPlaceholder() {
    return !!(this._control.placeholder || this._placeholderChild);
  }

  /** Determines whether to display hints or errors. */
  _getDisplayedMessages(): 'error' | 'hint' {
    return (this._errorChildren && this._errorChildren.length > 0 &&
        this._control.errorState) ? 'error' : 'hint';
  }

  /** Animates the placeholder up and locks it in position. */
  _animateAndLockPlaceholder(): void {
    if (this._placeholder && this._canPlaceholderFloat) {
      this._showAlwaysAnimate = true;
      this._floatPlaceholder = 'always';

      first.call(fromEvent(this._placeholder.nativeElement, 'transitionend')).subscribe(() => {
        this._showAlwaysAnimate = false;
      });

      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Ensure that there is only one placeholder (either `placeholder` attribute on the child control
   * or child element with the `md-placeholder` directive).
   */
  private _validatePlaceholders() {
    if (this._control.placeholder && this._placeholderChild) {
      throw getMdFormFieldPlaceholderConflictError();
    }
  }

  /** Does any extra processing that is required when handling the hints. */
  private _processHints() {
    this._validateHints();
    this._syncDescribedByIds();
  }

  /**
   * Ensure that there is a maximum of one of each `<md-hint>` alignment specified, with the
   * attribute being considered as `align="start"`.
   */
  private _validateHints() {
    if (this._hintChildren) {
      let startHint: MdHint;
      let endHint: MdHint;
      this._hintChildren.forEach((hint: MdHint) => {
        if (hint.align == 'start') {
          if (startHint || this.hintLabel) {
            throw getMdFormFieldDuplicatedHintError('start');
          }
          startHint = hint;
        } else if (hint.align == 'end') {
          if (endHint) {
            throw getMdFormFieldDuplicatedHintError('end');
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
        ids = this._errorChildren.map(mdError => mdError.id);
      }

      this._control.setDescribedByIds(ids);
    }
  }

  /** Throws an error if the form field's control is missing. */
  protected _validateControlChild() {
    if (!this._control) {
      throw getMdFormFieldMissingControlError();
    }
  }
}
