import {Component, provide} from 'angular2/core';
import {bootstrap} from 'angular2/bootstrap';

// #docregion LowerUpperPipe
@Component({
  selector: 'lowerupper-example',
  template: `<div>
    <label>Name: </label><input #name (keyup)="change(name.value)" type="text">
    <p>In lowercase: <pre>'{{value | lowercase}}'</pre></p>
    <p>In uppercase: <pre>'{{value | uppercase}}'</pre></p>
  </div>`
})
export class LowerUpperPipeExample {
  value: string;
  change(value) { this.value = value; }
}
// #enddocregion

@Component({
  selector: 'example-app',
  directives: [LowerUpperPipeExample],
  template: `
    <h1>LowercasePipe &amp; UppercasePipe Example</h1>
    <lowerupper-example></lowerupper-example>
  `
})
export class AppCmp {
}

export function main() {
  bootstrap(AppCmp);
}
