import {Component} from '@angular/core';

@Component({
  template: `
    <ng-template>
      {{message}}
      <button #button>Click me</button>

      <ng-template>
        <ng-template>
          {#defer on interaction(button); prefetch on interaction(button)}{/defer}
        </ng-template>
      </ng-template>
    </ng-template>
  `,
})
export class MyApp {
  message = 'hello';
}
