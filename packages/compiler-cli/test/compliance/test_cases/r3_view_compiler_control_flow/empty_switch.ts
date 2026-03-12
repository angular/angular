import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @switch (message) {}
      {{message}}
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
}
