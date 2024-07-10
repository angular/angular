import {Directive, model} from '@angular/core';

@Directive({
  standalone: true,
})
export class TestDir {
  counter = model(0);
  name = model.required<string>();
}
