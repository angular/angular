import {Component} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';

@Component({
  selector: 'hello-app',
  template: `
    <h1>Hello, {{name}}!</h1>
    <label> Say hello to: <input [value]="name" (input)="name = $event.target.value"></label>
`
})
export class HelloCmp {
  name = 'World';
}

bootstrap(HelloCmp);
