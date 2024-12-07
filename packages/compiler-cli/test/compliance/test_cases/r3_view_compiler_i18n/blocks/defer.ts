import {Component} from '@angular/core';

@Component({
    template: `
    <div i18n>
      Content:
      @defer (when isLoaded) {
        before<span>middle</span>after
      } @placeholder {
        before<div>placeholder</div>after
      } @loading {
        before<button>loading</button>after
      } @error {
        before<h1>error</h1>after
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  isLoaded = false;
}
