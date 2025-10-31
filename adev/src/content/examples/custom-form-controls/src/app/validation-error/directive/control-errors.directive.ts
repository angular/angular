// #docregion
import {
  ComponentRef,
  Directive,
  ElementRef,
  inject,
  OnInit,
  ViewContainerRef,
  input,
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {merge, fromEvent} from 'rxjs';

import {ValidationError} from '../component/validation-error';
import {FORM_ERRORS} from '../token/control-error.token';

// #docregion directive
@Directive({
  selector: '[formControl], [formControlName]',
})
export class ControlErrorsDirective implements OnInit {
  ref!: ComponentRef<ValidationError>;

  // Allow custom error messages per control
  customErrors = input<Record<string, string>>({});

  private vcr = inject(ViewContainerRef);
  private elementRef = inject(ElementRef);
  private ngControl = inject(NgControl);
  private errors = inject(FORM_ERRORS);

  ngOnInit(): void {
    const control = this.ngControl.control!;
    const focusout$ = fromEvent(this.elementRef.nativeElement, 'focusout');

    // Listen to both focusout events and status changes
    merge(focusout$, control.statusChanges).subscribe(() => {
      const controlErrors = control.errors;

      if (controlErrors && (control.dirty || control.touched)) {
        const firstKey = Object.keys(controlErrors)[0];
        const getError = this.errors[firstKey];
        const text = this.customErrors()[firstKey] || getError?.(controlErrors[firstKey]);

        this.setError(text);
      } else if (this.ref) {
        this.setError(null);
      }
    });
  }

  private setError(text: string | null): void {
    if (!this.ref) {
      this.ref = this.vcr.createComponent(ValidationError);
    }
    this.ref.setInput('text', text);
  }
}
// #enddocregion directive
// #enddocregion
