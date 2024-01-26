import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      {{message}}
      @switch (message) {}
      {{message}}
    </div>
  `,
})
export class MyApp {
  message = 'hello';
}
