// #docregion
// #docregion metadata
import { Component } from '@angular/core';

@Component({
  selector: 'hero-view',
  template: '<h1>{{title}}: {{getName()}}</h1>'
})
// #docregion appexport, class
export class HeroComponent {
  title = 'Hero Detail';
  getName() {return 'Windstorm'; }
}
// #enddocregion appexport, class
// #enddocregion metadata
