// #docregion
import {Component, inject, OnInit, signal} from '@angular/core';
import {ControlValueAccessor, NgControl, FormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

// #docregion ngcontrol
@Component({
  selector: 'app-custom-input',
  imports: [FormsModule],
  templateUrl: './custom-input.html',
  styleUrls: ['./custom-input.css'],
  host: {
    '(blur)': 'markAsTouched()',
  },
})
export class CustomInput implements ControlValueAccessor, OnInit {
  // Inject NgControl to access the form control
  private readonly ngControl = inject(NgControl, {self: true});

  // Signals for validation state
  firstError = signal<string | null>(null);

  constructor() {
    // Register this component as the value accessor
    this.ngControl.valueAccessor = this;
  }

  ngOnInit(): void {
    const control = this.ngControl.control!;

    // Subscribe to control state changes
    const controlEvents$ = control.events.pipe(takeUntilDestroyed());

    controlEvents$.subscribe(() => {
      const hasError = control.invalid && (control.dirty || control.touched) && control.errors;

      this.firstError.set(hasError ? Object.keys(control.errors)[0] : null);
    });
  }

  // #enddocregion ngcontrol

  value = signal('');
  disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
    this.onChange(this.value());
  }

  markAsTouched(): void {
    this.onTouched();
  }
}
// #enddocregion
