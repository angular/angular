import {Component} from '@angular/core';

@Component({
    template: `
    @repeat (3; let col = $index) {
      {{col}}
    }
  `,
    standalone: false
})
export class MyApp {}
