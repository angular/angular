import {Component, Directive, model, signal} from '@angular/core';

@Directive({
  selector: '[ngModel]',
  standalone: true,
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
  standalone: true,
  imports: [NgModelDirective],
})
export class TestCmp {
  names = [signal('Angular')];
}
