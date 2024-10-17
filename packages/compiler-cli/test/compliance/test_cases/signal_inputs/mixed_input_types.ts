import {Directive, Input, input} from '@angular/core';

function convertToBoolean(value: string|boolean) {
  return value === true || value !== '';
}

@Directive({
})
export class TestDir {
  counter = input(0);
  signalWithTransform = input(false, {transform: convertToBoolean});
  signalWithTransformAndAlias =
      input(false, {alias: 'publicNameSignal', transform: convertToBoolean});

  @Input() decoratorInput = true;
  @Input('publicNameDecorator') decoratorInputWithAlias = true;
  @Input({alias: 'publicNameDecorator2', transform: convertToBoolean})
  decoratorInputWithTransformAndAlias = true;
}
