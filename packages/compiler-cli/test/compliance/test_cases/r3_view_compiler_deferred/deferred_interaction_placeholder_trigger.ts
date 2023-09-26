import {Component} from '@angular/core';

@Component({
  template: `
    {{message}}
    @defer (on interaction(button); prefetch on interaction(button)) {
      Main
    } @placeholder {
      <div>
        <div>
          <button #button>Click me</button>
        </div>
      </div>
    }
  `,
})
export class MyApp {
  message = 'hello';
}
