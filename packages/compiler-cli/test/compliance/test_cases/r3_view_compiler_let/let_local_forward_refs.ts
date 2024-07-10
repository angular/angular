import {Component} from '@angular/core';

@Component({
  template: `
    @let message = 'Hello, ' + name.value;
    {{message}}
    <input #name>
  `,
  standalone: true,
})
export class MyApp {}
