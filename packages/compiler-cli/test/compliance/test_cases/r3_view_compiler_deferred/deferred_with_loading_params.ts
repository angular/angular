import {Component} from '@angular/core';

@Component({
  template: `
    {#defer}
      <calendar-cmp/>
      {:loading minimum 2s; after 500ms} <img src="loading.gif">
    {/defer}
  `,
})
export class MyApp {
}
