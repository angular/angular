import {Component} from '@angular/core';

@Component({
    template: `
    @repeat (columns; let i = $index, co = $count, f = $first, l = $last, ev = $even, o = $odd) {
      {{i}}/{{co}}/{{f}}/{{l}}/{{ev}}/{{o}}
    }
  `,
    standalone: false
})
export class MyApp {
  columns = 4;
}
