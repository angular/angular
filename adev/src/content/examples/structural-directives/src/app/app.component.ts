import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {heroSwitchComponents} from './hero-switch.components';
import {HeroComponent} from './hero.component';
import {TrigonometryDirective} from './trigonometry.directive';

import {Hero, heroes} from './hero';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, FormsModule, heroSwitchComponents, HeroComponent, TrigonometryDirective],
})
export class AppComponent {
  heroes = heroes;
  hero: Hero | null = this.heroes[0];
  // #docregion condition
  condition = false;
  // #enddocregion condition
  logs: string[] = [];
  showSad = true;
  status = 'ready';

  trackById(index: number, hero: Hero): number {
    return hero.id;
  }
}
