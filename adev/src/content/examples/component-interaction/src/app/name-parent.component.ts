// #docregion
import {Component} from '@angular/core';

@Component({
  selector: 'app-name-parent',
  template: `
    <h2>Master controls {{names.length}} names</h2>
    
    @for (name of names; track name) {
      <app-name-child [name]="name"></app-name-child>
    }
    `,
})
export class NameParentComponent {
  // Displays 'Dr. IQ', '<no name set>', 'Bombasto'
  names = ['Dr. IQ', '   ', '  Bombasto  '];
}
// #enddocregion
