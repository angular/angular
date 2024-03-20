// #docplaster
import { Component } from '@angular/core';

// #docregion standalonedeclaration
@Component({
  selector: 'app-component-overview',
  template: '<h1>Hello World!</h1>',
  styles: ['h1 { font-weight: normal; }'],
  standalone: true
})
// #enddocregion standalonedeclaration

export class ComponentOverviewComponent {

}

