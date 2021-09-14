/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directionality} from '@angular/cdk/bidi';
import {Platform} from '@angular/cdk/platform';
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
  InjectionToken,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {ThemePalette} from '@angular/material-experimental/mdc-core';
import {
  getMatFormFieldDuplicatedHintError,
  getMatFormFieldMissingControlError,
  MAT_FORM_FIELD,
  matFormFieldAnimations,
  MatFormFieldControl,
} from '@angular/material/form-field';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {
  MDCTextFieldAdapter,
  MDCTextFieldFoundation,
  numbers as mdcTextFieldNumbers
} from '@material/textfield';
import {merge, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MAT_ERROR, MatError} from './directives/error';
import {MatFormFieldFloatingLabel} from './directives/floating-label';
import {MatHint} from './directives/hint';
import {MatLabel} from './directives/label';
import {MatFormFieldLineRipple} from './directives/line-ripple';
import {MatFormFieldNotchedOutline} from './directives/notched-outline';
import {MAT_PREFIX, MatPrefix} from './directives/prefix';
import {MAT_SUFFIX, MatSuffix} from './directives/suffix';
import {DOCUMENT} from '@angular/common';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';

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
  floatLabel?: FloatLabelType;
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

/**
 * Default transform for docked floating labels in a MDC text-field. This value has been
 * extracted from the MDC text-field styles because we programmatically modify the docked
 * label transform, but do not want to accidentally discard the default label transform.
 */
const FLOATING_LABEL_DEFAULT_DOCKED_TRANSFORM = `translateY(-50%)`;

/**
 * Horizontal padding in pixels used by the MDC for the wrapper containing infix.
 * This value is extracted from MDC's Sass variables. See `$padding-horizontal`.
 */
const WRAPPER_HORIZONTAL_PADDING = 16;

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
    '[class.mat-mdc-form-field-has-icon-prefix]': '_hasIconPrefix',
    '[class.mat-mdc-form-field-has-icon-suffix]': '_hasIconSuffix',

    // Note that these classes reuse the same names as the non-MDC version, because they can be
    // considered a public API since custom form controls may use them to style themselves.
    // See https://github.com/angular/components/pull/20502#discussion_r486124901.
    '[class.mat-form-field-invalid]': '_control.errorState',
    '[class.mat-form-field-disabled]': '_control.disabled',
    '[class.mat-form-field-autofilled]': '_control.autofilled',
    '[class.mat-form-field-no-animations]': '_animationMode === "NoopAnimations"',
    '[class.mat-form-field-appearance-fill]': 'appearance == "fill"',
    '[class.mat-form-field-appearance-outline]': 'appearance == "outline"',
    '[class.mat-form-field-hide-placeholder]': '_hasFloatingLabel() && !_shouldLabelFloat()',
    '[class.mat-focused]': '_control.focused',
    '[class.mat-primary]': 'color !== "accent" && color !== "warn"',
    '[class.mat-accent]': 'color === "accent"',
    '[class.mat-warn]': 'color === "warn"',
    '[class.ng-untouched]': '_shouldForward("untouched")',
    '[class.ng-touched]': '_shouldForward("touched")',
    '[class.ng-pristine]': '_shouldForward("pristine")',
    '[class.ng-dirty]': '_shouldForward("dirty")',
    '[class.ng-valid]': '_shouldForward("valid")',
    '[class.ng-invalid]': '_shouldForward("invalid")',
    '[class.ng-pending]': '_shouldForward("pending")',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: MAT_FORM_FIELD, useExisting: MatFormField},
  ]
})
export class MatFormField implements AfterViewInit, OnDestroy, AfterContentChecked,
    AfterContentInit {
  @ViewChild('textField') _textField: ElementRef<HTMLElement>;
  @ViewChild('iconPrefixContainer') _iconPrefixContainer: ElementRef<HTMLElement>;
  @ViewChild('textPrefixContainer') _textPrefixContainer: ElementRef<HTMLElement>;
  @ViewChild(MatFormFieldFloatingLabel) _floatingLabel: MatFormFieldFloatingLabel|undefined;
  @ViewChild(MatFormFieldNotchedOutline) _notchedOutline: MatFormFieldNotchedOutline|undefined;
  @ViewChild(MatFormFieldLineRipple) _lineRipple: MatFormFieldLineRipple|undefined;

  @ContentChild(MatLabel) _labelChildNonStatic: MatLabel|undefined;
  @ContentChild(MatLabel, {static: true}) _labelChildStatic: MatLabel|undefined;
  @ContentChild(MatFormFieldControl) _formFieldControl: MatFormFieldControl<any>;
  @ContentChildren(MAT_PREFIX, {descendants: true}) _prefixChildren: QueryList<MatPrefix>;
  @ContentChildren(MAT_SUFFIX, {descendants: true}) _suffixChildren: QueryList<MatSuffix>;
  @ContentChildren(MAT_ERROR, {descendants: true}) _errorChildren: QueryList<MatError>;
  @ContentChildren(MatHint, {descendants: true}) _hintChildren: QueryList<MatHint>;

  /** Whether the required marker should be hidden. */
  @Input()
  get hideRequiredMarker(): boolean { return this._hideRequiredMarker; }
  set hideRequiredMarker(value: boolean) {
    this._hideRequiredMarker = coerceBooleanProperty(value);
  }
  private _hideRequiredMarker: boolean;

  /** The color palette for the form-field. */
  @Input() color: ThemePalette = 'primary';

  /** Whether the label should always float or float as the user types. */
  @Input()
  get floatLabel(): FloatLabelType {
    return this._floatLabel || this._defaults?.floatLabel || DEFAULT_FLOAT_LABEL;
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
    const oldValue = this._appearance;
    this._appearance = value || (this._defaults && this._defaults.appearance) || DEFAULT_APPEARANCE;
    if (this._appearance === 'outline' && this._appearance !== oldValue) {
      this._refreshOutlineNotchWidth();

      // If the appearance has been switched to `outline`, the label offset needs to be updated.
      // The update can happen once the view has been re-checked, but not immediately because
      // the view has not been updated and the notched-outline floating label is not present.
      this._needsOutlineLabelOffsetUpdateOnStable = true;
    }
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

  _hasIconPrefix = false;
  _hasTextPrefix = false;
  _hasIconSuffix = false;
  _hasTextSuffix = false;

  // Unique id for the internal form field label.
  readonly _labelId = `mat-mdc-form-field-label-${nextUniqueId++}`;

  // Unique id for the hint label.
  readonly _hintLabelId = `mat-mdc-hint-${nextUniqueId++}`;

  /** State of the mat-hint and mat-error animations. */
  _subscriptAnimationState = '';

  /** Width of the outline notch. */
  _outlineNotchWidth = 0;

  /** Gets the current form field control */
  get _control(): MatFormFieldControl<any> {
    return this._explicitFormFieldControl || this._formFieldControl;
  }
  set _control(value) { this._explicitFormFieldControl = value; }

  private _destroyed = new Subject<void>();
  private _isFocused: boolean|null = null;
  private _explicitFormFieldControl: MatFormFieldControl<any>;
  private _foundation: MDCTextFieldFoundation;
  private _needsOutlineLabelOffsetUpdateOnStable = false;
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

    // MDC by default updates the notched-outline whenever the text-field receives focus, or
    // is being blurred. It also computes the label width every time the notch is opened or
    // closed. This works fine in the standard MDC text-field, but not in Angular where the
    // floating label could change through interpolation. We want to be able to update the
    // notched outline whenever the label content changes. Additionally, relying on focus or
    // blur to open and close the notch does not work for us since abstract form-field controls
    // have the ability to control the floating label state (i.e. `shouldLabelFloat`), and we
    // want to update the notch whenever the `_shouldLabelFloat()` value changes.
    getLabelWidth: () => 0,

    // We don't use `setLabelRequired` as it relies on a mutation observer for determining
    // when the `required` state changes. This is not reliable and flexible enough for
    // our form field, as we support custom controls and detect the required state through
    // a public property in the abstract form control.
    setLabelRequired: () => {},
    notchOutline: () => {},
    closeOutline: () => {},

    activateLineRipple: () => this._lineRipple && this._lineRipple.activate(),
    deactivateLineRipple: () => this._lineRipple && this._lineRipple.deactivate(),

    // The foundation tries to register events on the input. This is not matching
    // our concept of abstract form field controls. We handle each event manually
    // in "stateChanges" based on the form-field control state. The following events
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

    // Used by foundation to dynamically remove aria-describedby when the hint text
    // is shown only on invalid state, which should not be applicable here.
    setInputAttr: () => undefined,
    removeInputAttr: () => undefined,
  };

  constructor(private _elementRef: ElementRef,
              private _changeDetectorRef: ChangeDetectorRef,
              private _ngZone: NgZone,
              private _dir: Directionality,
              private _platform: Platform,
              @Optional() @Inject(MAT_FORM_FIELD_DEFAULT_OPTIONS)
              private _defaults?: MatFormFieldDefaultOptions,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string,
              @Inject(DOCUMENT) private _document?: any) {
    if (_defaults && _defaults.appearance) {
      this.appearance = _defaults.appearance;
    }

    this._hideRequiredMarker = _defaults?.hideRequiredMarker ?? false;
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

    // By default, the foundation determines the validity of the text-field from the
    // specified native input. Since we don't pass a native input to the foundation because
    // abstract form controls are not necessarily consisting of an input, we handle the
    // text-field validity through the abstract form-field control state.
    this._foundation.isValid = () => !this._control.errorState;

    // Initial focus state sync. This happens rarely, but we want to account for
    // it in case the form-field control has "focused" set to true on init.
    this._updateFocusState();
    // Initial notch width update. This is needed in case the text-field label floats
    // on initialization, and renders inside of the notched outline.
    this._refreshOutlineNotchWidth();
    // Make sure fonts are loaded before calculating the width.
    // zone.js currently doesn't patch the FontFaceSet API so two calls to
    // _refreshOutlineNotchWidth is needed for this to work properly in async tests.
    // Furthermore if the font takes a long time to load we want the outline notch to be close
    // to the correct width from the start then correct itself when the fonts load.
    if (this._document?.fonts?.ready) {
      this._document.fonts.ready.then(() => {
        this._refreshOutlineNotchWidth();
        this._changeDetectorRef.markForCheck();
      });
    } else {
      // FontFaceSet is not supported in IE
      setTimeout(() => this._refreshOutlineNotchWidth(), 100);
    }
    // Enable animations now. This ensures we don't animate on initial render.
    this._subscriptAnimationState = 'enter';
    // Because the above changes a value used in the template after it was checked, we need
    // to trigger CD or the change might not be reflected if there is no other CD scheduled.
    this._changeDetectorRef.detectChanges();
  }

  ngAfterContentInit() {
    this._assertFormFieldControl();
    this._initializeControl();
    this._initializeSubscript();
    this._initializePrefixAndSuffix();
    this._initializeOutlineLabelOffsetSubscriptions();
  }

  ngAfterContentChecked() {
    this._assertFormFieldControl();
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * Gets the id of the label element. If no label is present, returns `null`.
   */
  getLabelId(): string|null {
    return this._hasFloatingLabel() ? this._labelId : null;
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

  private _checkPrefixAndSuffixTypes() {
    this._hasIconPrefix = !!this._prefixChildren.find(p => !p._isText);
    this._hasTextPrefix = !!this._prefixChildren.find(p => p._isText);
    this._hasIconSuffix = !!this._suffixChildren.find(s => !s._isText);
    this._hasTextSuffix = !!this._suffixChildren.find(s => s._isText);
  }

  /** Initializes the prefix and suffix containers. */
  private _initializePrefixAndSuffix() {
    this._checkPrefixAndSuffixTypes();
    // Mark the form-field as dirty whenever the prefix or suffix children change. This
    // is necessary because we conditionally display the prefix/suffix containers based
    // on whether there is projected content.
    merge(this._prefixChildren.changes, this._suffixChildren.changes)
      .subscribe(() => {
        this._checkPrefixAndSuffixTypes();
        this._changeDetectorRef.markForCheck();
      });
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
    if (!this._control && (typeof ngDevMode === 'undefined' || ngDevMode)) {
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

  /**
   * The floating label in the docked state needs to account for prefixes. The horizontal offset
   * is calculated whenever the appearance changes to `outline`, the prefixes change, or when the
   * form-field is added to the DOM. This method sets up all subscriptions which are needed to
   * trigger the label offset update. In general, we want to avoid performing measurements often,
   * so we rely on the `NgZone` as indicator when the offset should be recalculated, instead of
   * checking every change detection cycle.
   */
  private _initializeOutlineLabelOffsetSubscriptions() {
    // Whenever the prefix changes, schedule an update of the label offset.
    this._prefixChildren.changes
      .subscribe(() => this._needsOutlineLabelOffsetUpdateOnStable = true);

    // Note that we have to run outside of the `NgZone` explicitly, in order to avoid
    // throwing users into an infinite loop if `zone-patch-rxjs` is included.
    this._ngZone.runOutsideAngular(() => {
      this._ngZone.onStable.pipe(takeUntil(this._destroyed)).subscribe(() => {
        if (this._needsOutlineLabelOffsetUpdateOnStable) {
          this._needsOutlineLabelOffsetUpdateOnStable = false;
          this._updateOutlineLabelOffset();
        }
      });
    });

    this._dir.change.pipe(takeUntil(this._destroyed))
      .subscribe(() => this._needsOutlineLabelOffsetUpdateOnStable = true);
  }

  /** Whether the floating label should always float or not. */
  _shouldAlwaysFloat() {
    return this.floatLabel === 'always';
  }

  _hasOutline() {
    return this.appearance === 'outline';
  }

  /**
   * Whether the label should display in the infix. Labels in the outline appearance are
   * displayed as part of the notched-outline and are horizontally offset to account for
   * form-field prefix content. This won't work in server side rendering since we cannot
   * measure the width of the prefix container. To make the docked label appear as if the
   * right offset has been calculated, we forcibly render the label inside the infix. Since
   * the label is part of the infix, the label cannot overflow the prefix content.
   */
  _forceDisplayInfixLabel() {
    return !this._platform.isBrowser && this._prefixChildren.length && !this._shouldLabelFloat();
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

  /** Refreshes the width of the outline-notch, if present. */
  _refreshOutlineNotchWidth() {
    if (!this._hasOutline() || !this._floatingLabel) {
      return;
    }
    // The outline notch should be based on the label width, but needs to respect the scaling
    // applied to the label if it actively floats. Since the label always floats when the notch
    // is open, the MDC text-field floating label scaling is respected in notch width calculation.
    this._outlineNotchWidth = this._floatingLabel.getWidth() * mdcTextFieldNumbers.LABEL_SCALE;
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
    if (this._hintChildren && (typeof ngDevMode === 'undefined' || ngDevMode)) {
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

      // TODO(wagnermaciel): Remove the type check when we find the root cause of this bug.
      if (this._control.userAriaDescribedBy &&
        typeof this._control.userAriaDescribedBy === 'string') {
        ids.push(...this._control.userAriaDescribedBy.split(' '));
      }

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
        ids.push(...this._errorChildren.map(error => error.id));
      }

      this._control.setDescribedByIds(ids);
    }
  }

  /**
   * Updates the horizontal offset of the label in the outline appearance. In the outline
   * appearance, the notched-outline and label are not relative to the infix container because
   * the outline intends to surround prefixes, suffixes and the infix. This means that the
   * floating label by default overlaps prefixes in the docked state. To avoid this, we need to
   * horizontally offset the label by the width of the prefix container. The MDC text-field does
   * not need to do this because they use a fixed width for prefixes. Hence, they can simply
   * incorporate the horizontal offset into their default text-field styles.
   */
  private _updateOutlineLabelOffset() {
    if (!this._platform.isBrowser || !this._hasOutline() || !this._floatingLabel) {
      return;
    }
    const floatingLabel = this._floatingLabel.element;
    // If no prefix is displayed, reset the outline label offset from potential
    // previous label offset updates.
    if (!(this._iconPrefixContainer || this._textPrefixContainer)) {
      floatingLabel.style.transform = '';
      return;
    }
    // If the form-field is not attached to the DOM yet (e.g. in a tab), we defer
    // the label offset update until the zone stabilizes.
    if (!this._isAttachedToDom()) {
      this._needsOutlineLabelOffsetUpdateOnStable = true;
      return;
    }
    const iconPrefixContainer = this._iconPrefixContainer?.nativeElement;
    const textPrefixContainer = this._textPrefixContainer?.nativeElement;
    const iconPrefixContainerWidth = iconPrefixContainer?.getBoundingClientRect().width ?? 0;
    const textPrefixContainerWidth = textPrefixContainer?.getBoundingClientRect().width ?? 0;
    // If the directionality is RTL, the x-axis transform needs to be inverted. This
    // is because `transformX` does not change based on the page directionality.
    const labelHorizontalOffset =
      (this._dir.value === 'rtl' ? -1 : 1) * (
        // If there's an icon prefix, we subtract the default horizontal padding as we
        // reset the horizontal padding in CSS too.
          (iconPrefixContainer ? iconPrefixContainerWidth - WRAPPER_HORIZONTAL_PADDING : 0) +
          textPrefixContainerWidth
      );

    // Update the transform the floating label to account for the prefix container. Note
    // that we do not want to overwrite the default transform for docked floating labels.
    floatingLabel.style.transform =
        `${FLOATING_LABEL_DEFAULT_DOCKED_TRANSFORM} translateX(${labelHorizontalOffset}px)`;
  }

  /** Checks whether the form field is attached to the DOM. */
  private _isAttachedToDom(): boolean {
    const element: HTMLElement = this._elementRef.nativeElement;
    if (element.getRootNode) {
      const rootNode = element.getRootNode();
      // If the element is inside the DOM the root node will be either the document
      // or the closest shadow root, otherwise it'll be the element itself.
      return rootNode && rootNode !== element;
    }
    // Otherwise fall back to checking if it's in the document. This doesn't account for
    // shadow DOM, however browser that support shadow DOM should support `getRootNode` as well.
    return document.documentElement!.contains(element);
  }

  static ngAcceptInputType_hideRequiredMarker: BooleanInput;
}
