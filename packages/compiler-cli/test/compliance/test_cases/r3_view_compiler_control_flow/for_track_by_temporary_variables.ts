import {Component} from '@angular/core';

@Component({
  template: `
    @for (item of items; track item?.name?.[0]?.toUpperCase() ?? foo) {}
    @for (item of items; track item.name ?? $index ?? foo) {}
  `,
})
export class MyApp {
  foo: any;
  items: {name?: string}[] = [];
}
