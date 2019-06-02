// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'app-hero-birthday2',
  // #docregion template
  template: `
    <p>The hero's birthday is {{ birthday | date:format }}</p>
    <button (click)="toggleFormat()">Toggle Format</button>
  `
  // #enddocregion template
})
// #docregion class
export class HeroBirthday2Component {
  birthday = new Date(1988, 3, 15); // April 15, 1988
  toggle = true; // 기본 형식을 shortDate로 지정하기 위해 true 값을 할당합니다.

  get format()   { return this.toggle ? 'shortDate' : 'fullDate'; }
  toggleFormat() { this.toggle = !this.toggle; }
}
