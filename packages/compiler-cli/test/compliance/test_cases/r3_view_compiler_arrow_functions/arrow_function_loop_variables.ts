import {Component} from '@angular/core';

@Component({
  template: `
    @for (item of items; track $index; let outerEven = $even) {
      @for (subitem of item.subItems; track $index) {
        {{(() => outerEven || $even || $index)()}}
      }
    }
  `
})
export class TestComp {
  items = [
    {name: 'one', subItems: ['sub one', 'sub two', 'sub three']},
    {name: 'two', subItems: ['sub one', 'sub two', 'sub three']},
    {name: 'three', subItems: ['sub one', 'sub two', 'sub three']},
  ];
}
