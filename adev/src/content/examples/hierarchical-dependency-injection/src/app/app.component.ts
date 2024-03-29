import {NgIf} from '@angular/common';
import {Component} from '@angular/core';
import {CarsComponent} from './car.components';
import {HeroesListComponent} from './heroes-list.component';
import {VillainsListComponent} from './villains-list.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <label for="showHeroes">
      <input id="showHeroes" type="checkbox" [checked]="showHeroes" (change)="showHeroes=!showHeroes">
      Heroes
    </label>
    <label for="showVillains">
      <input id="showVillains" type="checkbox" [checked]="showVillains" (change)="showVillains=!showVillains">
      Villains
    </label>
    <label for="showCars">
      <input id="showCars" type="checkbox" [checked]="showCars" (change)="showCars=!showCars">
      Cars
    </label>

    <h1>Hierarchical Dependency Injection</h1>

    @if (showHeroes) {<app-heroes-list></app-heroes-list>}
    @if (showVillains) {<app-villains-list></app-villains-list>}
    @if (showCars) {<app-cars></app-cars>}
  `,
  imports: [NgIf, CarsComponent, HeroesListComponent, VillainsListComponent],
})
export class AppComponent {
  showCars = true;
  showHeroes = true;
  showVillains = true;
}
