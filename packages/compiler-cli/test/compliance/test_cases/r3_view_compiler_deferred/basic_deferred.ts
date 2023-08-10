import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      {{message}}
      {#defer}Deferred content{/defer}
    </div>
  `,
})
export class MyApp {
  message = 'hello';
}
