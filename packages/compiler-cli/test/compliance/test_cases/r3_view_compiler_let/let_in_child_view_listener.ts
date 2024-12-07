import {Component} from '@angular/core';

@Component({
  template: `
    @let one = value + 1;

    <ng-template>
      @let two = one + 1;

      @if (true) {
        @let three = two + 1;

        @switch (1) {
          @case (1) {
            @let four = three + 1;
            <button (click)="callback(one, two, three, four)"></button>
          }
        }
      }
    </ng-template>
  `,
})
export class MyApp {
  value = 1;

  callback(one: number, two: number, three: number, four: number) {
    console.log(one, two, three, four);
  }
}
