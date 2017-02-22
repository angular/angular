// #docregion
import { Component }   from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'hero-di',
  template: `<h1>Hero: {{name}}</h1>`
})
export class HeroComponent {
  name = '';
  constructor(dataService: DataService) {
    this.name = dataService.getHeroName();
  }
}
// #enddocregion
