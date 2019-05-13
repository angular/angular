/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  AfterViewInit,
  OnDestroy,
  forwardRef,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  Attribute,
  Inject,
  Optional,
} from '@angular/core';
import {MDCSwitchAdapter, MDCSwitchFoundation} from '@material/switch';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {ThemePalette, RippleAnimationConfig} from '@angular/material/core';
import {
  MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS,
  MatSlideToggleDefaultOptions,
} from './slide-toggle-config';

// Increasing integer for generating unique ids for slide-toggle components.
let nextUniqueId = 0;

/** @docs-private */
export const MAT_SLIDE_TOGGLE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatSlideToggle),
  multi: true
};

/** Change event object emitted by a MatSlideToggle. */
export class MatSlideToggleChange {
  constructor(
    /** The source MatSlideToggle of the event. */
    public source: MatSlideToggle,
    /** The new `checked` value of the MatSlideToggle. */
    public checked: boolean) { }
}

@Component({
  moduleId: module.id,
  selector: 'mat-slide-toggle',
  templateUrl: 'slide-toggle.html',
  styleUrls: ['slide-toggle.css'],
  host: {
    'class': 'mat-mdc-slide-toggle',
    '[id]': 'id',
    '[attr.tabindex]': 'null',
    '[class.mat-primary]': 'color == "primary"',
    '[class.mat-accent]': 'color == "accent"',
    '[class.mat-warn]': 'color == "warn"',
    '[class.mat-mdc-slide-toggle-focused]': '_focused',
    '[class.mat-mdc-slide-toggle-checked]': 'checked',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
    '(focus)': '_inputElement.nativeElement.focus()',
  },
  exportAs: 'matSlideToggle',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MAT_SLIDE_TOGGLE_VALUE_ACCESSOR],

})
export class MatSlideToggle implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private _onChange = (_: any) => {};
  private _onTouched = () => {};

  private _uniqueId: string = `mat-slide-toggle-${++nextUniqueId}`;
  private _required: boolean = false;
  private _checked: boolean = false;
  private _foundation: MDCSwitchFoundation;
  private _adapter: MDCSwitchAdapter = {
    addClass: (className) => {
      this._toggleClass(className, true);
    },
    removeClass: (className) => {
      this._toggleClass(className, false);
    },
    setNativeControlChecked: (checked) => {
      this._checked = checked;
    },
    setNativeControlDisabled: (disabled) => {
      this._disabled = disabled;
    },
  };

  /** Whether the slide toggle is currently focused. */
  _focused: boolean;

  /** The set of classes that should be applied to the native input. */
  _classes: {[key: string]: boolean} = {'mdc-switch': true};

  /** Configuration for the underlying ripple. */
  _rippleAnimation: RippleAnimationConfig = {
    // TODO(crisbeto): Use the MDC constants once they are exported separately from the
    // foundation. Grabbing them off the foundation prevents the foundation class from being
    // tree-shaken. There is an open PR for this:
    // https://github.com/material-components/material-components-web/pull/4593
    enterDuration: 225 /* MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS */,
    exitDuration: 150 /* MDCRippleFoundation.numbers.FG_DEACTIVATION_MS */,
  };

  /** The color palette  for this slide toggle. */
  @Input() color: ThemePalette = 'accent';

  /** Name value will be applied to the input element if present. */
  @Input() name: string | null = null;

  /** A unique id for the slide-toggle input. If none is supplied, it will be auto-generated. */
  @Input() id: string = this._uniqueId;

  /** Tabindex for the input element. */
  @Input()
  get tabIndex(): number { return this._tabIndex; }
  set tabIndex(value: number) {
    this._tabIndex = coerceNumberProperty(value);
  }
  private _tabIndex: number;

  /** Whether the label should appear after or before the slide-toggle. Defaults to 'after'. */
  @Input() labelPosition: 'before' | 'after' = 'after';

  /** Used to set the aria-label attribute on the underlying input element. */
  @Input('aria-label') ariaLabel: string | null = null;

  /** Used to set the aria-labelledby attribute on the underlying input element. */
  @Input('aria-labelledby') ariaLabelledby: string | null = null;

  /** Whether the slide-toggle is required. */
  @Input()
  get required(): boolean { return this._required; }
  set required(value) { this._required = coerceBooleanProperty(value); }

  /** Whether the slide-toggle element is checked or not. */
  @Input()
  get checked(): boolean { return this._checked; }
  set checked(value) {
    this._checked = coerceBooleanProperty(value);

    if (this._foundation) {
      this._foundation.setChecked(this._checked);
    }

    this._changeDetectorRef.markForCheck();
  }

  /** Whether to disable the ripple on this checkbox. */
  @Input()
  get disableRipple(): boolean {
    return this._disableRipple;
  }
  set disableRipple(disableRipple: boolean) {
    this._disableRipple = coerceBooleanProperty(disableRipple);
  }
  private _disableRipple = false;

  /** Whether the slide toggle is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled) {
    this._disabled = coerceBooleanProperty(disabled);

    if (this._foundation) {
      this._foundation.setDisabled(this._disabled);
    }

    this._changeDetectorRef.markForCheck();
  }
  private _disabled = false;

  /** An event will be dispatched each time the slide-toggle changes its value. */
  @Output() readonly change: EventEmitter<MatSlideToggleChange> =
      new EventEmitter<MatSlideToggleChange>();

  /** Event will be dispatched each time the slide-toggle input is toggled. */
  @Output() readonly toggleChange: EventEmitter<void> = new EventEmitter<void>();

  /**
   * An event will be dispatched each time the slide-toggle is dragged.
   * This event is always emitted when the user drags the slide toggle to make a change greater
   * than 50%. It does not mean the slide toggle's value is changed. The event is not emitted when
   * the user toggles the slide toggle to change its value.
   * @deprecated No longer being used.
   * @breaking-change 9.0.0
   */
  @Output() readonly dragChange: EventEmitter<void> = new EventEmitter<void>();

  /** Returns the unique id for the visual hidden input. */
  get inputId(): string { return `${this.id || this._uniqueId}-input`; }

  /** Reference to the underlying input element. */
  @ViewChild('input', {static: false}) _inputElement: ElementRef<HTMLInputElement>;

  constructor(private _changeDetectorRef: ChangeDetectorRef,
              @Attribute('tabindex') tabIndex: string,
              @Inject(MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS)
                  public defaults: MatSlideToggleDefaultOptions,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string) {
    this.tabIndex = parseInt(tabIndex) || 0;
  }

  ngAfterViewInit() {
    const foundation = this._foundation = new MDCSwitchFoundation(this._adapter);
    foundation.setDisabled(this.disabled);
    foundation.setChecked(this.checked);
  }

  ngOnDestroy() {
    if (this._foundation) {
      this._foundation.destroy();
    }
  }

  /** Method being called whenever the underlying input emits a change event. */
  _onChangeEvent(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the component's `change` output.
    event.stopPropagation();
    this.toggleChange.emit();
    this._foundation.handleChange(event);

    // When the slide toggle's config disabled toggle change event by setting
    // `disableToggleValue: true`, the slide toggle's value does not change,
    // and the checked state of the underlying input needs to be changed back.
    if (this.defaults.disableToggleValue) {
      this._inputElement.nativeElement.checked = this.checked;
      return;
    }

    // Sync the value from the underlying input element with the component instance.
    this.checked = this._inputElement.nativeElement.checked;

    // Emit our custom change event only if the underlying input emitted one. This ensures that
    // there is no change event, when the checked state changes programmatically.
    this._onChange(this.checked);
    this.change.emit(new MatSlideToggleChange(this, this.checked));
  }

  /** Method being called whenever the slide-toggle has been clicked. */
  _onInputClick(event: Event) {
    // We have to stop propagation for click events on the visual hidden input element.
    // By default, when a user clicks on a label element, a generated click event will be
    // dispatched on the associated input element. Since we are using a label element as our
    // root container, the click event on the `slide-toggle` will be executed twice.
    // The real click event will bubble up, and the generated click event also tries to bubble up.
    // This will lead to multiple click events.
    // Preventing bubbling for the second event will solve that issue.
    event.stopPropagation();
  }

  /** Implemented as part of ControlValueAccessor. */
  writeValue(value: any): void {
    this.checked = !!value;
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  /** Implemented as a part of ControlValueAccessor. */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._changeDetectorRef.markForCheck();
  }

  /** Focuses the slide-toggle. */
  focus(): void {
    this._inputElement.nativeElement.focus();
  }

  /** Toggles the checked state of the slide-toggle. */
  toggle(): void {
    this.checked = !this.checked;
    this._onChange(this.checked);
  }

  /** Handles blur events on the native input. */
  _onBlur() {
    // When a focused element becomes disabled, the browser *immediately* fires a blur event.
    // Angular does not expect events to be raised during change detection, so any state change
    // (such as a form control's 'ng-touched') will cause a changed-after-checked error.
    // See https://github.com/angular/angular/issues/17793. To work around this, we defer
    // telling the form control it has been touched until the next tick.
    Promise.resolve().then(() => {
      this._focused = false;
      this._onTouched();
      this._changeDetectorRef.markForCheck();
    });
  }

  /** Toggles a class on the switch element. */
  private _toggleClass(cssClass: string, active: boolean) {
    this._classes[cssClass] = active;
    this._changeDetectorRef.markForCheck();
  }
}
