// #docplaster
// #docregion
import { Component } from '@angular/core';

@Component({
// #enddocregion
  selector: 'app-template-name',
// #docregion
  template: `
    Name: <input type="text" [(ngModel)]="name">
  `
})
export class TemplateNameComponent {
  name = '';
}
// #enddocregion
