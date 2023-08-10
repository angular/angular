import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      {{message}}
      {#defer}
        <calendar-cmp/>
        {:loading} {{loadingMessage}}
        {:placeholder} <img src="loading.gif">
        {:error} Calendar failed to load <icon>sad</icon>
      {/defer}
    </div>
  `,
})
export class MyApp {
  message = 'hello';
  loadingMessage = 'Calendar is loading';
}
