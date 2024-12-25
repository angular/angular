import {Component} from '@angular/core';

@Component({
    template: `
    @for (item of 1...5; track $index) {
      {{$odd + ''}}
    }

    @for (item of 2...8:2; track $index) {
      {{$odd + ''}}
    }

    @for (item of fromNumber...toNumber:step; track $index) {
      {{$odd + ''}}
    }

    @for (item of (fromNumber+1)...(toNumber+1):(step+1); track $index) {
      {{$odd + ''}}
    }
  `,
})
export class MyApp {
  fromNumber = 2;
  toNumber = 10
  step = 2;
}
