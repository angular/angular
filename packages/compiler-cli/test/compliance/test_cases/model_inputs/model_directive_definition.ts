import {Directive, model} from '@angular/core';

@Directive({
})
export class TestDir {
  counter = model(0);
  name = model.required<string>();
}
