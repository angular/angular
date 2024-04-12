import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {HeroDetailComponent} from '../hero-detail/hero-detail.component';
import {Hero} from '../hero';
import {HEROES} from '../mock-heroes';

@Component({
  standalone: true,
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
  imports: [HeroDetailComponent, NgFor],
})
export class HeroesComponent {
  heroes = HEROES;

  selectedHero!: Hero;

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }
}
