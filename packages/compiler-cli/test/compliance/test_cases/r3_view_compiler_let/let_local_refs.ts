import {Component} from '@angular/core';

@Component({
  template: `
    <input #name>
    <input #lastName>

    @let fullName = name.value + ' ' + lastName.value;
    Hello, {{fullName}}
  `,
})
export class MyApp {}
