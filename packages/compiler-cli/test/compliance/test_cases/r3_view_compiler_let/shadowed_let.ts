import {Component} from '@angular/core';

@Component({
  template: `
    @let value = 'parent';

    @if (true) {
      @let value = 'local';
      The value comes from {{value}}
    }
  `,
  standalone: true,
})
export class MyApp {}
