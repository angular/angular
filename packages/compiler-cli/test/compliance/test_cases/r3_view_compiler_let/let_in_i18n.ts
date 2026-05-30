import {Component} from '@angular/core';

@Component({
  template: `
    <div i18n>
      @let result = value * 2;
      The result is {{result}}
    </div>
  `,
})
export class MyApp {
  value = 1;
}
