import {Component} from '@angular/core';

@Component({
    template: `
    @for (item of items; track item.name[0].toUpperCase()) {
      {{item.name}}
    }

    @for (otherItem of otherItems; track otherItem.name[0].toUpperCase()) {
      {{otherItem.name}}
    }
  `,
    standalone: false
})
export class MyApp {
  items = [{name: 'one'}, {name: 'two'}, {name: 'three'}];
  otherItems = [{name: 'four'}, {name: 'five'}, {name: 'six'}];
}
