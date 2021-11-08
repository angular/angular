/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs';
import {Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Input} from '@angular/core';
import {hasModifierKey} from '@angular/cdk/keycodes';
import {EDIT_PANE_SELECTOR} from './constants';
import {closest} from './polyfill';
import {EditRef} from './edit-ref';

/** Options for what do to when the user clicks outside of an edit lens. */
export type PopoverEditClickOutBehavior = 'close' | 'submit' | 'noop';

/**
 * A directive that attaches to a form within the edit lens.
 * It coordinates the form state with the table-wide edit system and handles
 * closing the edit lens when the form is submitted or the user clicks
 * out.
 */
@Directive({
  selector: 'form[cdkEditControl]',
  inputs: [
    'clickOutBehavior: cdkEditControlClickOutBehavior',
    'preservedFormValue: cdkEditControlPreservedFormValue',
    'ignoreSubmitUnlessValid: cdkEditControlIgnoreSubmitUnlessValid',
  ],
  outputs: ['preservedFormValueChange: cdkEditControlPreservedFormValueChange'],
  providers: [EditRef],
  host: {
    '(ngSubmit)': 'handleFormSubmit()',
    '(document:click)': 'handlePossibleClickOut($event)',
    '(keydown)': '_handleKeydown($event)',
  },
})
export class CdkEditControl<FormValue> implements OnDestroy, OnInit {
  protected readonly destroyed = new Subject<void>();

  /**
   * Specifies what should happen when the user clicks outside of the edit lens.
   * The default behavior is to close the lens without submitting the form.
   */
  clickOutBehavior: PopoverEditClickOutBehavior = 'close';

  /**
   * A two-way binding for storing unsubmitted form state. If not provided
   * then form state will be discarded on close. The PeristBy directive is offered
   * as a convenient shortcut for these bindings.
   */
  preservedFormValue?: FormValue;
  readonly preservedFormValueChange = new EventEmitter<FormValue>();

  /**
   * Determines whether the lens will close on form submit if the form is not in a valid
   * state. By default the lens will remain open.
   */
  ignoreSubmitUnlessValid = true;

  constructor(protected readonly elementRef: ElementRef, readonly editRef: EditRef<FormValue>) {}

  ngOnInit(): void {
    this.editRef.init(this.preservedFormValue);
    this.editRef.finalValue.subscribe(this.preservedFormValueChange);
    this.editRef.blurred.subscribe(() => this._handleBlur());
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
   * Called when the form submits. If ignoreSubmitUnlessValid is true, checks
   * the form for validity before proceeding.
   * Updates the revert state with the latest submitted value then closes the edit.
   */
  handleFormSubmit(): void {
    if (this.ignoreSubmitUnlessValid && !this.editRef.isValid()) {
      return;
    }

    this.editRef.updateRevertValue();
    this.editRef.close();
  }

  /** Called on Escape keyup. Closes the edit. */
  close(): void {
    // todo - allow this behavior to be customized as well, such as calling
    // reset before close
    this.editRef.close();
  }

  /**
   * Called on click anywhere in the document.
   * If the click was outside of the lens, trigger the specified click out behavior.
   */
  handlePossibleClickOut(evt: Event): void {
    if (closest(evt.target, EDIT_PANE_SELECTOR)) {
      return;
    }
    switch (this.clickOutBehavior) {
      case 'submit':
        // Manually cause the form to submit before closing.
        this._triggerFormSubmit();
        this.editRef.close();
        break;
      case 'close':
        this.editRef.close();
        break;
      default:
        break;
    }
  }

  _handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && !hasModifierKey(event)) {
      this.close();
      event.preventDefault();
    }
  }

  /** Triggers submit on tab out if clickOutBehavior is 'submit'. */
  private _handleBlur(): void {
    if (this.clickOutBehavior === 'submit') {
      // Manually cause the form to submit before closing.
      this._triggerFormSubmit();
    }
  }

  private _triggerFormSubmit() {
    this.elementRef.nativeElement!.dispatchEvent(new Event('submit'));
  }
}

/** Reverts the form to its initial or previously submitted state on click. */
@Directive({
  selector: 'button[cdkEditRevert]',
  host: {
    'type': 'button', // Prevents accidental form submits.
    '(click)': 'revertEdit()',
  },
})
export class CdkEditRevert<FormValue> {
  /** Type of the button. Defaults to `button` to avoid accident form submits. */
  @Input() type: string = 'button';

  constructor(protected readonly editRef: EditRef<FormValue>) {}

  revertEdit(): void {
    this.editRef.reset();
  }
}

/** Closes the lens on click. */
@Directive({
  selector: '[cdkEditClose]',
  host: {
    '(click)': 'closeEdit()',
    '(keydown.enter)': 'closeEdit()',
    '(keydown.space)': 'closeEdit()',
  },
})
export class CdkEditClose<FormValue> {
  constructor(
    protected readonly elementRef: ElementRef<HTMLElement>,
    protected readonly editRef: EditRef<FormValue>,
  ) {
    const nativeElement = elementRef.nativeElement;

    // Prevent accidental form submits.
    if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
      nativeElement.setAttribute('type', 'button');
    }
  }

  closeEdit(): void {
    // Note that we use `click` here, rather than a keyboard event, because some screen readers
    // will emit a fake click event instead of an enter keyboard event on buttons. For the keyboard
    // events we use `keydown`, rather than `keyup`, because we use `keydown` to open the overlay
    // as well. If we were to use `keyup`, the user could end up opening and closing within
    // the same event sequence if focus was moved quickly.
    this.editRef.close();
  }
}
