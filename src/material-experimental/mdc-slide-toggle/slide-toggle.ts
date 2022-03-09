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
import {deprecated} from '@material/switch';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  BooleanInput,
  coerceBooleanProperty,
  coerceNumberProperty,
  NumberInput,
} from '@angular/cdk/coercion';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {ThemePalette} from '@angular/material-experimental/mdc-core';
import {FocusMonitor} from '@angular/cdk/a11y';
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
  multi: true,
};

/** Change event object emitted by a MatSlideToggle. */
export class MatSlideToggleChange {
  constructor(
    /** The source MatSlideToggle of the event. */
    public source: MatSlideToggle,
    /** The new `checked` value of the MatSlideToggle. */
    public checked: boolean,
  ) {}
}

@Component({
  selector: 'mat-slide-toggle',
  templateUrl: 'slide-toggle.html',
  styleUrls: ['slide-toggle.css'],
  host: {
    'class': 'mat-mdc-slide-toggle',
    '[id]': 'id',
    // Needs to be removed since it causes some a11y issues (see #21266).
    '[attr.tabindex]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.name]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[class.mat-primary]': 'color === "primary"',
    '[class.mat-accent]': 'color !== "primary" && color !== "warn"',
    '[class.mat-warn]': 'color === "warn"',
    '[class.mat-mdc-slide-toggle-focused]': '_focused',
    '[class.mat-mdc-slide-toggle-checked]': 'checked',
    '[class._mat-animation-noopable]': '_noopAnimations',
  },
  exportAs: 'matSlideToggle',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MAT_SLIDE_TOGGLE_VALUE_ACCESSOR],
})
export class MatSlideToggle implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private _onChange = (_: any) => {};
  private _onTouched = () => {};

  private _uniqueId: string = `mat-mdc-slide-toggle-${++nextUniqueId}`;
  private _required: boolean = false;
  private _checked: boolean = false;
  private _foundation: deprecated.MDCSwitchFoundation;
  private _adapter: deprecated.MDCSwitchAdapter = {
    addClass: className => this._switchElement.nativeElement.classList.add(className),
    removeClass: className => this._switchElement.nativeElement.classList.remove(className),
    setNativeControlChecked: checked => (this._checked = checked),
    setNativeControlDisabled: disabled => (this._disabled = disabled),
    setNativeControlAttr: (name, value) => {
      this._switchElement.nativeElement.setAttribute(name, value);
    },
  };

  /** Whether the slide toggle is currently focused. */
  _focused: boolean;

  /** Whether noop animations are enabled. */
  _noopAnimations: boolean;

  /** Unique ID for the label element. */
  _labelId = `mat-mdc-slide-toggle-label-${++nextUniqueId}`;

  /** The color palette  for this slide toggle. */
  @Input() color: ThemePalette;

  /** Name value will be applied to the button element if present. */
  @Input() name: string | null = null;

  /** A unique id for the slide-toggle button. If none is supplied, it will be auto-generated. */
  @Input() id: string = this._uniqueId;

  /** Tabindex for the input element. */
  @Input()
  get tabIndex(): number {
    return this._tabIndex;
  }
  set tabIndex(value: NumberInput) {
    this._tabIndex = coerceNumberProperty(value);
  }
  private _tabIndex: number;

  /** Whether the label should appear after or before the slide-toggle. Defaults to 'after'. */
  @Input() labelPosition: 'before' | 'after' = 'after';

  /** Used to set the aria-label attribute on the underlying button element. */
  @Input('aria-label') ariaLabel: string | null = null;

  /** Used to set the aria-labelledby attribute on the underlying button element. */
  @Input('aria-labelledby') ariaLabelledby: string | null = null;

  /** Used to set the aria-describedby attribute on the underlying button element. */
  @Input('aria-describedby') ariaDescribedby: string;

  /** Whether the slide-toggle is required. */
  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
  }

  /** Whether the slide-toggle element is checked or not. */
  @Input()
  get checked(): boolean {
    return this._checked;
  }
  set checked(value: BooleanInput) {
    this._checked = coerceBooleanProperty(value);

    if (this._foundation) {
      this._foundation.setChecked(this._checked);
    }
  }

  /** Whether to disable the ripple on this checkbox. */
  @Input()
  get disableRipple(): boolean {
    return this._disableRipple;
  }
  set disableRipple(disableRipple: BooleanInput) {
    this._disableRipple = coerceBooleanProperty(disableRipple);
  }
  private _disableRipple = false;

  /** Whether the slide toggle is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled: BooleanInput) {
    this._disabled = coerceBooleanProperty(disabled);

    if (this._foundation) {
      this._foundation.setDisabled(this._disabled);
    }
  }
  private _disabled = false;

  /** An event will be dispatched each time the slide-toggle changes its value. */
  @Output() readonly change: EventEmitter<MatSlideToggleChange> =
    new EventEmitter<MatSlideToggleChange>();

  /** Event will be dispatched each time the slide-toggle input is toggled. */
  @Output() readonly toggleChange: EventEmitter<void> = new EventEmitter<void>();

  /** Returns the unique id for the visual hidden button. */
  get buttonId(): string {
    return `${this.id || this._uniqueId}-button`;
  }

  /** Reference to the MDC switch element. */
  @ViewChild('switch') _switchElement: ElementRef<HTMLElement>;

  constructor(
    private _elementRef: ElementRef,
    private _focusMonitor: FocusMonitor,
    private _changeDetectorRef: ChangeDetectorRef,
    @Attribute('tabindex') tabIndex: string,
    @Inject(MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS)
    public defaults: MatSlideToggleDefaultOptions,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    this.tabIndex = parseInt(tabIndex) || 0;
    this.color = defaults.color || 'accent';
    this._noopAnimations = animationMode === 'NoopAnimations';
  }

  ngAfterViewInit() {
    const foundation = (this._foundation = new deprecated.MDCSwitchFoundation(this._adapter));
    foundation.setDisabled(this.disabled);
    foundation.setChecked(this.checked);

    this._focusMonitor.monitor(this._elementRef, true).subscribe(focusOrigin => {
      if (focusOrigin === 'keyboard' || focusOrigin === 'program') {
        this._focused = true;
      } else if (!focusOrigin) {
        // When a focused element becomes disabled, the browser *immediately* fires a blur event.
        // Angular does not expect events to be raised during change detection, so any state
        // change (such as a form control's ng-touched) will cause a changed-after-checked error.
        // See https://github.com/angular/angular/issues/17793. To work around this, we defer
        // telling the form control it has been touched until the next tick.
        Promise.resolve().then(() => {
          this._focused = false;
          this._onTouched();
          this._changeDetectorRef.markForCheck();
        });
      }
    });
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef);
    this._foundation?.destroy();
  }

  /** Method being called whenever the underlying button is clicked. */
  _handleClick(event: Event) {
    this.toggleChange.emit();
    this._foundation.handleChange(event);

    if (!this.defaults.disableToggleValue) {
      this.checked = !this.checked;
      this._onChange(this.checked);
      this.change.emit(new MatSlideToggleChange(this, this.checked));
    }
  }

  /** Implemented as part of ControlValueAccessor. */
  writeValue(value: any): void {
    this.checked = !!value;
    this._changeDetectorRef.markForCheck();
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
    this._switchElement.nativeElement.focus();
  }

  /** Toggles the checked state of the slide-toggle. */
  toggle(): void {
    this.checked = !this.checked;
    this._onChange(this.checked);
  }

  _getAriaLabelledBy() {
    if (this.ariaLabelledby) {
      return this.ariaLabelledby;
    }

    // Even though we have a `label` element with a `for` pointing to the button, we need the
    // `aria-labelledby`, because the button gets flagged as not having a label by tools like axe.
    return this.ariaLabel ? null : this._labelId;
  }
}
