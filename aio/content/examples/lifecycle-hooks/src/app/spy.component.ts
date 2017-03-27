// #docregion
import { Component } from '@angular/core';

import { LoggerService }  from './logger.service';

@Component({
  selector: 'spy-parent',
  templateUrl: './spy.component.html',
  styles: [
     '.parent {background: khaki;}',
     '.heroes {background: LightYellow; padding: 0 8px}'
  ],
  providers:  [LoggerService]
})
export class SpyParentComponent {
  newName = 'Herbie';
  heroes: string[] = ['Windstorm', 'Magneta'];
  spyLog: string[];

  constructor(private logger: LoggerService) {
    this.spyLog = logger.logs;
  }

  addHero() {
    if (this.newName.trim()) {
      this.heroes.push(this.newName.trim());
      this.newName = '';
      this.logger.tick();
    }
  }
  removeHero(hero: string) {
    this.heroes.splice(this.heroes.indexOf(hero), 1);
    this.logger.tick();
  }
  reset() {
    this.logger.log('-- reset --');
    this.heroes.length = 0;
    this.logger.tick();
  }
}
