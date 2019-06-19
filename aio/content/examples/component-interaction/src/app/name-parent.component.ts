// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'app-name-parent',
  template: `
  <h2>Master controls {{names.length}} names</h2>
  <app-name-child *ngFor="let name of names" [name]="name"></app-name-child>
  `
})
export class NameParentComponent {
  // 'Dr IQ', '<빈 값>', 'Bombasto'를 표시합니다.
  names = ['Dr IQ', '   ', '  Bombasto  '];
}
// #enddocregion
