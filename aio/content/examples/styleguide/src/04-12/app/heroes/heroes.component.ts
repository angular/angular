import { Component } from '@angular/core';

import { LoggerService } from '../core/logger.service';

@Component({
  selector: 'toh-heroes',
  templateUrl: './heroes.component.html'
})
export class HeroesComponent {
  heroes: any[] = [];

  constructor(private loggerService: LoggerService) { }

  getHeroes() {
    this.loggerService.log(`Getting heroes`);
    this.heroes = [
      { id: 1, name: 'Windstorm' },
      { id: 2, name: 'Bombasto' },
      { id: 3, name: 'Magneta' },
      { id: 4, name: 'Tornado' }
    ];
    this.loggerService.log(`We have ${HeroesComponent.length} heroes`);
  }
}
