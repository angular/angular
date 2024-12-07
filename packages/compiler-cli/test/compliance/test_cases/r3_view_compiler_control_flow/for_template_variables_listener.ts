import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @for (item of items; track item; let ev = $even) {
        <div (click)="log($index, ev, $first, $count)"></div>
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  items = [];
  log(..._: any[]) {}
}
