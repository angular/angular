import {booleanAttribute, Directive, input, model, output} from '@angular/core';

@Directive({
  selector: '[signalApis]',
})
export class SignalApisDirective {
  // Signal input, required signal input, aliased + transformed input.
  value = input('');
  id = input.required<string>();
  disabled = input(false, {alias: 'isDisabled', transform: booleanAttribute});

  // Two-way model and an event output.
  checked = model(false);
  changed = output<string>();
}
