import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      {{message}}
      {#if value()}hello{/if}
    </div>
  `,
})
export class MyApp {
  message = 'hello';
  value = () => 1;
}
