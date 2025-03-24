import {Component, Directive, model, signal} from '@angular/core';

@Directive({
  selector: '[ngModel]',
})
export class NgModelDirective {
  ngModel = model.required<string>();
}

@Component({
  template: `
    @for (name of names; track $index) {
      <input [(ngModel)]="name" />
    }
  `,
  imports: [NgModelDirective],
})
export class TestCmp {
  names = [signal('Angular')];
}
