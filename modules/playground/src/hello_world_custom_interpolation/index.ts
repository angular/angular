import {bootstrap} from 'angular2/bootstrap';
import {Component, View} from 'angular2/core';

export function main() {
  bootstrap(HelloCmp);
}

@Component({selector: 'hello-app'})
@View({
  template: `<div class="greeting">[[greeting]] world!</div>
           <button class="changeButton" (click)="changeGreeting()">change greeting</button>`,
  interpolationPattern: '\\[\\[(.*?)\\]\\]'
})
export class HelloCmp {
  greeting: string;
  constructor() { this.greeting = 'hello'; }
  changeGreeting(): void { this.greeting = 'howdy'; }
}
