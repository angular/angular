import {Directive, input} from '@angular/core';

@Directive({
})
export class TestDir {
  counter = input(0);
  name = input.required<string>();
}
