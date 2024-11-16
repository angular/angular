import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @for (item of items; track item) {
        {{item.name}}
        @for (subitem of item.subItems; track $index) {
          {{subitem}} from {{item.name}}
        }
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  items = [
    {name: 'one', subItems: ['sub one', 'sub two', 'sub three']},
    {name: 'two', subItems: ['sub one', 'sub two', 'sub three']},
    {name: 'three', subItems: ['sub one', 'sub two', 'sub three']},
  ];
}
