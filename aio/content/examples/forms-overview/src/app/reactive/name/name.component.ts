// #docplaster
// #docregion
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
// #enddocregion
  selector: 'app-reactive-name',
// #docregion
  template: `
    Name: <input type="text" [formControl]="name">
  `
})
export class ReactiveNameComponent {
  name = new FormControl('');
}
// #enddocregion
