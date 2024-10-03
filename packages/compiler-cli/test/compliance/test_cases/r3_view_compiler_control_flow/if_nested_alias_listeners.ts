import {Component} from '@angular/core';

@Component({
    template: `
    @if (value(); as root) {
      <button (click)="log(value(), root)"></button>

      @if (value(); as inner) {
        <button (click)="log(value(), root, inner)"></button>

        @if (value(); as innermost) {
          <button (click)="log(value(), root, inner, innermost)"></button>
        }
      }
    }
  `,
    standalone: false
})
export class MyApp {
  value = () => 1;
  log(..._: any[]) {}
}
