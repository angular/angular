import {Component} from '@angular/core';

@Component({
  template: `
    {{message}}
    @defer (on interaction(button); prefetch on interaction(button)) {}

    <div>
      <div>
        <div>
          <button #button>Click me</button>
        </div>
      </div>
    </div>
  `,
})
export class MyApp {
  message = 'hello';
}
