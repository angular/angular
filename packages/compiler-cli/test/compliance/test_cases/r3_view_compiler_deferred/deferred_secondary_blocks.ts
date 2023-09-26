import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      {{message}}
      @defer {
        <button></button>
      } @loading {
        {{loadingMessage}}
      } @placeholder {
        <img src="loading.gif">
      } @error {
        Calendar failed to load <i>sad</i>
      }
    </div>
  `,
})
export class MyApp {
  message = 'hello';
  loadingMessage = 'Calendar is loading';
}
