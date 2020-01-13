/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
  Inject, InjectionToken,
  Input,
  isDevMode,
  OnDestroy,
  Optional,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {
  LabelOptions,
  MAT_LABEL_GLOBAL_OPTIONS,
  ThemePalette
} from '@angular/material/core';
import {
  getMatFormFieldDuplicatedHintError,
  getMatFormFieldMissingControlError,
  MatFormField as NonMdcFormField,
  matFormFieldAnimations,
  MatFormFieldControl,
} from '@angular/material/form-field';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {MDCTextFieldAdapter, MDCTextFieldFoundation} from '@material/textfield';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatError} from './directives/error';
import {MatFormFieldFloatingLabel} from './directives/floating-label';
import {MatHint} from './directives/hint';
import {MatLabel} from './directives/label';
import {MatFormFieldLineRipple} from './directives/line-ripple';
import {MatFormFieldNotchedOutline} from './directives/notched-outline';
import {MatPrefix} from './directives/prefix';
import {MatSuffix} from './directives/suffix';

/** Type for the available floatLabel values. */
export type FloatLabelType = 'always' | 'auto';

/** Possible appearance styles for the form field. */
export type MatFormFieldAppearance = 'fill' | 'outline';

/**
 * Represents the default options for the form field that can be configured
 * using the `MAT_FORM_FIELD_DEFAULT_OPTIONS` injection token.
 */
export interface MatFormFieldDefaultOptions {
  appearance?: MatFormFieldAppearance;
  hideRequiredMarker?: boolean;
}

/**
 * Injection token that can be used to configure the
 * default options for all form field within an app.
 */
export const MAT_FORM_FIELD_DEFAULT_OPTIONS =
  new InjectionToken<MatFormFieldDefaultOptions>('MAT_FORM_FIELD_DEFAULT_OPTIONS');

let nextUniqueId = 0;

/** Default appearance used by the form-field. */
const DEFAULT_APPEARANCE: MatFormFieldAppearance = 'fill';

/** Default appearance used by the form-field. */
const DEFAULT_FLOAT_LABEL: FloatLabelType = 'auto';

/** Container for form controls that applies Material Design styling and behavior. */
@Component({
  selector: 'mat-form-field',
  exportAs: 'matFormField',
  templateUrl: './form-field.html',
  styleUrls: ['./form-field.css'],
  animations: [matFormFieldAnimations.transitionMessages],
  host: {
    'class': 'mat-mdc-form-field',
    '[class.mat-mdc-form-field-label-always-float]': '_shouldAlwaysFloat()',
    '[class.mat-form-field-invalid]': '_control.errorState',
    '[class.mat-form-field-disabled]': '_control.disabled',
    '[class.mat-form-field-autofilled]': '_control.autofilled',
    '[class.mat-focused]': '_control.focused',
    '[class.mat-accent]': 'color == "accent"',
    '[class.mat-warn]': 'color == "warn"',
    '[class.ng-untouched]': '_shouldForward("untouched")',
    '[class.ng-touched]': '_shouldForward("touched")',
    '[class.ng-pristine]': '_shouldForward("pristine")',
    '[class.ng-dirty]': '_shouldForward("dirty")',
    '[class.ng-valid]': '_shouldForward("valid")',
    '[class.ng-invalid]': '_shouldForward("invalid")',
    '[class.ng-pending]': '_shouldForward("pending")',
    '[class._mat-animation-noopable]': '!_animationsEnabled',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // Temporary workaround that allows us to test the MDC form-field against
    // components which inject the non-mdc form-field (e.g. autocomplete).
    {provide: NonMdcFormField, useExisting: MatFormField}
  ]
})
export class MatFormField implements AfterViewInit, OnDestroy, AfterContentChecked,
    AfterContentInit {
  @ViewChild('textField') _textField: ElementRef<HTMLElement>;
  @ViewChild(MatFormFieldFloatingLabel) _floatingLabel: MatFormFieldFloatingLabel|undefined;
  @ViewChild(MatFormFieldNotchedOutline) _notchedOutline: MatFormFieldNotchedOutline|undefined;
  @ViewChild(MatFormFieldLineRipple) _lineRipple: MatFormFieldLineRipple|undefined;

  @ContentChild(MatLabel) _labelChildNonStatic: MatLabel|undefined;
  @ContentChild(MatLabel, {static: true}) _labelChildStatic: MatLabel|undefined;
  @ContentChild(MatFormFieldControl) _formFieldControl: MatFormFieldControl<any>;
  @ContentChildren(MatPrefix, {descendants: true}) _prefixChildren: QueryList<MatPrefix>;
  @ContentChildren(MatSuffix, {descendants: true}) _suffixChildren: QueryList<MatSuffix>;
  @ContentChildren(MatError, {descendants: true}) _errorChildren: QueryList<MatError>;
  @ContentChildren(MatHint, {descendants: true}) _hintChildren: QueryList<MatHint>;

  /** Whether the required marker should be hidden. */
  @Input() hideRequiredMarker: boolean = false;

  /** The color palette for the form-field. */
  @Input() color: ThemePalette = 'primary';

  /** Whether the label should always float or float as the user types. */
  @Input()
  get floatLabel(): FloatLabelType {
    return this._floatLabel || (this._labelOptions && this._labelOptions.float)
        || DEFAULT_FLOAT_LABEL;
  }
  set floatLabel(value: FloatLabelType) {
    if (value !== this._floatLabel) {
      this._floatLabel = value;
      // For backwards compatibility. Custom form-field controls or directives might set
      // the "floatLabel" input and expect the form-field view to be updated automatically.
      // e.g. autocomplete trigger. Ideally we'd get rid of this and the consumers would just
      // emit the "stateChanges" observable. TODO(devversion): consider removing.
      this._changeDetectorRef.markForCheck();
    }
  }
  private _floatLabel: FloatLabelType;

  /** The form-field appearance style. */
  @Input()
  get appearance(): MatFormFieldAppearance { return this._appearance; }
  set appearance(value: MatFormFieldAppearance) {
    this._appearance = value || (this._defaults && this._defaults.appearance) || DEFAULT_APPEARANCE;
  }
  private _appearance: MatFormFieldAppearance = DEFAULT_APPEARANCE;

  /** Text for the form field hint. */
  @Input()
  get hintLabel(): string { return this._hintLabel; }
  set hintLabel(value: string) {
    this._hintLabel = value;
    this._processHints();
  }
  private _hintLabel = '';

  // Unique id for the hint label.
  _hintLabelId: string = `mat-hint-${nextUniqueId++}`;

  // Unique id for the internal form field label.
  _labelId = `mat-form-field-label-${nextUniqueId++}`;

  /** Whether the Angular animations are enabled. */
  _animationsEnabled: boolean;

  /** State of the mat-hint and mat-error animations. */
  _subscriptAnimationState: string = '';

  /** Gets the current form field control */
  get _control(): MatFormFieldControl<any> {
    return this._explicitFormFieldControl || this._formFieldControl;
  }
  set _control(value) { this._explicitFormFieldControl = value; }

  private _destroyed = new Subject<void>();
  private _isFocused: boolean|null = null;
  private _explicitFormFieldControl: MatFormFieldControl<any>;
  private _foundation: MDCTextFieldFoundation;
  private _adapter: MDCTextFieldAdapter = {
    addClass: className => this._textField.nativeElement.classList.add(className),
    removeClass: className => this._textField.nativeElement.classList.remove(className),
    hasClass: className => this._textField.nativeElement.classList.contains(className),

    hasLabel: () => this._hasFloatingLabel(),
    isFocused: () => this._control.focused,
    hasOutline: () => this._hasOutline(),

    // MDC text-field will call this method on focus, blur and value change. It expects us
    // to update the floating label state accordingly. Though we make this a noop because we
    // want to react to floating label state changes through change detection. Relying on this
    // adapter method would mean that the label would not update if the custom form-field control
    // sets "shouldLabelFloat" to true, or if the "floatLabel" input binding changes to "always".
    floatLabel: () => {},

    // Label shaking is not supported yet. It will require a new API for form field
    // controls to trigger the shaking. This can be a feature in the future.
    // TODO(devversion): explore options on how to integrate label shaking.
    shakeLabel: () => {},

    getLabelWidth: () => this._floatingLabel ? this._floatingLabel.getWidth() : 0,
    notchOutline: labelWidth => this._notchedOutline && this._notchedOutline.notch(labelWidth),
    closeOutline: () => this._notchedOutline && this._notchedOutline.closeNotch(),

    activateLineRipple: () => this._lineRipple && this._lineRipple.activate(),
    deactivateLineRipple: () => this._lineRipple && this._lineRipple.deactivate(),

    // The foundation tries to register events on the input. This is not matching
    // our concept of abstract form field controls. We handle each event manually
    // in "ngDoCheck" based on the form-field control state. The following events
    // need to be handled: focus, blur. We do not handle the "input" event since
    // that one is only needed for the text-field character count, which we do
    // not implement as part of the form-field, but should be implemented manually
    // by consumers using template bindings.
    registerInputInteractionHandler: () => {},
    deregisterInputInteractionHandler: () => {},

    // We do not have a reference to the native input since we work with abstract form field
    // controls. MDC needs a reference to the native input optionally to handle character
    // counting and value updating. These are both things we do not handle from within the
    // form-field, so we can just return null.
    getNativeInput: () => null,

    // This method will never be called since we do not have the ability to add event listeners
    // to the native input. This is because the form control is not necessarily an input, and
    // the form field deals with abstract form controls of any type.
    setLineRippleTransformOrigin: () => {},

    // The foundation tries to register click and keyboard events on the form-field to figure out
    // if the input value changes through user interaction. Based on that, the foundation tries
    // to focus the input. Since we do not handle the input value as part of the form-field, nor
    // it's guaranteed to be an input (see adapter methods above), this is a noop.
    deregisterTextFieldInteractionHandler: () => {},
    registerTextFieldInteractionHandler: () => {},

    // The foundation tries to setup a "MutationObserver" in order to watch for attributes
    // like "maxlength" or "pattern" to change. The foundation will update the validity state
    // based on that. We do not need this logic since we handle the validity through the
    // abstract form control instance.
    deregisterValidationAttributeChangeHandler: () => {},
    registerValidationAttributeChangeHandler: () => null as any,
  };

  constructor(private _elementRef: ElementRef,
              private _changeDetectorRef: ChangeDetectorRef,
              @Optional() @Inject(MAT_FORM_FIELD_DEFAULT_OPTIONS)
              private _defaults?: MatFormFieldDefaultOptions,
              @Optional() @Inject(MAT_LABEL_GLOBAL_OPTIONS) private _labelOptions?: LabelOptions,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) _animationMode?: string) {
    this._animationsEnabled = _animationMode !== 'NoopAnimations';

    if (_defaults && _defaults.appearance) {
      this.appearance = _defaults.appearance;
    } else if (_defaults && _defaults.hideRequiredMarker) {
      this.hideRequiredMarker = true;
    }
  }

  ngAfterViewInit() {
    this._foundation = new MDCTextFieldFoundation(this._adapter);

    // MDC uses the "shouldFloat" getter to know whether the label is currently floating. This
    // does not match our implementation of when the label floats because we support more cases.
    // For example, consumers can set "@Input floatLabel" to always, or the custom form-field
    // control can set "MatFormFieldControl#shouldLabelFloat" to true. To ensure that MDC knows
    // when the label is floating, we overwrite the property to be based on the method we use to
    // determine the current state of the floating label.
    Object.defineProperty(this._foundation, 'shouldFloat', {
      get: () => this._shouldLabelFloat(),
    });

    // Initial focus state sync. This happens rarely, but we want to account for
    // it in case the form-field control has "focused" set to true on init.
    this._updateFocusState();
    // Initial notch update since we overwrote the "shouldFloat" getter.
    this._rerenderOutlineNotch();
    // Enable animations now. This ensures we don't animate on initial render.
    this._subscriptAnimationState = 'enter';
  }

  ngAfterContentInit() {
    this._assertFormFieldControl();
    this._initializeControl();
    this._initializeSubscript();
  }

  ngAfterContentChecked() {
    this._assertFormFieldControl();
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * Gets an ElementRef for the element that a overlay attached to the form-field
   * should be positioned relative to.
   */
  getConnectedOverlayOrigin(): ElementRef {
    return this._textField || this._elementRef;
  }

  /** Animates the placeholder up and locks it in position. */
  _animateAndLockLabel(): void {
    // This is for backwards compatibility only. Consumers of the form-field might use
    // this method. e.g. the autocomplete trigger. This method has been added to the non-MDC
    // form-field because setting "floatLabel" to "always" caused the label to float without
    // animation. This is different in MDC where the label always animates, so this method
    // is no longer necessary. There doesn't seem any benefit in adding logic to allow changing
    // the floating label state without animations. The non-MDC implementation was inconsistent
    // because it always animates if "floatLabel" is set away from "always".
    // TODO(devversion): consider removing this method when releasing the MDC form-field.
    if (this._hasFloatingLabel()) {
      this.floatLabel = 'always';
    }
  }

  /** Initializes the registered form-field control. */
  private _initializeControl() {
    const control = this._control;

    if (control.controlType) {
      this._elementRef.nativeElement.classList.add(
        `mat-mdc-form-field-type-${control.controlType}`);
    }

    // Subscribe to changes in the child control state in order to update the form field UI.
    control.stateChanges.subscribe(() => {
      this._updateFocusState();
      this._syncDescribedByIds();
      this._changeDetectorRef.markForCheck();
    });

    // Run change detection if the value changes.
    if (control.ngControl && control.ngControl.valueChanges) {
      control.ngControl.valueChanges
        .pipe(takeUntil(this._destroyed))
        .subscribe(() => this._changeDetectorRef.markForCheck());
    }
  }

  /**
   * Initializes the subscript by validating hints and synchronizing "aria-describedby" ids
   * with the custom form-field control. Also subscribes to hint and error changes in order
   * to be able to validate and synchronize ids on change.
   */
  private _initializeSubscript() {
    // Re-validate when the number of hints changes.
    this._hintChildren.changes.subscribe(() => {
      this._processHints();
      this._changeDetectorRef.markForCheck();
    });

    // Update the aria-described by when the number of errors changes.
    this._errorChildren.changes.subscribe(() => {
      this._syncDescribedByIds();
      this._changeDetectorRef.markForCheck();
    });

    // Initial mat-hint validation and subscript describedByIds sync.
    this._validateHints();
    this._syncDescribedByIds();
  }

  /** Throws an error if the form field's control is missing. */
  private _assertFormFieldControl() {
    if (!this._control) {
      throw getMatFormFieldMissingControlError();
    }
  }
  private _updateFocusState() {
    // Usually the MDC foundation would call "activateFocus" and "deactivateFocus" whenever
    // certain DOM events are emitted. This is not possible in our implementation of the
    // form-field because we support abstract form field controls which are not necessarily
    // of type input, nor do we have a reference to a native form-field control element. Instead
    // we handle the focus by checking if the abstract form-field control focused state changes.
    if (this._control.focused && !this._isFocused) {
      this._isFocused = true;
      this._foundation.activateFocus();
    } else if (!this._control.focused && (this._isFocused || this._isFocused === null)) {
      this._isFocused = false;
      this._foundation.deactivateFocus();
    }
  }

  _rerenderOutlineNotch() {
    if (this._floatingLabel && this._hasOutline()) {
      this._foundation.notchOutline(this._shouldLabelFloat());
    }
  }

  /** Whether the floating label should always float or not. */
  _shouldAlwaysFloat() {
    return this.floatLabel === 'always';
  }

  _hasOutline() {
    return this.appearance === 'outline';
  }

  _hasFloatingLabel() {
    return !!this._labelChildNonStatic || !!this._labelChildStatic;
  }

  _shouldLabelFloat() {
    return this._control.shouldLabelFloat || this._shouldAlwaysFloat();
  }

  /** Determines whether a class from the NgControl should be forwarded to the host element. */
  _shouldForward(prop: keyof NgControl): boolean {
    const ngControl = this._control ? this._control.ngControl : null;
    return ngControl && ngControl[prop];
  }

  /** Determines whether to display hints or errors. */
  _getDisplayedMessages(): 'error' | 'hint' {
    return (this._errorChildren && this._errorChildren.length > 0 &&
      this._control.errorState) ? 'error' : 'hint';
  }

  /** Does any extra processing that is required when handling the hints. */
  private _processHints() {
    this._validateHints();
    this._syncDescribedByIds();
  }

  /**
   * Ensure that there is a maximum of one of each "mat-hint" alignment specified. The hint
   * label specified set through the input is being considered as "start" aligned.
   *
   * This method is a noop if Angular runs in production mode.
   */
  private _validateHints() {
    if (isDevMode() && this._hintChildren) {
      let startHint: MatHint;
      let endHint: MatHint;
      this._hintChildren.forEach((hint: MatHint) => {
        if (hint.align === 'start') {
          if (startHint || this.hintLabel) {
            throw getMatFormFieldDuplicatedHintError('start');
          }
          startHint = hint;
        } else if (hint.align === 'end') {
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
        const startHint = this._hintChildren ?
          this._hintChildren.find(hint => hint.align === 'start') : null;
        const endHint = this._hintChildren ?
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
}
