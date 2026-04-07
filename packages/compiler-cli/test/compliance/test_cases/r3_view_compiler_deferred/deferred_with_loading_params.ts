import {Component} from '@angular/core';

@Component({
    template: `
    @defer {
      <button></button>
    } @loading(minimum 2s; after 500ms) {
      <img src="loading.gif">
    }
  `,
    standalone: false
})
export class MyApp {
}
