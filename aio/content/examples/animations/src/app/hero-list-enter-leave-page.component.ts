import { Component } from '@angular/core';
import { HEROES } from './mock-heroes';

@Component({
  selector: 'app-hero-list-enter-leave-page',
  template: `
    <section>
      <h2>Enter/Leave</h2>

      <app-hero-list-enter-leave [heroes]="heroes" (remove)="onRemove($event)"></app-hero-list-enter-leave>
    </section>
  `
})
export class HeroListEnterLeavePageComponent {
  heroes = HEROES.slice();

  onRemove(id: number) {
    this.heroes = this.heroes.filter(hero => hero.id !== id);
  }
}
