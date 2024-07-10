import {Component} from '@angular/core';

@Component({
  template: `
    @if (value(); as root) {
      Root: {{value()}}/{{root}}

      @if (value(); as inner) {
        Inner: {{value()}}/{{root}}/{{inner}}

        @if (value(); as innermost) {
          Innermost: {{value()}}/{{root}}/{{inner}}/{{innermost}}
        }
      }
    }
  `,
})
export class MyApp {
  value = () => 1;
}
