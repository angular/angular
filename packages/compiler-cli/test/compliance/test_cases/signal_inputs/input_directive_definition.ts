import {Directive, input} from '@angular/core';

@Directive({
  standalone: true,
})
export class TestDir {
  counter = input(0);
  name = input.required<string>();
}
