import {Component} from '@angular/core';

@Component({
  template: `
    {#defer}
      <calendar-cmp/>
      {:placeholder minimum 2s} <img src="placeholder.gif">
    {/defer}
  `,
})
export class MyApp {
}
