export interface ControlValueAccessor {
  writeValue(obj: any): void;
  registerOnChange(fun: any): void;
}