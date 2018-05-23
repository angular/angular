/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {
  AfterContentInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation,
  NgZone,
  Optional,
  Inject,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  CanColor,
  CanDisable,
  CanDisableRipple,
  HammerInput,
  HasTabIndex,
  MatRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
  mixinTabIndex,
  RippleRef,
} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';

// Increasing integer for generating unique ids for slide-toggle components.
let nextUniqueId = 0;

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

// Boilerplate for applying mixins to MatSlideToggle.
/** @docs-private */
export class MatSlideToggleBase {
  constructor(public _elementRef: ElementRef) {}
}
export const _MatSlideToggleMixinBase =
  mixinTabIndex(mixinColor(mixinDisableRipple(mixinDisabled(MatSlideToggleBase)), 'accent'));

/** Represents a slidable "switch" toggle that can be moved between on and off. */
@Component({
  moduleId: module.id,
  selector: 'mat-slide-toggle',
  exportAs: 'matSlideToggle',
  host: {
    'class': 'mat-slide-toggle',
    '[id]': 'id',
    '[class.mat-checked]': 'checked',
    '[class.mat-disabled]': 'disabled',
    '[class.mat-slide-toggle-label-before]': 'labelPosition == "before"',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
  },
  templateUrl: 'slide-toggle.html',
  styleUrls: ['slide-toggle.css'],
  providers: [MAT_SLIDE_TOGGLE_VALUE_ACCESSOR],
  inputs: ['disabled', 'disableRipple', 'color', 'tabIndex'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSlideToggle extends _MatSlideToggleMixinBase implements OnDestroy, AfterContentInit,
    ControlValueAccessor, CanDisable, CanColor, HasTabIndex, CanDisableRipple {

  private onChange = (_: any) => {};
  private onTouched = () => {};

  private _uniqueId: string = `mat-slide-toggle-${++nextUniqueId}`;
  private _required: boolean = false;
  private _checked: boolean = false;

  /** Reference to the focus state ripple. */
  private _focusRipple: RippleRef | null;

  /** Whether the thumb is currently being dragged. */
  private _dragging = false;

  /** Previous checked state before drag started. */
  private _previousChecked: boolean;

  /** Width of the thumb bar of the slide-toggle. */
  private _thumbBarWidth: number;

  /** Percentage of the thumb while dragging. Percentage as fraction of 100. */
  private _dragPercentage: number;

  /** Reference to the thumb HTMLElement. */
  @ViewChild('thumbContainer') _thumbEl: ElementRef<HTMLElement>;

  /** Reference to the thumb bar HTMLElement. */
  @ViewChild('toggleBar') _thumbBarEl: ElementRef<HTMLElement>;

  /** Name value will be applied to the input element if present */
  @Input() name: string | null = null;

  /** A unique id for the slide-toggle input. If none is supplied, it will be auto-generated. */
  @Input() id: string = this._uniqueId;

  /** Whether the label should appear after or before the slide-toggle. Defaults to 'after' */
  @Input() labelPosition: 'before' | 'after' = 'after';

  /** Whether the slide-toggle element is checked or not */

  /** Used to set the aria-label attribute on the underlying input element. */
  @Input('aria-label') ariaLabel: string | null = null;

  /** Used to set the aria-labelledby attribute on the underlying input element. */
  @Input('aria-labelledby') ariaLabelledby: string | null = null;

  /** Whether the slide-toggle is required. */
  @Input()
  get required(): boolean { return this._required; }
  set required(value) { this._required = coerceBooleanProperty(value); }

  /** Whether the slide-toggle element is checked or not */
  @Input()
  get checked(): boolean { return this._checked; }
  set checked(value) {
    this._checked = coerceBooleanProperty(value);
    this._changeDetectorRef.markForCheck();
  }
  /** An event will be dispatched each time the slide-toggle changes its value. */
  @Output() readonly change: EventEmitter<MatSlideToggleChange> =
      new EventEmitter<MatSlideToggleChange>();

  /** Returns the unique id for the visual hidden input. */
  get inputId(): string { return `${this.id || this._uniqueId}-input`; }

  /** Reference to the underlying input element. */
  @ViewChild('input') _inputElement: ElementRef;

  /** Reference to the ripple directive on the thumb container. */
  @ViewChild(MatRipple) _ripple: MatRipple;

  constructor(elementRef: ElementRef,
              /**
               * @deprecated The `_platform` parameter to be removed.
               * @deletion-target 7.0.0
               */
              _platform: Platform,
              private _focusMonitor: FocusMonitor,
              private _changeDetectorRef: ChangeDetectorRef,
              @Attribute('tabindex') tabIndex: string,
              private _ngZone: NgZone,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string) {

    super(elementRef);
    this.tabIndex = parseInt(tabIndex) || 0;
  }

  ngAfterContentInit() {
    this._focusMonitor
      .monitor(this._inputElement.nativeElement)
      .subscribe(focusOrigin => this._onInputFocusChange(focusOrigin));
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._inputElement.nativeElement);
  }

  /** Method being called whenever the underlying input emits a change event. */
  _onChangeEvent(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the component's `change` output.
    event.stopPropagation();

    // Releasing the pointer over the `<label>` element while dragging triggers another
    // click event on the `<label>` element. This means that the checked state of the underlying
    // input changed unintentionally and needs to be changed back.
    if (this._dragging) {
      this._inputElement.nativeElement.checked = this.checked;
      return;
    }

    // Sync the value from the underlying input element with the component instance.
    this.checked = this._inputElement.nativeElement.checked;

    // Emit our custom change event only if the underlying input emitted one. This ensures that
    // there is no change event, when the checked state changes programmatically.
    this._emitChangeEvent();
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
    this.onChange = fn;
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /** Implemented as a part of ControlValueAccessor. */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._changeDetectorRef.markForCheck();
  }

  /** Focuses the slide-toggle. */
  focus(): void {
    this._focusMonitor.focusVia(this._inputElement.nativeElement, 'keyboard');
  }

  /** Toggles the checked state of the slide-toggle. */
  toggle(): void {
    this.checked = !this.checked;
  }

  /** Function is called whenever the focus changes for the input element. */
  private _onInputFocusChange(focusOrigin: FocusOrigin) {
    // TODO(paul): support `program`. See https://github.com/angular/material2/issues/9889
    if (!this._focusRipple && focusOrigin === 'keyboard') {
      // For keyboard focus show a persistent ripple as focus indicator.
      this._focusRipple = this._ripple.launch(0, 0, {persistent: true});
    } else if (!focusOrigin) {
      this.onTouched();

      // Fade out and clear the focus ripple if one is currently present.
      if (this._focusRipple) {
        this._focusRipple.fadeOut();
        this._focusRipple = null;
      }
    }
  }

  /**
   * Emits a change event on the `change` output. Also notifies the FormControl about the change.
   */
  private _emitChangeEvent() {
    this.onChange(this.checked);
    this.change.emit(new MatSlideToggleChange(this, this.checked));
  }

  /** Retrieves the percentage of thumb from the moved distance. Percentage as fraction of 100. */
  private _getDragPercentage(distance: number) {
    let percentage = (distance / this._thumbBarWidth) * 100;

    // When the toggle was initially checked, then we have to start the drag at the end.
    if (this._previousChecked) {
      percentage += 100;
    }

    return Math.max(0, Math.min(percentage, 100));
  }

  _onDragStart() {
    if (!this.disabled && !this._dragging) {
      const thumbEl = this._thumbEl.nativeElement;
      this._thumbBarWidth = this._thumbBarEl.nativeElement.clientWidth - thumbEl.clientWidth;
      thumbEl.classList.add('mat-dragging');

      this._previousChecked = this.checked;
      this._dragging = true;
    }
  }

  _onDrag(event: HammerInput) {
    if (this._dragging) {
      this._dragPercentage = this._getDragPercentage(event.deltaX);
      // Calculate the moved distance based on the thumb bar width.
      const dragX = (this._dragPercentage / 100) * this._thumbBarWidth;
      this._thumbEl.nativeElement.style.transform = `translate3d(${dragX}px, 0, 0)`;
    }
  }

  _onDragEnd() {
    if (this._dragging) {
      const newCheckedValue = this._dragPercentage > 50;

      if (newCheckedValue !== this.checked) {
        this.checked = newCheckedValue;
        this._emitChangeEvent();
      }

      // The drag should be stopped outside of the current event handler, otherwise the
      // click event will be fired before it and will revert the drag change.
      this._ngZone.runOutsideAngular(() => setTimeout(() => {
        if (this._dragging) {
          this._dragging = false;
          this._thumbEl.nativeElement.classList.remove('mat-dragging');

          // Reset the transform because the component will take care
          // of the thumb position after drag.
          this._thumbEl.nativeElement.style.transform = '';
        }
      }));
    }
  }

  /** Method being called whenever the label text changes. */
  _onLabelTextChange() {
    // This method is getting called whenever the label of the slide-toggle changes.
    // Since the slide-toggle uses the OnPush strategy we need to notify it about the change
    // that has been recognized by the cdkObserveContent directive.
    this._changeDetectorRef.markForCheck();
  }
}
