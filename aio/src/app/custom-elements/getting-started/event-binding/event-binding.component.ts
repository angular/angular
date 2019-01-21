import { Component } from '@angular/core';

@Component({
  selector: 'aio-gs-event-binding',
  template: `
    <aio-gs-container>
      <ng-container class="template">&lt;button (click)="greet(name)"&gt;
  Greet
&lt;/button&gt;</ng-container>

      <ng-container class="data">
        name = '<input #input (input)="name = input.value" [value]="name">';
      </ng-container>

      <ng-container class="result">
        <button (click)="greet(name)">
          Greet
        </button>
      </ng-container>
    </aio-gs-container>
  `,
  preserveWhitespaces: true
})
export class EventBindingComponent {
  name = 'Angular';

  greet(name: string) {
    window.alert(`Hello, ${name}!`);
  }
}
