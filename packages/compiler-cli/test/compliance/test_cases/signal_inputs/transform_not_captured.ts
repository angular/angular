import {Directive, input} from '@angular/core';

function convertToBoolean(value: string|boolean) {
  return value === true || value !== '';
}

@Directive({
  standalone: true,
})
export class TestDir {
  name = input.required<boolean, string|boolean>({
    transform: convertToBoolean,
  });
}
