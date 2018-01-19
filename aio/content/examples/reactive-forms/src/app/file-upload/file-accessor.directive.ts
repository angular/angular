// #docregion import
import { Directive, HostListener } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
// #enddocregion import

// #docregion v1
@Directive({
  selector: 'input[type=file]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: FileAccessorDirective, multi: true }
  ]
})
export class FileAccessorDirective implements ControlValueAccessor {
  value: FileList;
  onChange = (_) => { };
  onTouched = () => { };

  writeValue(value) { }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }

  @HostListener('change', ['$event']) onValueChange($event) {
    this.onChange($event.target.files);
    this.onTouched();
  }
}
// #enddocregion v1
